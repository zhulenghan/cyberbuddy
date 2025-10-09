import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GetUserCommand,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

const cognitoClient = new CognitoIdentityProviderClient({})
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

const TABLE_NAME = process.env.TABLE_NAME!
const USER_POOL_ID = process.env.USER_POOL_ID!
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID!

interface GoogleTokenPayload {
  googleToken: string
}

interface RefreshTokenPayload {
  refreshToken: string
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
 * Then exchanges it for Cognito credentials
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

  // In production, you would:
  // 1. Verify Google token with Google's API
  // 2. Extract user info (email, name, etc.)
  // 3. Create or get existing Cognito user
  // 4. Return Cognito tokens

  // For now, we'll implement a simplified version
  // that assumes Google token is valid and contains user email

  try {
    // Verify Google token (simplified - in production use Google API)
    const userInfo = await verifyGoogleToken(googleToken)

    // Get or create user in Cognito
    const userId = await getOrCreateUser(userInfo)

    // Create session in DynamoDB
    const sessionId = uuidv4()
    await createSession(userId, sessionId)

    // In a real implementation, you'd return actual Cognito tokens
    // For now, return a mock token structure
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
          accessToken: `mock-access-token-${sessionId}`,
          refreshToken: `mock-refresh-token-${sessionId}`,
          idToken: `mock-id-token-${sessionId}`,
          expiresIn: 3600,
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

  // In production: validate refresh token with Cognito and issue new access token
  // For now: mock response
  const sessionId = refreshToken.replace('mock-refresh-token-', '')

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({
      tokens: {
        accessToken: `mock-access-token-refreshed-${sessionId}`,
        idToken: `mock-id-token-refreshed-${sessionId}`,
        expiresIn: 3600,
      },
    }),
  }
}

/**
 * Handle logout
 */
async function handleLogout(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // In production: invalidate Cognito session
  // For now: return success
  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({ message: 'Logged out successfully' }),
  }
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
        GSI1PK: `USER#${userId}`,
        GSI1SK: 'PROFILE',
      },
    })
  )

  return userId
}

/**
 * Create session in DynamoDB
 */
async function createSession(userId: string, sessionId: string): Promise<void> {
  const now = new Date().toISOString()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days

  await dynamoClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${userId}`,
        SK: `SESSION#${sessionId}`,
        sessionId,
        userId,
        createdAt: now,
        expiresAt,
      },
    })
  )
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
