/**
 * Debug storage utilities
 */

import { CONFIG } from '@/lib/config'

/**
 * Debug all storage keys related to pets and auth
 */
export async function debugAllStorage(): Promise<void> {
  try {
    console.log('=== STORAGE DEBUG ===')
    
    const keys = [
      CONFIG.STORAGE_KEYS.CURRENT_PET,
      CONFIG.STORAGE_KEYS.PETS,
      CONFIG.STORAGE_KEYS.USER,
      CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
      'petVisible',
      'currentPet', // Legacy key
    ]
    
    const result = await chrome.storage.local.get(keys)
    
    console.log('Storage keys and values:')
    keys.forEach(key => {
      const value = result[key]
      console.log(`  ${key}:`, value ? (typeof value === 'object' ? JSON.stringify(value, null, 2) : value) : 'undefined')
    })
    
    // Check if there are any pets in availablePets
    if (result[CONFIG.STORAGE_KEYS.PETS]) {
      console.log(`\nAvailable pets count: ${result[CONFIG.STORAGE_KEYS.PETS].length}`)
    }
    
    // Check current pet specifically
    const currentPet = result[CONFIG.STORAGE_KEYS.CURRENT_PET]
    if (currentPet) {
      console.log('\n✅ Current pet found:')
      console.log('  ID:', currentPet.id)
      console.log('  Prompt:', currentPet.prompt)
      console.log('  Images:', currentPet.images ? Object.keys(currentPet.images) : 'No images')
    } else {
      console.log('\n❌ No current pet found')
    }
    
    console.log('====================')
  } catch (error) {
    console.error('Failed to debug storage:', error)
  }
}

/**
 * Clear all pet-related storage
 */
export async function clearPetStorage(): Promise<void> {
  try {
    const keys = [
      CONFIG.STORAGE_KEYS.CURRENT_PET,
      CONFIG.STORAGE_KEYS.PETS,
      'petVisible',
      'currentPet', // Legacy key
    ]
    
    await chrome.storage.local.remove(keys)
    console.log('✅ Pet storage cleared')
  } catch (error) {
    console.error('Failed to clear pet storage:', error)
  }
}
