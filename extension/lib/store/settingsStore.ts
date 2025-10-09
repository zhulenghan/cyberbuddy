/**
 * Settings store
 */

import { create } from 'zustand'
import type { UserPreferences } from '@shared/types'
import { chromeStorage } from '../storage'
import { CONFIG } from '../config'

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'en',
  petPosition: CONFIG.PET_DEFAULT_POSITION,
  enableNotifications: true,
  enableSounds: true,
  focusDuration: CONFIG.DEFAULT_FOCUS_DURATION,
  breakDuration: CONFIG.DEFAULT_BREAK_DURATION,
  autoStartFocus: false,
}

interface SettingsStoreState {
  // State
  preferences: UserPreferences
  isLoading: boolean

  // Actions
  loadPreferences: () => Promise<void>
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => Promise<void>
  resetPreferences: () => Promise<void>
}

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  // Initial state
  preferences: DEFAULT_PREFERENCES,
  isLoading: false,

  // Load preferences from storage
  loadPreferences: async () => {
    set({ isLoading: true })

    try {
      const stored = await chromeStorage.get<UserPreferences>(
        CONFIG.STORAGE_KEYS.PREFERENCES
      )

      set({
        preferences: stored || DEFAULT_PREFERENCES,
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to load preferences:', error)
      set({ isLoading: false })
    }
  },

  // Update single preference
  updatePreference: async (key, value) => {
    const newPreferences = {
      ...get().preferences,
      [key]: value,
    }

    // Save to storage
    await chromeStorage.set(CONFIG.STORAGE_KEYS.PREFERENCES, newPreferences)

    set({ preferences: newPreferences })

    // Notify other parts of extension
    chrome.runtime.sendMessage({
      type: 'PREFERENCES_UPDATED',
      payload: { key, value },
    })
  },

  // Reset to defaults
  resetPreferences: async () => {
    await chromeStorage.set(CONFIG.STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES)

    set({ preferences: DEFAULT_PREFERENCES })
  },
}))
