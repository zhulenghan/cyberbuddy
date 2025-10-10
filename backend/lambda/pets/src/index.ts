import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { GoogleGenAI } from '@google/genai'

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
    if (path === '/pets' && method === 'POST') {
      return await handleGeneratePet(event)
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

    // Generate images for different states
    const states = ['idle', 'happy', 'focused', 'tired', 'excited']
    const images: Record<string, string> = {}

    // For MVP, generate only idle state image
    // TODO: Generate all states in parallel
    const imagePrompt = buildImagePrompt(prompt, 'idle', style)
    const imageUrl = await generateImage(imagePrompt, style)

    // For now, use the same image for all states
    for (const state of states) {
      images[state] = imageUrl
    }

    // Save pet to DynamoDB
    await dynamoClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${userId}`,
          SK: `PET#${petId}`,
          petId,
          userId,
          prompt,
          style,
          images,
          createdAt: now,
          updatedAt: now,
          isActive: false,
          GSI1PK: `PET#${petId}`,
          GSI1SK: 'METADATA',
        },
      })
    )

    // Return pet data
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        id: petId,
        prompt,
        style,
        images,
        createdAt: now,
        isActive: false,
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
 * Build image generation prompt
 */
function buildImagePrompt(userPrompt: string, state: string, style: 'pixel' | '3d'): string {
  const stateDescriptions: Record<string, string> = {
    idle: 'standing still, neutral expression',
    happy: 'smiling, energetic pose',
    focused: 'concentrating, determined look',
    tired: 'yawning, relaxed pose',
    excited: 'jumping, very happy expression',
  }

  const stylePrefix = style === 'pixel'
    ? 'pixel art, 16-bit retro game style, colorful'
    : '3D rendered, cute cartoon style, vibrant colors'

  return `${stylePrefix}, ${userPrompt}, ${stateDescriptions[state]}, white background, centered, full body, kawaii, game character design`
}

/**
 * Generate image using Google Gemini 2.5 Flash Image
 */
async function generateImage(prompt: string, style: 'pixel' | '3d'): Promise<string> {
  if (!GOOGLE_AI_API_KEY) {
    console.warn('GOOGLE_AI_API_KEY not set, using placeholder')
    return 'https://via.placeholder.com/512x512?text=Pet'
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

    // Upload base64 image to S3
    const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64')
    const imageKey = `pets/${uuidv4()}.png`

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: imageKey,
        Body: imageBuffer,
        ContentType: imagePart.inlineData.mimeType,
      })
    )

    // Generate presigned URL (valid for 7 days)
    const presignedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: imageKey,
      }),
      { expiresIn: 7 * 24 * 60 * 60 } // 7 days
    )

    return presignedUrl
  } catch (error) {
    console.error('Image generation failed:', error)
    // Fallback to placeholder
    return 'https://via.placeholder.com/512x512?text=Pet'
  }
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
