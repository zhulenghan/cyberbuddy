/**
 * Chrome extension message types for inter-component communication
 */

import { ActivityLabel, Activity, ActivityStats } from './activity'
import { PetState, Pet } from './pet'

export enum MessageType {
  // State sync
  PET_STATE_CHANGE = 'pet:state:change',
  PET_POSITION_CHANGE = 'pet:position:change',
  ACTIVITY_LOGGED = 'activity:logged',

  // Commands
  START_FOCUS_TIMER = 'focus:start',
  STOP_FOCUS_TIMER = 'focus:stop',
  PAUSE_FOCUS_TIMER = 'focus:pause',
  RESUME_FOCUS_TIMER = 'focus:resume',

  // Queries
  GET_DAILY_STATS = 'query:daily:stats',
  GET_PET_STATE = 'query:pet:state',
  GET_CURRENT_PAGE = 'query:current:page',

  // Page classification
  PAGE_CLASSIFIED = 'page:classified',
  PAGE_CONTENT_CHANGED = 'page:content:changed',

  // Authentication
  AUTH_STATE_CHANGED = 'auth:state:changed',

  // Notifications
  SHOW_NOTIFICATION = 'notification:show',
}

export type MessageSender = 'background' | 'content' | 'popup' | 'sidepanel' | 'options'

export interface Message<T = any> {
  type: MessageType
  payload: T
  timestamp: number
  sender: MessageSender
  requestId?: string
}

// Specific message payloads
export interface PetStateChangePayload {
  state: PetState
  message?: string
}

export interface PetPositionChangePayload {
  x: number
  y: number
}

export interface ActivityLoggedPayload {
  activity: Activity
}

export interface StartFocusTimerPayload {
  duration: number // minutes
  taskName?: string
}

export interface PageClassifiedPayload {
  url: string
  label: ActivityLabel
  confidence: number
}

export interface PageContentChangedPayload {
  url: string
  title: string
  content: string
}

export interface ShowNotificationPayload {
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

export interface GetDailyStatsResponse {
  stats: ActivityStats
}

export interface GetPetStateResponse {
  pet: Pet | null
  state: PetState
  position: { x: number; y: number }
}

// Helper type for message handlers
export type MessageHandler<T = any> = (
  message: Message<T>,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => boolean | void | Promise<any>
