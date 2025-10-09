/**
 * API request/response types
 */

import { ActivityLabel, ActivityStats, DailyReport } from './activity'
import { Pet, PetGenerationRequest, PetGenerationResponse } from './pet'
import { User, AuthTokens, UserPreferences } from './user'

// Error handling
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export interface ApiError {
  code: ErrorCode
  message: string
  details?: any
}

export interface ErrorResponse {
  error: ApiError
  requestId: string
  timestamp: string
}

// API responses
export interface ApiResponse<T> {
  data?: T
  error?: ApiError
  success: boolean
}

// Auth endpoints
export interface GoogleAuthRequest {
  idToken: string
}

export interface GoogleAuthResponse {
  user: User
  tokens: AuthTokens
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  expiresIn: number
}

// Pet endpoints
export type GeneratePetRequest = PetGenerationRequest
export type GeneratePetResponse = PetGenerationResponse

export interface ListPetsResponse {
  pets: Pet[]
  total: number
}

// Activity endpoints
export interface LogActivityRequest {
  url: string
  title: string
  label: ActivityLabel
  duration: number
  timestamp: number
}

export interface LogActivityResponse {
  success: boolean
  activityId: string
}

export interface GetActivityStatsRequest {
  startDate: string
  endDate: string
  groupBy?: 'day' | 'week' | 'month'
}

export type GetActivityStatsResponse = ActivityStats

// Report endpoints
export interface GenerateReportRequest {
  date: string
  petPersonality: string
}

export type GenerateReportResponse = DailyReport

// Settings endpoints
export interface UpdateSettingsRequest {
  preferences: Partial<UserPreferences>
}

export interface UpdateSettingsResponse {
  preferences: UserPreferences
}
