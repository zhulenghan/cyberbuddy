/**
 * Pet management hook
 */

import { useEffect } from 'react'
import { usePetStore } from '../lib/store/petStore'

export function usePet() {
  const {
    currentPet,
    availablePets,
    currentState,
    position,
    isGenerating,
    error,
    generatePet,
    generateBehaviorContent,
    selectPet,
    loadPets,
    deletePet,
    updateState,
    updatePosition,
  } = usePetStore()

  // Load pets on mount
  useEffect(() => {
    loadPets()
  }, [loadPets])

  return {
    currentPet,
    availablePets,
    currentState,
    position,
    isGenerating,
    error,
    generatePet,
    generateBehaviorContent,
    selectPet,
    deletePet,
    updateState,
    updatePosition,
  }
}
