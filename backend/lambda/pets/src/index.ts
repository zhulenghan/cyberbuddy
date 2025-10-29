import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { S3Client, PutObjectCommand, HeadObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { GoogleGenAI } from '@google/genai'
import * as crypto from 'crypto'

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const s3Client = new S3Client({})

const TABLE_NAME = process.env.TABLE_NAME!
const BUCKET_NAME = process.env.BUCKET_NAME!
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY || ''

const ai = new GoogleGenAI({
  apiKey: GOOGLE_AI_API_KEY,
})

interface GeneratePetRequest {
  prompt: string
  style?: 'pixel' | '3d'
}

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Pets Lambda - Event:', JSON.stringify(event, null, 2))

  try {
    const path = event.resource
    const method = event.httpMethod

    // Route handling
    if (path === '/pets/random-prompt' && method === 'GET') {
      return await handleRandomPrompt(event)
    } else if (path === '/pets' && method === 'POST') {
      return await handleGeneratePet(event)
    } else if (path === '/pets/{petId}/confirm' && method === 'POST') {
      return await handleConfirmPet(event)
    } else if (path === '/pets/{petId}' && method === 'GET') {
      return await handleGetPet(event)
    } else if (path === '/pets/{petId}' && method === 'DELETE') {
      return await handleDeletePet(event)
    }

    return {
      statusCode: 404,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Not found' }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}

/**
 * Generate a new pet with AI-generated images
 */
async function handleGeneratePet(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body: GeneratePetRequest = JSON.parse(event.body || '{}')
  const { prompt, style = 'pixel' } = body

  if (!prompt) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Missing prompt' }),
    }
  }

  // Get user ID from JWT token
  const userId = getUserIdFromEvent(event)
  if (!userId) {
    return {
      statusCode: 401,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Unauthorized' }),
    }
  }

  try {
    const petId = uuidv4()
    const now = new Date().toISOString()

    // ⭐ Only generate idle state image (base image)
    const imagePrompt = buildImagePrompt(prompt, 'idle', style)
    const imageBuffer = await generateImage(imagePrompt, style)

    // ⭐ Upload to tmp/ directory (temporary storage)
    const tmpKey = `tmp/${petId}/idle.png`
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: tmpKey,
        Body: imageBuffer,
        ContentType: 'image/png',
      })
    )

    // Save pet to DynamoDB (temporary status)
    await dynamoClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `PET#${petId}`,
          SK: 'METADATA',
          petId,
          prompt,
          style,
          images: {
            idle: tmpKey  // ⭐ Only idle image, stored as S3 key
          },
          status: 'temporary',
          createdBy: userId,
          createdAt: now,
          updatedAt: now,
          GSI1PK: `PET#${petId}`,
          GSI1SK: 'METADATA',
        },
      })
    )

    // Generate presigned URL for frontend
    const presignedUrl = await getPresignedUrl(tmpKey)

    // Return pet data
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        id: petId,
        prompt,
        style,
        images: {
          idle: presignedUrl  // ⭐ Only idle image
        },
        status: 'temporary',
        createdAt: now,
      }),
    }
  } catch (error) {
    console.error('Failed to generate pet:', error)
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        error: 'Failed to generate pet',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}

/**
 * Confirm pet and generate all variants using image-to-image
 */
