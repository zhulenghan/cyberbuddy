/**
 * Pet store
 */

import { create } from 'zustand'
import type { Pet, PetState, Position } from '@shared/types'
import { apiClient } from '../api'
import { chromeStorage, indexedDBStorage as indexedDB } from '../storage'
import { CONFIG } from '../config'

interface PetStoreState {
  // State
  currentPet: Pet | null
  availablePets: Pet[]
  currentState: PetState
  position: Position
  isGenerating: boolean
  error: string | null

  // Actions
  generatePet: (prompt: string, style?: 'pixel' | '3d', name?: string) => Promise<Pet>
  selectPet: (petId: string) => Promise<void>
  loadPets: () => Promise<void>
  deletePet: (petId: string) => Promise<void>
  updateState: (state: PetState) => void
  updatePosition: (position: Position) => void
  setError: (error: string | null) => void
}

export const usePetStore = create<PetStoreState>((set, get) => ({
  // Initial state
  currentPet: null,
  availablePets: [],
  currentState: 'idle',
  position: CONFIG.PET_DEFAULT_POSITION,
  isGenerating: false,
  error: null,

  // Generate new pet
  generatePet: async (prompt: string, style: 'pixel' | '3d' = 'pixel', name?: string) => {
    set({ isGenerating: true, error: null })

    try {
      const response = await apiClient.post('/pets', {
        prompt,
        style,
      })

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to generate pet')
      }

      const pet = { ...response.data, name } as Pet
      console.log('petStore.generatePet: Created pet with name:', pet.name)
      console.log('petStore.generatePet: Full pet object:', pet)

      // Save to IndexedDB
      await indexedDB.savePet(pet)
      console.log('petStore.generatePet: Saved to IndexedDB')

      // Update available pets
      const pets = [...get().availablePets, pet]
      set({
        availablePets: pets,
        isGenerating: false,
      })
      console.log('petStore.generatePet: Updated availablePets, count:', pets.length)

      // Auto-select if first pet
      if (pets.length === 1) {
        console.log('petStore.generatePet: Auto-selecting first pet')
        await get().selectPet(pet.id)
      }

      return pet
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate pet'
      set({
        error: errorMessage,
        isGenerating: false,
      })
      throw error
    }
  },


  // Select active pet
  selectPet: async (petId: string) => {
    console.log('petStore.selectPet: Selecting pet ID:', petId)
    const pet = get().availablePets.find((p) => p.id === petId)

    if (!pet) {
      throw new Error('Pet not found')
    }

    console.log('petStore.selectPet: Found pet with name:', pet.name)
    console.log('petStore.selectPet: Full pet object:', pet)

    // Update all pets' isActive status
    const updatedPets = get().availablePets.map((p) => ({
      ...p,
      isActive: p.id === petId,
    }))

    // Save to storage
    await Promise.all([
      chromeStorage.set(CONFIG.STORAGE_KEYS.CURRENT_PET, pet),
      ...updatedPets.map((p) => indexedDB.savePet(p)),
    ])
    console.log('petStore.selectPet: Saved to storage with name:', pet.name)

    set({
      currentPet: pet,
      availablePets: updatedPets,
    })

    // Notify other parts of the extension
    chrome.runtime.sendMessage({
      type: 'PET_CHANGED',
      payload: { petId },
    })
  },

  // Load pets from storage
  loadPets: async () => {
    try {
      const [pets, currentPet] = await Promise.all([
        indexedDB.getAllPets(),
        chromeStorage.get<Pet>(CONFIG.STORAGE_KEYS.CURRENT_PET),
      ])

      set({
        availablePets: pets,
        currentPet: currentPet || null,
      })
    } catch (error) {
      console.error('Failed to load pets:', error)
    }
  },

  // Delete pet
  deletePet: async (petId: string) => {
    try {
      // Delete from server
      await apiClient.delete(`/pets/${petId}`)

      // Delete from local storage
      await indexedDB.deletePet(petId)

      // Update state
      const updatedPets = get().availablePets.filter((p) => p.id !== petId)
      const wasCurrentPet = get().currentPet?.id === petId

      set({
        availablePets: updatedPets,
        currentPet: wasCurrentPet ? (updatedPets[0] || null) : get().currentPet,
      })

      // If deleted current pet, select first available
      if (wasCurrentPet && updatedPets.length > 0) {
        await get().selectPet(updatedPets[0].id)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete pet'
      set({ error: errorMessage })
      throw error
    }
  },

  // Update pet state (idle, happy, focused, etc.)
  updateState: (state: PetState) => {
    set({ currentState: state })

    // Notify content script
    chrome.runtime.sendMessage({
      type: 'PET_STATE_CHANGE',
      payload: { state },
    })
  },

  // Update pet position
  updatePosition: (position: Position) => {
    set({ position })

    // Save to storage
    chromeStorage.set('pet:position', position)
  },

  // Set error
  setError: (error: string | null) => set({ error }),
}))
