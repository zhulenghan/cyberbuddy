/**
 * Shared types for the extension
 */

export interface User {
  id: string
  email: string
  name: string
  picture?: string  // Optional profile picture URL
  createdAt?: string
  subscription?: {
    plan: string
    active: boolean
  }
  generationsRemaining?: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: 'Bearer'
}

export interface UserPreferences {
  theme?: 'light' | 'dark'
  notifications?: boolean
  [key: string]: any
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
  details?: any
}

export interface Pet {
  id: string
  name?: string
  prompt: string
  images: PetImages
  style: 'pixel' | '3d'
  isActive: boolean
  behaviorContent?: PetBehaviorContent
  createdAt: string
}

export interface PetImages {
  idle: string
  happy: string
  focused: string
  tired: string
  excited: string
}

export interface PetState {
  position: Position
  behavior: string
  mood: string
  isVisible: boolean
}

export interface Position {
  x: number
  y: number
}

export interface PetBehaviorContent {
  idle: BehaviorState
  happy: BehaviorState
  focused: BehaviorState
  tired: BehaviorState
  excited: BehaviorState
}

export interface BehaviorState {
  text?: string
  animation?: string
  duration?: number
}

export interface Activity {
  id: string
  url: string
  title: string
  label: ActivityLabel
  duration: number
  startTime: number
  endTime?: number
  userId: string
  timestamp: number
}

export type ActivityLabel = 'work' | 'entertainment' | 'social' | 'education' | 'shopping' | 'other'

export interface ActivityStats {
  totalDuration: number
  byLabel: Record<ActivityLabel, {
    duration: number
    percentage: number
    count: number
  }>
}

export interface PageInfo {
  url: string
  title: string
  domain: string
}

export interface PageContext {
  url: string
  title: string
  domain: string
  content?: string
}

export interface ClassificationResult {
  label: ActivityLabel
  confidence: number
  reasoning?: string
}