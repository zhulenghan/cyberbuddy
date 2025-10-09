/**
 * Activity tracking types
 */

export enum ActivityLabel {
  LEARNING = 'learning',
  WORKING = 'working',
  ENTERTAINMENT = 'entertainment',
  SOCIAL = 'social',
  SHOPPING = 'shopping',
  OTHER = 'other',
}

export interface PageInfo {
  url: string
  title: string
  favicon?: string
  timestamp: number
}

export interface PageContext extends PageInfo {
  content?: string
  headings?: string[]
  metaDescription?: string
}

export interface Activity {
  id?: string
  url: string
  title: string
  label: ActivityLabel
  startTime: number
  endTime?: number
  duration: number // milliseconds
  isActive: boolean // User actively viewing (not idle)
  date: string // ISO date string (YYYY-MM-DD)
}

export interface ActivityStats {
  date: string
  totalDuration: number
  byLabel: Record<
    ActivityLabel,
    {
      duration: number
      count: number
      percentage: number
    }
  >
  topSites: Array<{
    domain: string
    duration: number
    visits: number
  }>
}

export interface DailyReport {
  date: string
  message: string // AI-generated personalized message
  stats: ActivityStats
  achievements: Achievement[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string
}

export interface ClassificationResult {
  label: ActivityLabel
  confidence: number
}
