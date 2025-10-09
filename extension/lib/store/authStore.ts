/**
 * Authentication store
 */

import { create } from 'zustand'
import type { User, AuthTokens } from '@shared/types'
import { apiClient } from '../api'
import { chromeStorage } from '../storage'
import { CONFIG } from '../config'
import { googleLogin, revokeGoogleToken } from '../auth/google-auth'

interface AuthState {
  // State
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: () => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  loadSession: () => Promise<void>
  setUser: (user: User | null) => void
  setTokens: (tokens: AuthTokens | null) => void
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Login with Google
  login: async () => {
    set({ isLoading: true, error: null })

    try {
      // Step 1: Get Google OAuth token via chrome.identity
      const { token: googleToken, userInfo } = await googleLogin()

      console.log('Google login successful:', userInfo.email)

      // Step 2: Exchange Google token for our backend tokens
      const response = await apiClient.post('/auth/google', {
        googleToken,
      })

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Login failed')
      }

      const { user, tokens } = response.data as any

      // Store tokens in Chrome storage
      await chromeStorage.setMultiple({
        [CONFIG.STORAGE_KEYS.ACCESS_TOKEN]: tokens.accessToken,
        [CONFIG.STORAGE_KEYS.REFRESH_TOKEN]: tokens.refreshToken,
        [CONFIG.STORAGE_KEYS.TOKEN_EXPIRY]: Date.now() + tokens.expiresIn * 1000,
        [CONFIG.STORAGE_KEYS.USER]: user,
      })

      // Update API client
      apiClient.setAccessToken(tokens.accessToken)

      set({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      })
      throw error
    }
  },

  // Logout
  logout: async () => {
    const { tokens } = get()

    try {
      // Revoke Google token if exists
      if (tokens?.accessToken) {
        try {
          await revokeGoogleToken(tokens.accessToken)
        } catch (error) {
          console.error('Failed to revoke Google token:', error)
        }
      }

      // Call logout API
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout API error:', error)
    }

    // Clear local storage
    await chromeStorage.removeMultiple([
      CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
      CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
      CONFIG.STORAGE_KEYS.TOKEN_EXPIRY,
      CONFIG.STORAGE_KEYS.USER,
    ])

    // Clear API client token
    apiClient.setAccessToken(null)

    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
    })
  },

  // Refresh access token
  refreshToken: async () => {
    const { tokens } = get()

    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await apiClient.post('/auth/refresh', {
        refreshToken: tokens.refreshToken,
      })

      if (!response.success || !response.data) {
        throw new Error('Token refresh failed')
      }

      const { accessToken, expiresIn } = response.data as any

      // Update stored tokens
      await chromeStorage.setMultiple({
        [CONFIG.STORAGE_KEYS.ACCESS_TOKEN]: accessToken,
        [CONFIG.STORAGE_KEYS.TOKEN_EXPIRY]: Date.now() + expiresIn * 1000,
      })

      // Update API client
      apiClient.setAccessToken(accessToken)

      set({
        tokens: {
          ...tokens,
          accessToken,
          expiresIn,
        },
      })
    } catch (error) {
      // Refresh failed, logout
      await get().logout()
      throw error
    }
  },

  // Load session from storage
  loadSession: async () => {
    set({ isLoading: true })

    try {
      const [accessToken, refreshToken, tokenExpiry, user] = await Promise.all([
        chromeStorage.get<string>(CONFIG.STORAGE_KEYS.ACCESS_TOKEN),
        chromeStorage.get<string>(CONFIG.STORAGE_KEYS.REFRESH_TOKEN),
        chromeStorage.get<number>(CONFIG.STORAGE_KEYS.TOKEN_EXPIRY),
        chromeStorage.get<User>(CONFIG.STORAGE_KEYS.USER),
      ])

      if (!accessToken || !refreshToken || !user) {
        set({ isLoading: false })
        return
      }

      // Check if token expired
      if (tokenExpiry && Date.now() >= tokenExpiry) {
        // Try to refresh
        try {
          await get().refreshToken()
        } catch {
          set({ isLoading: false })
          return
        }
      } else {
        // Set existing token
        apiClient.setAccessToken(accessToken)

        set({
          user,
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: tokenExpiry ? Math.floor((tokenExpiry - Date.now()) / 1000) : 0,
            tokenType: 'Bearer',
          },
          isAuthenticated: true,
          isLoading: false,
        })
      }
    } catch (error) {
      console.error('Failed to load session:', error)
      set({ isLoading: false })
    }
  },

  // Setters
  setUser: (user) => set({ user }),
  setTokens: (tokens) => set({ tokens }),
  setError: (error) => set({ error }),
}))
