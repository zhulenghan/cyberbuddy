/**
 * Pet-related types
 */

export enum PetState {
  IDLE = 'idle',
  HAPPY = 'happy',
  FOCUSED = 'focused',
  TIRED = 'tired',
  EXCITED = 'excited',
}

export interface PetImages {
  idle: string
  happy: string
  focused: string
  tired: string
  excited: string
}

export interface Pet {
  id: string
  prompt: string
  name?: string // Pet's custom name
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
  idle: string
  happy: string
  focused: string
  tired: string
  excited: string
}
