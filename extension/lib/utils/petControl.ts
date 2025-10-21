/**
 * Pet Control Utilities
 * 
 * Functions to show/hide and control the pet widget
 */

/**
 * Check if content script is loaded on a tab
 */
async function isContentScriptLoaded(tabId: number): Promise<boolean> {
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'PING' })
    return true
  } catch {
    return false
  }
}

/**
 * Ensure content script is ready on a tab
 */
async function ensureContentScript(tabId: number, url?: string): Promise<{ loaded: boolean; needsRefresh: boolean }> {
  // Skip chrome:// and other restricted URLs
  if (url && (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('edge://'))) {
    console.warn('Cannot load content script on browser system pages')
    return { loaded: false, needsRefresh: false }
  }

  const isLoaded = await isContentScriptLoaded(tabId)
  if (isLoaded) {
    return { loaded: true, needsRefresh: false }
  }

  // Content script not loaded yet - page needs to be refreshed
  // This happens when:
  // 1. User just installed the extension
  // 2. User opened the tab before the extension was loaded
  return { loaded: false, needsRefresh: true }
}

/**
 * Show the pet on the current active tab
 */
export async function showPet(): Promise<void> {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    
    if (!tab?.id) {
      console.error('No active tab found')
      return
    }

    // Save visibility state first
    await chrome.storage.local.set({ petVisible: true })

    // Check if content script is loaded
    const { loaded, needsRefresh } = await ensureContentScript(tab.id, tab.url)
    
    if (!loaded) {
      if (needsRefresh) {
        // Ask user to refresh the page
        const userConfirmed = confirm(
          '需要刷新当前页面才能显示桌宠。\n\n点击"确定"自动刷新页面，桌宠将立即出现！'
        )
        if (userConfirmed) {
          await chrome.tabs.reload(tab.id)
        }
      } else {
        // System page - cannot load pet
        alert('桌宠无法在浏览器系统页面显示。\n\n请切换到其他网页（如 Google、GitHub 等）查看你的桌宠！')
      }
      return
    }

    // Content script is loaded, send message to show pet
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'SHOW_PET',
        payload: { visible: true },
      })
      console.log('✅ Pet is now visible on the page!')
    } catch (error) {
      console.error('Failed to send message to content script:', error)
    }
  } catch (error) {
    console.error('Failed to show pet:', error)
  }
}

/**
 * Hide the pet on the current active tab
 */
export async function hidePet(): Promise<void> {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    
    if (!tab?.id) {
      console.error('No active tab found')
      return
    }

    // Save visibility state
    await chrome.storage.local.set({ petVisible: false })

    // Send message to content script to hide pet
    const scriptLoaded = await isContentScriptLoaded(tab.id)
    if (scriptLoaded) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'HIDE_PET',
          payload: { visible: false },
        })
      } catch (error) {
        console.error('Failed to send hide message:', error)
      }
    }
  } catch (error) {
    console.error('Failed to hide pet:', error)
  }
}

/**
 * Toggle pet visibility
 */
export async function togglePet(): Promise<void> {
  try {
    const result = await chrome.storage.local.get('petVisible')
    const isVisible = result.petVisible !== false // Default to true
    
    if (isVisible) {
      await hidePet()
    } else {
      await showPet()
    }
  } catch (error) {
    console.error('Failed to toggle pet:', error)
  }
}

/**
 * Check if pet is currently visible
 */
export async function isPetVisible(): Promise<boolean> {
  try {
    const result = await chrome.storage.local.get('petVisible')
    return result.petVisible !== false // Default to true
  } catch (error) {
    console.error('Failed to check pet visibility:', error)
    return true
  }
}

