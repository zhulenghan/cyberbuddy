/**
 * Shared validation utilities
 */

export function validatePetPrompt(prompt: string): {
  valid: boolean
  error?: string
} {
  if (!prompt || prompt.trim().length === 0) {
    return { valid: false, error: 'Prompt cannot be empty' }
  }

  if (prompt.length > 200) {
    return { valid: false, error: 'Prompt too long (max 200 characters)' }
  }

  // Check for inappropriate content (basic)
  const inappropriate = ['xxx', 'nsfw', 'porn']
  const lowerPrompt = prompt.toLowerCase()

  if (inappropriate.some(word => lowerPrompt.includes(word))) {
    return { valid: false, error: 'Inappropriate content detected' }
  }

  return { valid: true }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
