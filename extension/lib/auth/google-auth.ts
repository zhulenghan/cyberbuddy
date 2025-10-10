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
    chrome.identity.getAuthToken(
      { interactive },
      (token) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
          return
        }

        if (!token) {
          reject(new Error('No access token received'))
          return
        }

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
    console.log('Authenticating with Chrome account...')
    const token = await getGoogleToken()
    console.log('✓ Authentication successful')

    // Get user info
    const userInfo = await getGoogleUserInfo(token)

    return { token, userInfo }
  } catch (error) {
    console.error('Authentication failed:', error)
    throw new Error('Please sign into Chrome with a Google account to use Cyber Buddy.')
  }
}
