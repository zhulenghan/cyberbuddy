/**
 * API endpoint constants
 */

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    GOOGLE: '/auth/google',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },

  // User
  USER: {
    ME: '/users/me',
    UPDATE: '/users/me',
    DELETE: '/users/me',
  },

  // Pets
  PETS: {
    LIST: '/pets',
    CREATE: '/pets',
    GET: (id: string) => `/pets/${id}`,
    DELETE: (id: string) => `/pets/${id}`,
    ACTIVATE: (id: string) => `/pets/${id}/activate`,
  },

  // Activities
  ACTIVITIES: {
    LOG: '/activities',
    STATS: '/activities/stats',
  },

  // Reports
  REPORTS: {
    DAILY: (date: string) => `/reports/daily/${date}`,
    GENERATE: '/reports/generate',
  },

  // Settings
  SETTINGS: {
    GET: '/settings',
    UPDATE: '/settings',
  },
} as const
