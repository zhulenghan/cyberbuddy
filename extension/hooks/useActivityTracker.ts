/**
 * Activity tracking hook
 */

import { useEffect } from 'react'
import { useActivityStore } from '../lib/store'

export function useActivityTracker() {
  const {
    currentPage,
    currentLabel,
    todayStats,
    isTracking,
    isLoading,
    loadTodayStats,
    getStatsForDate,
  } = useActivityStore()

  // Load today's stats on mount
  useEffect(() => {
    loadTodayStats()
  }, [loadTodayStats])

  return {
    currentPage,
    currentLabel,
    todayStats,
    isTracking,
    isLoading,
    getStatsForDate,
  }
}
