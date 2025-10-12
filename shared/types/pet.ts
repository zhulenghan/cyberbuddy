/**
 * Pet-related types
 */

export enum PetState {
  SOCIAL = 'social',
  FOCUSED = 'focused',
  ENTERTAINMENT = 'entertainment',
  SHOPPING = 'shopping',
}

export interface PetImages {
  social: string
  focused: string
  entertainment: string
  shopping: string
}

export interface Pet {
  id: string
  prompt: string
  images: PetImages
  style: 'pixel' | '3d'
  behaviorContent?: PetBehaviorContent
  createdAt: string
  isActive: boolean
}

export interface PetGenerationRequest {
  prompt: string
  style?: 'pixel' | '3d'
}

export interface PetGenerationResponse {
  petId: string
  prompt: string
  images: PetImages
  createdAt: string
}

export interface Position {
  x: number
  y: number
}

export interface PetBehavior {
  state: PetState
  message?: string
  duration?: number
}

export interface PetBehaviorContent {
  social: string
  focused: string
  entertainment: string
  shopping: string
}
