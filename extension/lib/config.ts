/**
 * Extension configuration
 */

export const CONFIG = {
  // API
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/v1',
  API_TIMEOUT: 30000,

  // AWS Cognito
  USER_POOL_ID: import.meta.env.VITE_USER_POOL_ID || '',
  USER_POOL_CLIENT_ID: import.meta.env.VITE_USER_POOL_CLIENT_ID || '',
  AWS_REGION: import.meta.env.VITE_AWS_REGION || 'us-east-1',

  // Auth
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',

  // Storage keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'auth:accessToken',
    REFRESH_TOKEN: 'auth:refreshToken',
    TOKEN_EXPIRY: 'auth:tokenExpiry',
    USER: 'user:data',
    CURRENT_PET: 'pet:current',
    PETS: 'pet:list',
    PREFERENCES: 'user:preferences',
    ONBOARDING_COMPLETED: 'onboarding:completed',
  },

  // Time tracking
  IDLE_THRESHOLD: 60000, // 1 minute
  MIN_ACTIVITY_DURATION: 5000, // 5 seconds
  SYNC_INTERVAL: 300000, // 5 minutes

  // Focus timer
  DEFAULT_FOCUS_DURATION: 25, // minutes (Pomodoro)
  DEFAULT_BREAK_DURATION: 5, // minutes

  // Pet
  PET_SIZE: 128, // pixels
  PET_DEFAULT_POSITION: { x: 100, y: 100 },
  PET_ANIMATION_DURATION: 500, // ms

  // Limits
  FREE_GENERATIONS_PER_DAY: 5,
  MAX_PETS_PER_USER: 10,

  // Cache
  CACHE_TTL: 300000, // 5 minutes
  MAX_CACHE_SIZE: 100,

  // Development
  DEBUG: import.meta.env.DEV,
} as const

export type AppConfig = typeof CONFIG
