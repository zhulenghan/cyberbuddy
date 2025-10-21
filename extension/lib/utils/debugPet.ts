/**
 * Debug utilities for pet data
 */

/**
 * Log current pet data to console for debugging
 */
export async function debugPetData(): Promise<void> {
  try {
    const result = await chrome.storage.local.get(['currentPet', 'availablePets'])
    
    console.log('=== PET DEBUG INFO ===')
    console.log('Current Pet:', result.currentPet)
    console.log('Available Pets:', result.availablePets)
    
    if (result.currentPet) {
      const pet = result.currentPet
      console.log('Pet ID:', pet.id)
      console.log('Pet Prompt:', pet.prompt)
      console.log('Pet Images:', pet.images)
      console.log('Pet Style:', pet.style)
      console.log('Pet Created At:', pet.createdAt)
      console.log('Pet Is Active:', pet.isActive)
      
      if (pet.images) {
        console.log('Image URLs:')
        Object.entries(pet.images).forEach(([state, url]) => {
          console.log(`  ${state}: ${url}`)
        })
      }
    } else {
      console.log('No current pet found!')
    }
    console.log('=====================')
  } catch (error) {
    console.error('Failed to debug pet data:', error)
  }
}

/**
 * Check if pet has valid image data
 */
export function validatePetImages(pet: any): { valid: boolean; issues: string[] } {
  const issues: string[] = []
  
  if (!pet) {
    issues.push('Pet is null or undefined')
    return { valid: false, issues }
  }
  
  if (!pet.images) {
    issues.push('Pet has no images property')
    return { valid: false, issues }
  }
  
  const requiredStates = ['idle', 'happy', 'focused', 'tired', 'excited']
  const missingStates = requiredStates.filter(state => !pet.images[state])
  
  if (missingStates.length > 0) {
    issues.push(`Missing image states: ${missingStates.join(', ')}`)
  }
  
  const emptyUrls = requiredStates.filter(state => 
    pet.images[state] && pet.images[state].trim() === ''
  )
  
  if (emptyUrls.length > 0) {
    issues.push(`Empty image URLs for states: ${emptyUrls.join(', ')}`)
  }
  
  return {
    valid: issues.length === 0,
    issues
  }
}