async function handleConfirmPet(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const petId = event.pathParameters?.petId
  const body = JSON.parse(event.body || '{}')
  const { petName } = body

  if (!petId || !petName) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Missing petId or petName' }),
    }
  }

  const userId = getUserIdFromEvent(event)
  if (!userId) {
    return {
      statusCode: 401,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Unauthorized' }),
    }
  }

  try {
    // 1. Get temporary pet
    const petResult = await dynamoClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `PET#${petId}`, SK: 'METADATA' }
      })
    )

    const pet = petResult.Item
    if (!pet || pet.status !== 'temporary') {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Pet not found or already confirmed' }),
      }
    }

    // Check if expired
    if (isExpired(pet.createdAt)) {
      return {
        statusCode: 410,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Pet has expired' }),
      }
    }

    // 2. ⭐ Get base image (idle)
    const idleKey = pet.images.idle
    const idleImageObj = await s3Client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: idleKey
      })
    )
    const baseImageBuffer = Buffer.from(await idleImageObj.Body!.transformToByteArray())

    // 3. ⭐ Generate 4 variants using image-to-image (parallel)
    const allStates = ['idle', 'entertainment', 'focused', 'shopping', 'social']
    const imageBuffers: Record<string, Buffer> = {
      idle: baseImageBuffer  // Base image
    }

    const variantStates = ['entertainment', 'focused', 'shopping', 'social']
    const variantPromises = variantStates.map(async (state) => {
      const variantBuffer = await generateImageVariant(
        baseImageBuffer,
        state,
        pet.prompt,
        pet.style
      )
      return { state, buffer: variantBuffer }
    })

    const variants = await Promise.all(variantPromises)
    for (const { state, buffer } of variants) {
      imageBuffers[state] = buffer
    }

    console.log(`Generated ${variants.length} variants using image-to-image`)

    // 4. ⭐ Save all images to permanent directory (with deduplication)
    const permanentImages: Record<string, string> = {}

    for (const state of allStates) {
      const imageBuffer = imageBuffers[state]
      const imageHash = sha256(imageBuffer)
      const extension = 'png'
      const permanentKey = `pets/${imageHash}.${extension}`

      // Check if already exists (deduplication)
      try {
        await s3Client.send(
          new HeadObjectCommand({
            Bucket: BUCKET_NAME,
            Key: permanentKey
          })
        )
        console.log(`Image already exists (dedup): ${permanentKey}`)
      } catch (err) {
        // Doesn't exist, upload new image
        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: permanentKey,
            Body: imageBuffer,
            ContentType: 'image/png'
          })
        )
        console.log(`Uploaded to permanent storage: ${permanentKey}`)
      }

      permanentImages[state] = permanentKey
    }

    // 5. Delete temporary file
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: idleKey
      })
    )

    // 6. Update Pet status to permanent
    await dynamoClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `PET#${petId}`, SK: 'METADATA' },
        UpdateExpression: 'SET #status = :status, images = :images, updatedAt = :now',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': 'permanent',
          ':images': permanentImages,
          ':now': new Date().toISOString()
        }
      })
    )

    // 7. Create User-Pet relationship
    await dynamoClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${userId}`,
          SK: `PET_REL#${petId}`,
          userId,
          petId,
          petName,
          isActive: true,
          addedAt: new Date().toISOString(),
          lastUsedAt: new Date().toISOString(),
          GSI1PK: `PET#${petId}`,
          GSI1SK: `USER#${userId}`
        }
      })
    )

    // 8. Generate presigned URLs
    const presignedImages = await addPresignedUrls(permanentImages)

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        id: petId,
        name: petName,
        prompt: pet.prompt,
        style: pet.style,
        images: presignedImages,
        createdAt: pet.createdAt || new Date().toISOString(), // Use original creation time
        isActive: true,
      })
    }
  } catch (error) {
    console.error('Failed to confirm pet:', error)
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        error: 'Failed to confirm pet',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}

/**
 * Get pet by ID
 */
async function handleGetPet(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // TODO: Implement get pet
  return {
    statusCode: 501,
    headers: corsHeaders(),
    body: JSON.stringify({ message: 'Get pet - Not implemented yet' }),
  }
}

/**
 * Delete pet
 */
async function handleDeletePet(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // TODO: Implement delete pet
  return {
    statusCode: 501,
    headers: corsHeaders(),
    body: JSON.stringify({ message: 'Delete pet - Not implemented yet' }),
  }
}

/**
 * Build image generation prompt (text-to-image)
 */
function buildImagePrompt(userPrompt: string, state: string, style: 'pixel' | '3d'): string {
  const stateDescriptions: Record<string, string> = {
    idle: 'resting peacefully, calm expression, relaxed pose',
    entertainment: 'joyful and cheerful, big smile, playful pose',
    focused: 'concentrating hard, determined look, working or studying',
    shopping: 'pushing a shopping cart',
    social: 'using a mobile phone to make video calls',
  }

  const stylePrefix = style === 'pixel'
    ? 'pixel art, 16-bit retro game style, colorful'
    : '3D rendered, cute cartoon style, vibrant colors'

  return `${stylePrefix}, ${userPrompt}, ${stateDescriptions[state]}, white background, centered, full body, kawaii, game character design`
}

/**
 * Build image-to-image prompt for generating variants
 */
function buildImage2ImagePrompt(state: string, userPrompt: string): string {
  const stateDescriptions: Record<string, string> = {
    entertainment: 'joyful and cheerful, big smile, playful pose',
    focused: 'concentrating hard, determined look, working or studying',
    shopping: 'pushing a shopping cart',
    social: 'using a mobile phone to make video calls',
  }

  // ⭐ Emphasize keeping same character design, only changing state
  const prompt = `Transform this character to be ${stateDescriptions[state]}.
IMPORTANT:
- Keep the EXACT SAME character design, colors, and style from the input image
- Maintain all unique features and characteristics of the original character
- The background must be white
- Do not add or remove any design elements
Original character description: ${userPrompt}`

  return prompt
}

/**
 * Generate image using Google Gemini 2.5 Flash Image (text-to-image)
 */
