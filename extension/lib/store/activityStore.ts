/**
 * Activity tracking store
 */

import { create } from 'zustand'
import type { Activity, ActivityLabel, ActivityStats, PageInfo } from '@shared/types'
import { getTodayString } from '@shared/utils/date'
import { timeTracker } from '../tracker'
import { pageClassifier } from '../classifier'

interface ActivityStoreState {
  // State
  currentPage: PageInfo | null
  currentLabel: ActivityLabel
  todayStats: ActivityStats | null
  isTracking: boolean
  isLoading: boolean

  // Actions
  startTracking: (page: PageInfo) => Promise<void>
  stopTracking: () => Promise<void>
  updateCurrentPage: (page: PageInfo) => Promise<void>
  loadTodayStats: () => Promise<void>
  getStatsForDate: (date: string) => Promise<ActivityStats>
}

export const useActivityStore = create<ActivityStoreState>((set, get) => ({
  // Initial state
  currentPage: null,
  currentLabel: 'other',
  todayStats: null,
  isTracking: false,
  isLoading: false,

  // Start tracking
  startTracking: async (page: PageInfo) => {
    const label = await pageClassifier.classify({
      url: page.url,
      title: page.title,
    })

    timeTracker.startTracking(page, label)

    set({
      currentPage: page,
      currentLabel: label,
      isTracking: true,
    })

    // Notify about label change
    chrome.runtime.sendMessage({
      type: 'PAGE_CLASSIFIED',
      payload: { url: page.url, label },
    })
  },

  // Stop tracking
  stopTracking: async () => {
    await timeTracker.stopTracking()

    set({
      isTracking: false,
    })

    // Reload stats after stopping
    await get().loadTodayStats()
  },

  // Update current page (when user navigates)
  updateCurrentPage: async (page: PageInfo) => {
    // Stop current tracking
    if (get().isTracking) {
      await timeTracker.stopTracking()
    }

    // Start tracking new page
    await get().startTracking(page)

    // Reload stats
    await get().loadTodayStats()
  },

  // Load today's stats
  loadTodayStats: async () => {
    set({ isLoading: true })

    try {
      const stats = await timeTracker.getDailyStats(getTodayString())
      set({
        todayStats: stats,
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to load today stats:', error)
      set({ isLoading: false })
    }
  },

  // Get stats for specific date
  getStatsForDate: async (date: string) => {
    return await timeTracker.getDailyStats(date)
  },
}))
