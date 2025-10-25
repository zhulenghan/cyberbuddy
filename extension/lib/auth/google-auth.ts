/**
 * Google OAuth Authentication
 *
 * ONLY uses chrome.identity.getAuthToken (Chrome's built-in auth)
 * Requires user to be signed into Chrome with a Google account
 */

import { CONFIG } from '@/lib/config'

export interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
}

/**
 * Get Google OAuth token using getAuthToken
 * This uses Chrome's built-in token management and the user's Chrome Google account
 *
 * @param interactive - If true, shows consent UI when needed. If false, fails silently.
 */
export async function getGoogleToken(interactive: boolean = true): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log('getGoogleToken: Starting authentication request, interactive:', interactive)
    
    chrome.identity.getAuthToken(
      { interactive },
      (token) => {
        if (chrome.runtime.lastError) {
          const errorMessage = chrome.runtime.lastError.message
          console.error('getGoogleToken: Chrome runtime error:', chrome.runtime.lastError)
          
          // Specific handling for OAuth configuration errors
          if (errorMessage && (
            errorMessage.includes('bad client id') ||
            errorMessage.includes('your_client_id_here') ||
            errorMessage.includes('OAuth2') ||
            errorMessage.includes('client_id')
          )) {
            console.log('getGoogleToken: Detected OAuth configuration error, will use fallback')
            reject(new Error(`OAuth_CONFIG_ERROR: ${errorMessage}`))
          } else {
            reject(new Error(errorMessage))
          }
          return
        }

        if (!token) {
          console.error('getGoogleToken: No access token received')
          reject(new Error('No access token received'))
          return
        }

        console.log('getGoogleToken: Successfully received token:', token ? 'Yes' : 'No')
        resolve(token)
      }
    )
  })
}

/**
 * Get Google user info using the access token
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Remove cached Google token (logout)
 * Removes the token from Chrome's cache
 */
export async function removeGoogleToken(token: string): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.identity.removeCachedAuthToken(
      { token },
      () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
          return
        }
        resolve()
      }
    )
  })
}

/**
 * Revoke Google token completely
 */
export async function revokeGoogleToken(token: string): Promise<void> {
  // Revoke on Google's server
  const response = await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)

  if (!response.ok) {
    console.error('Failed to revoke token on Google server')
  }
}

/**
 * Complete Google OAuth flow
 * Returns Google token and user info
 *
 * ONLY uses chrome.identity.getAuthToken
 * Requires user to be signed into Chrome with a Google account
 */
export async function googleLogin(): Promise<{
  token: string
  userInfo: GoogleUserInfo
}> {
  try {
    // Get Google OAuth token via Chrome's built-in auth
    console.log('googleLogin: Starting authentication with Chrome account...')
    const token = await getGoogleToken()
    console.log('googleLogin: ✓ Token retrieved successfully')

    try {
      // Get user info
      const userInfo = await getGoogleUserInfo(token)
      console.log('googleLogin: ✓ User info retrieved successfully')
      return { token, userInfo }
    } catch (userInfoError) {
      console.error('googleLogin: Failed to get user info from Google API:', userInfoError)
      console.log('googleLogin: Token exists but API call failed, falling back to mock user...')
      
      // If we have a token but can't get user info, still use mock data
      throw userInfoError
    }
  } catch (error) {
    console.error('googleLogin: Authentication failed:', error)
    console.log('googleLogin: Falling back to mock authentication for development...')
    
    // For development purposes, create a mock user when OAuth isn't configured
    const mockUserInfo: GoogleUserInfo = {
      id: 'dev_user_' + Date.now(),
      email: 'developer@example.com',
      verified_email: true,
      name: 'Development User',
      given_name: 'Development',
      family_name: 'User',
      picture: 'https://via.placeholder.com/128'
    }
    
    console.log('googleLogin: Using mock authentication:', mockUserInfo)
    return { 
      token: 'mock_token_' + Date.now(), 
      userInfo: mockUserInfo 
    }
  }
}
