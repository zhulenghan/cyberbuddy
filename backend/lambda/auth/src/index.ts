import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

const TABLE_NAME = process.env.TABLE_NAME!
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_ACCESS_EXPIRY = '7d' // 7 days for access token
const JWT_REFRESH_EXPIRY = '30d' // 30 days for refresh token

interface GoogleTokenPayload {
  googleToken: string
}

interface RefreshTokenPayload {
  refreshToken: string
}

interface JWTPayload {
  userId: string
  email: string
  type: 'access' | 'refresh'
  iat?: number
  exp?: number
}

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2))

  try {
    const path = event.resource
    const method = event.httpMethod

    // Route handling
    if (path === '/auth/google' && method === 'POST') {
      return await handleGoogleAuth(event)
    } else if (path === '/auth/refresh' && method === 'POST') {
      return await handleRefreshToken(event)
    } else if (path === '/auth/logout' && method === 'POST') {
      return await handleLogout(event)
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
 * Handle Google OAuth login
 * Chrome extension uses chrome.identity.getAuthToken() to get Google token
 * Then exchanges it for JWT tokens
 */
async function handleGoogleAuth(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body: GoogleTokenPayload = JSON.parse(event.body || '{}')
  const { googleToken } = body

  if (!googleToken) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Missing googleToken' }),
    }
  }

  try {
    // Verify Google token and get user info
    const userInfo = await verifyGoogleToken(googleToken)

    // Get or create user in DynamoDB
    const userId = await getOrCreateUser(userInfo)

    // Generate JWT tokens
    const accessToken = generateAccessToken(userId, userInfo.email)
    const refreshToken = generateRefreshToken(userId, userInfo.email)

    // Calculate expiry time
    const accessTokenDecoded = jwt.decode(accessToken) as JWTPayload
    const expiresIn = accessTokenDecoded.exp! - Math.floor(Date.now() / 1000)

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        user: {
          id: userId,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn,
          tokenType: 'Bearer',
        },
      }),
    }
  } catch (error) {
    console.error('Google auth error:', error)
    return {
      statusCode: 401,
      headers: corsHeaders(),
      body: JSON.stringify({
        error: 'Authentication failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}

/**
 * Handle token refresh
 */
async function handleRefreshToken(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body: RefreshTokenPayload = JSON.parse(event.body || '{}')
  const { refreshToken } = body

  if (!refreshToken) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Missing refreshToken' }),
    }
  }

  try {
    // Verify refresh token
    const payload = jwt.verify(refreshToken, JWT_SECRET) as JWTPayload

    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type')
    }

    // Generate new access token
    const accessToken = generateAccessToken(payload.userId, payload.email)

    // Calculate expiry time
    const accessTokenDecoded = jwt.decode(accessToken) as JWTPayload
    const expiresIn = accessTokenDecoded.exp! - Math.floor(Date.now() / 1000)

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        accessToken,
        expiresIn,
        tokenType: 'Bearer',
      }),
    }
  } catch (error) {
    console.error('Token refresh error:', error)
    return {
      statusCode: 401,
      headers: corsHeaders(),
      body: JSON.stringify({
        error: 'Invalid refresh token',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}

/**
 * Handle logout
 */
async function handleLogout(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // With JWT, logout is handled client-side by deleting tokens
  // No server-side session to invalidate
  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({ message: 'Logged out successfully' }),
  }
}

/**
 * Generate JWT access token
 */
function generateAccessToken(userId: string, email: string): string {
  return jwt.sign(
    {
      userId,
      email,
      type: 'access',
    } as JWTPayload,
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRY }
  )
}

/**
 * Generate JWT refresh token
 */
function generateRefreshToken(userId: string, email: string): string {
  return jwt.sign(
    {
      userId,
      email,
      type: 'refresh',
    } as JWTPayload,
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRY }
  )
}

/**
 * Verify Google token by calling Google's API
 */
async function verifyGoogleToken(token: string): Promise<{
  email: string
  name: string
  picture: string
}> {
  try {
    // Call Google's userinfo endpoint
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`)
    }

    const data = (await response.json()) as {
      email: string
      name?: string
      given_name?: string
      family_name?: string
      picture?: string
    }

    return {
      email: data.email,
      name: data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim(),
      picture: data.picture || '',
    }
  } catch (error) {
    console.error('Error verifying Google token:', error)
    throw new Error('Invalid Google token')
  }
}

/**
 * Get or create user in DynamoDB
 */
async function getOrCreateUser(userInfo: {
  email: string
  name: string
  picture: string
}): Promise<string> {
  const { email, name, picture } = userInfo

  // Check if user exists
  const result = await dynamoClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${email}`,
        SK: 'PROFILE',
      },
    })
  )

  if (result.Item) {
    // Update last login time
    await dynamoClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${email}`,
          SK: 'PROFILE',
        },
        UpdateExpression: 'SET lastLoginAt = :now, #name = :name, picture = :picture',
        ExpressionAttributeNames: {
          '#name': 'name',
        },
        ExpressionAttributeValues: {
          ':now': new Date().toISOString(),
          ':name': name,
          ':picture': picture,
        },
      })
    )
    return result.Item.userId as string
  }

  // Create new user
  const userId = uuidv4()
  const now = new Date().toISOString()

  await dynamoClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${email}`,
        SK: 'PROFILE',
        userId,
        email,
        name,
        picture,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
        GSI1PK: `USER#${userId}`,
        GSI1SK: 'PROFILE',
      },
    })
  )

  return userId
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
