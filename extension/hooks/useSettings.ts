/**
 * Settings hook
 */

import { useEffect } from 'react'
import { useSettingsStore } from '../lib/store'

export function useSettings() {
  const {
    preferences,
    isLoading,
    loadPreferences,
    updatePreference,
    resetPreferences,
  } = useSettingsStore()

  // Load preferences on mount
  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  return {
    preferences,
    isLoading,
    updatePreference,
    resetPreferences,
  }
}
