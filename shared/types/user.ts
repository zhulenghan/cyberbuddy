/**
 * User-related types
 */

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
  subscription: 'free' | 'premium'
  generationsRemaining: number
}

export interface UserPreferences {
  language: 'en' | 'zh'
  petPosition: { x: number; y: number }
  enableNotifications: boolean
  enableSounds: boolean
  focusDuration: number // minutes
  breakDuration: number // minutes
  autoStartFocus: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: 'Bearer'
}

export interface LoginResponse {
  user: User
  tokens: AuthTokens
}
