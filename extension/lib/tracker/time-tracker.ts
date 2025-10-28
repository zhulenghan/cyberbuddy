/**
 * Time tracking for user activities
 */

import type { Activity, ActivityLabel, ActivityStats, PageInfo } from '@shared/types'
import { formatDate, getTodayString } from '@shared/utils/date'
import { generateId } from '@shared/utils/helpers'
import { indexedDBStorage as indexedDB } from '../storage'

interface TimeEntry {
  url: string
  title: string
  label: ActivityLabel
  startTime: number
  endTime?: number
  duration: number
  isActive: boolean
  date: string
}

export class TimeTracker {
  private currentEntry: TimeEntry | null = null
  private updateInterval: NodeJS.Timeout | null = null
  private isIdle: boolean = false

  private readonly IDLE_THRESHOLD = 60000 // 1 minute
  private readonly MIN_DURATION = 5000 // 5 seconds
  private readonly UPDATE_INTERVAL = 1000 // 1 second

  /**
   * Start tracking a page
   */
  startTracking(page: PageInfo, label: ActivityLabel): void {
    // Stop previous tracking
    if (this.currentEntry) {
      this.stopTracking()
    }

    this.currentEntry = {
      url: page.url,
      title: page.title,
      label,
      startTime: Date.now(),
      duration: 0,
      isActive: true,
      date: getTodayString(),
    }

    this.isIdle = false

    // Update duration every second
    this.updateInterval = setInterval(() => {
      if (this.currentEntry && this.currentEntry.isActive && !this.isIdle) {
        this.currentEntry.duration = Date.now() - this.currentEntry.startTime
      }
    }, this.UPDATE_INTERVAL)
  }

  /**
   * Stop tracking current page
   */
  async stopTracking(): Promise<void> {
    if (!this.currentEntry) return

    // Clear interval
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }

    this.currentEntry.endTime = Date.now()
    this.currentEntry.duration = this.currentEntry.endTime - this.currentEntry.startTime

    // Only save if duration is significant
    if (this.currentEntry.duration >= this.MIN_DURATION) {
      const activity: Activity = {
        id: generateId(),
        url: this.currentEntry.url,
        title: this.currentEntry.title,
        label: this.currentEntry.label,
        startTime: this.currentEntry.startTime,
        endTime: this.currentEntry.endTime,
        duration: this.currentEntry.duration,
        isActive: false,
        date: this.currentEntry.date,
      }

      try {
        await indexedDB.saveActivity(activity)
      } catch (error) {
        console.error('Failed to save activity:', error)
      }
    }

    this.currentEntry = null
  }

  /**
   * Pause tracking (user went idle)
   */
  pause(): void {
    if (this.currentEntry) {
      this.currentEntry.isActive = false
      this.isIdle = true
    }
  }

  /**
   * Resume tracking (user came back)
   */
  resume(): void {
    if (this.currentEntry) {
      // Reset start time to now
      this.currentEntry.startTime = Date.now()
      this.currentEntry.duration = 0
      this.currentEntry.isActive = true
      this.isIdle = false
    }
  }

  /**
   * Get current tracking status
   */
  getCurrentEntry(): TimeEntry | null {
    return this.currentEntry
  }

  /**
   * Get daily stats
   */
  async getDailyStats(date?: string): Promise<ActivityStats> {
    const targetDate = date || getTodayString()
    const activities = await indexedDB.getActivitiesByDate(targetDate)

    // Calculate stats by label
    const byLabel: ActivityStats['byLabel'] = {
      focused: { duration: 0, count: 0, percentage: 0 },
      entertainment: { duration: 0, count: 0, percentage: 0 },
      social: { duration: 0, count: 0, percentage: 0 },
      shopping: { duration: 0, count: 0, percentage: 0 },
    }

    let totalDuration = 0

    for (const activity of activities) {
      byLabel[activity.label].duration += activity.duration
      byLabel[activity.label].count += 1
      totalDuration += activity.duration
    }

    // Calculate percentages
    for (const label in byLabel) {
      if (totalDuration > 0) {
        byLabel[label as ActivityLabel].percentage =
          (byLabel[label as ActivityLabel].duration / totalDuration) * 100
      }
    }

    // Get top sites
    const topSites = this.calculateTopSites(activities)

    return {
      date: targetDate,
      totalDuration,
      byLabel,
      topSites,
    }
  }

  /**
   * Calculate top sites from activities
   */
  private calculateTopSites(
    activities: Activity[]
  ): Array<{ domain: string; duration: number; visits: number }> {
    const siteMap = new Map<string, { duration: number; visits: number }>()

    for (const activity of activities) {
      try {
        const url = new URL(activity.url)
        const domain = url.hostname.replace('www.', '')

        const existing = siteMap.get(domain) || { duration: 0, visits: 0 }
        existing.duration += activity.duration
        existing.visits += 1

        siteMap.set(domain, existing)
      } catch {
        // Invalid URL, skip
      }
    }

    return Array.from(siteMap.entries())
      .map(([domain, stats]) => ({
        domain,
        duration: stats.duration,
        visits: stats.visits,
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
  }

  /**
   * Get stats for date range
   */
  async getStatsForRange(startDate: string, endDate: string): Promise<ActivityStats[]> {
    const activities = await indexedDB.getActivitiesByDateRange(startDate, endDate)

    // Group by date
    const byDate = new Map<string, Activity[]>()

    for (const activity of activities) {
      const existing = byDate.get(activity.date) || []
      existing.push(activity)
      byDate.set(activity.date, existing)
    }

    // Calculate stats for each date
    const stats: ActivityStats[] = []

    for (const [date, dateActivities] of byDate.entries()) {
      const dateStats = await this.getDailyStats(date)
      stats.push(dateStats)
    }

    return stats.sort((a, b) => a.date.localeCompare(b.date))
  }
  async getStatsByPage(date?: string): Promise<
    Array<{ domain: string; totalDuration: number; visits: number; label: ActivityLabel }>
  > {
    const targetDate = date || getTodayString()
    const activities = await indexedDB.getActivitiesByDate(targetDate)

    const map = new Map<string, { totalDuration: number; visits: number; label: ActivityLabel }>()

    for (const a of activities) {
      try {
        const domain = new URL(a.url).hostname.replace('www.', '')
        if (!map.has(domain)) {
          map.set(domain, { totalDuration: 0, visits: 0, label: a.label })
        }
        const entry = map.get(domain)!
        entry.totalDuration += a.duration
        entry.visits += 1
      } catch {
        // ignore bad URLs
      }
    }

    return Array.from(map.entries()).map(([domain, data]) => ({
      domain,
      ...data,
    })).sort((a, b) => b.totalDuration - a.totalDuration)
  }
}

export const timeTracker = new TimeTracker()
