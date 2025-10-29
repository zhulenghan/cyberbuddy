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
    refreshPetImages,
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
    refreshPetImages,
    selectPet,
    deletePet,
    updateState,
    updatePosition,
  }
}
