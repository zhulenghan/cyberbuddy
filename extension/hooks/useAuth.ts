/**
 * Authentication hook
 */

import { useEffect } from 'react'
import { useAuthStore } from '../lib/store'

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    loadSession,
  } = useAuthStore()

  // Load session on mount
  useEffect(() => {
    loadSession()
  }, [loadSession])

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  }
}