async function generateImage(prompt: string, style: 'pixel' | '3d'): Promise<Buffer> {
  if (!GOOGLE_AI_API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY not configured')
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
    })

    // Extract image data from response
    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData?.mimeType?.startsWith('image/')
    )

    if (!imagePart?.inlineData?.data) {
      throw new Error('No image data in response')
    }

    // Return image buffer
    return Buffer.from(imagePart.inlineData.data, 'base64')
  } catch (error) {
    console.error('Image generation failed:', error)
    throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate image variant using image-to-image with Gemini 2.5 Flash Image
 */
async function generateImageVariant(
  baseImageBuffer: Buffer,
  state: string,
  userPrompt: string,
  style: 'pixel' | '3d'
): Promise<Buffer> {
  if (!GOOGLE_AI_API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY not configured')
  }

  try {
    const prompt = buildImage2ImagePrompt(state, userPrompt)

    // ⭐ Use Gemini 2.5 Flash Image for image-to-image generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        prompt,
        {
          inlineData: {
            data: baseImageBuffer.toString('base64'),
            mimeType: 'image/png'
          }
        }
      ],
    })

    // Extract generated image from response
    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData?.mimeType?.startsWith('image/')
    )

    if (!imagePart?.inlineData?.data) {
      throw new Error('No image data in response')
    }

    return Buffer.from(imagePart.inlineData.data, 'base64')
  } catch (error) {
    console.error(`Failed to generate ${state} variant:`, error)
    throw new Error(`Image generation failed for ${state} state: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Utility Functions
 */

// Calculate SHA256 hash for image deduplication
function sha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

// Check if a pet is expired (7 days)
function isExpired(createdAt: string): boolean {
  const created = new Date(createdAt)
  const now = new Date()
  const daysSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  return daysSinceCreation > 7
}

// Generate single presigned URL
async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  return await getSignedUrl(
    s3Client,
    new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }),
    { expiresIn }
  )
}

// Generate presigned URLs for all image states
async function addPresignedUrls(images: Record<string, string>): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  for (const [state, key] of Object.entries(images)) {
    result[state] = await getPresignedUrl(key)
  }
  return result
}

/**
 * Extract user ID from JWT token in Authorization header
 */
function getUserIdFromEvent(event: APIGatewayProxyEvent): string | null {
  // For now, extract from JWT claims if available
  // CDK should configure API Gateway to validate JWT and add claims to requestContext
  const claims = event.requestContext.authorizer?.claims
  if (claims && claims.userId) {
    return claims.userId
  }

  // Fallback: try to decode JWT manually (not recommended for production)
  const authHeader = event.headers.Authorization || event.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
      return payload.userId || null
    } catch {
      return null
    }
  }

  return null
}


/**
 * Generate random pet prompt using Gemini Flash
 */
async function handleRandomPrompt(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    console.log('Generating random pet prompt with Gemini Flash')

    // Call Gemini Flash to generate creative pet ideas
    const prompt = `Generate a cute and adorable virtual pet concept.
You should output ONLY a JSON object with two fields:
1. "coreEntity": A short description of a cute creature (e.g., "a small fluffy cat", "a tiny chubby dragon", "a baby slime")
2. "traits": Adorable visual characteristics and features (e.g., "has big sparkling eyes and wears a tiny bow", "has soft pastel colors and a heart-shaped pattern")

Requirements:
- Focus on CUTE and ADORABLE above all else
- Use simple, friendly creatures (animals, fantasy creatures, food items, etc.)
- Can include light digital/cyber elements, but keep them cute (e.g., "glowing", "holographic", "sparkly") NOT technical jargon
- Avoid weird or complex concepts like "self-aware", "cloud-based", "data packet", etc.
- Think kawaii, chibi, and friendly
- Do NOT include style information (like "pixel art" or "3D") - we'll add that later
- Output ONLY valid JSON, no markdown, no explanation

Example output:
{
  "coreEntity": "a tiny round penguin",
  "traits": "has big sparkly eyes, wears a cozy scarf, and has a little star on its belly"
}`

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    })

    const content = result.candidates?.[0]?.content?.parts?.[0]?.text
    if (!content) {
      throw new Error('No content in AI response')
    }

    console.log('Gemini response:', content)

    // Parse JSON response
    let petIdea
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
      const jsonString = jsonMatch ? jsonMatch[1] : content.trim()
      petIdea = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', content)
      // Fallback to cute hardcoded options
      const fallbackEntities = [
        'a tiny fluffy bunny',
        'a chubby round cat',
        'a smiling baby dragon',
        'a soft pastel slime',
        'a cheerful little bear',
      ]
      const fallbackTraits = [
        'has big sparkling eyes, rosy cheeks, and wears a tiny bow',
        'has soft rainbow-colored fur and a heart-shaped nose',
        'has shimmering scales and carries a small star',
        'has cute little arms, a happy smile, and leaves sparkles behind',
        'wears a cozy scarf, has fluffy ears, and a little crown',
      ]
      petIdea = {
        coreEntity: fallbackEntities[Math.floor(Math.random() * fallbackEntities.length)],
        traits: fallbackTraits[Math.floor(Math.random() * fallbackTraits.length)],
      }
    }

    // Validate response
    if (!petIdea.coreEntity || !petIdea.traits) {
      throw new Error('Invalid pet idea structure')
    }

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify(petIdea),
    }
  } catch (error) {
    console.error('Random prompt generation error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        error: 'Failed to generate random prompt',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}

/**
 * CORS headers
 */
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Content-Type': 'application/json',
  }
}
