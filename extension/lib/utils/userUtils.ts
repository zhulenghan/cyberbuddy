/**
 * User-related utility functions
 */

/**
 * Generate a unique Space ID based on user information
 * This creates a consistent, user-friendly identifier
 */
export function generateSpaceId(userId: string, email: string): string {
  // Create a hash-like string from user info
  const combined = `${userId}${email}`
  let hash = 0
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Convert to positive number and format as 8-digit hex
  const positiveHash = Math.abs(hash)
  const spaceId = positiveHash.toString(16).toUpperCase().padStart(8, '0')
  
  return spaceId
}

/**
 * Format user display name
 */
export function formatUserDisplayName(name: string, maxLength: number = 20): string {
  if (name.length <= maxLength) {
    return name
  }
  
  return name.substring(0, maxLength - 3) + '...'
}

/**
 * Get user initials for avatar display
 */
export function getUserInitials(name: string): string {
  const words = name.trim().split(' ')
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}