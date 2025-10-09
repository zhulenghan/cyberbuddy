/**
 * Google OAuth Authentication using chrome.identity.launchWebAuthFlow
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
 * Get Google OAuth token using launchWebAuthFlow
 * This works with Web Application OAuth clients
 */
export async function getGoogleToken(): Promise<string> {
  const redirectUri = chrome.identity.getRedirectURL()

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', CONFIG.GOOGLE_CLIENT_ID)
  authUrl.searchParams.set('response_type', 'token')
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ].join(' '))

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl.toString(),
        interactive: true,
      },
      (responseUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
          return
        }

        if (!responseUrl) {
          reject(new Error('No response URL'))
          return
        }

        // Extract access token from response URL
        // Format: redirect_uri#access_token=TOKEN&token_type=Bearer&expires_in=3599
        const url = new URL(responseUrl)
        const hash = url.hash.substring(1) // Remove #
        const params = new URLSearchParams(hash)
        const token = params.get('access_token')

        if (!token) {
          reject(new Error('No access token in response'))
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
 */
export async function removeGoogleToken(token: string): Promise<void> {
  // launchWebAuthFlow doesn't cache tokens like getAuthToken
  // So we just need to revoke on Google's server
  return Promise.resolve()
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
 */
export async function googleLogin(): Promise<{
  token: string
  userInfo: GoogleUserInfo
}> {
  // Get Google OAuth token
  const token = await getGoogleToken()

  // Get user info
  const userInfo = await getGoogleUserInfo(token)

  return { token, userInfo }
}
