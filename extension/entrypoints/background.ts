/**
 * Background Service Worker
 *
 * Responsibilities:
 * - Monitor tab changes
 * - Classify pages
 * - Track activity time
 * - Sync pet state across tabs
 * - Handle idle detection
 */

import { pageClassifier } from '@/lib/classifier'
import { timeTracker } from '@/lib/tracker'
import { indexedDBStorage as indexedDB } from '@/lib/storage'
import { LABEL_TO_PET_STATE } from '@shared/constants/labels'
import type { ActivityLabel, PageInfo } from '@shared/types'

export default defineBackground(() => {
  console.log('Cyber Buddy background service started')

  // Initialize IndexedDB
  indexedDB.init().catch(console.error)

  // Current tracking state
  let currentTab: chrome.tabs.Tab | null = null
  let isIdle = false

  /**
   * Handle tab activation (user switched tabs)
   */
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId)
      await handleTabChange(tab)
    } catch (error) {
      console.error('Error handling tab activation:', error)
    }
  })

  /**
   * Handle tab update (URL changed, page loaded)
   */
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Only handle when page is fully loaded
    if (changeInfo.status === 'complete' && tab.active) {
      await handleTabChange(tab)
    }
  })

  /**
   * Handle window focus change
   */
  chrome.windows.onFocusChanged.addListener(async (windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      // User left browser, pause tracking
      timeTracker.pause()
    } else {
      // User returned to browser, resume tracking
      timeTracker.resume()

      // Get active tab in focused window
      const tabs = await chrome.tabs.query({ active: true, windowId })
      if (tabs[0]) {
        await handleTabChange(tabs[0])
      }
    }
  })

  /**
   * Handle idle state changes
   */
  chrome.idle.setDetectionInterval(60) // 60 seconds

  chrome.idle.onStateChanged.addListener((state) => {
    if (state === 'idle' || state === 'locked') {
      isIdle = true
      timeTracker.pause()
      console.log('User went idle')
    } else {
      isIdle = false
      timeTracker.resume()
      console.log('User is active')
    }
  })

  /**
   * Handle messages from content scripts and popup
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sender, sendResponse)
    return true // Keep channel open for async response
  })

  /**
   * Handle tab change
   */
  async function handleTabChange(tab: chrome.tabs.Tab) {
    if (!tab.url || !tab.title) return

    // Skip chrome:// and extension pages
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      return
    }

    currentTab = tab

    const pageInfo: PageInfo = {
      url: tab.url,
      title: tab.title,
      timestamp: Date.now(),
    }

    try {
      // Classify page
      const label = await pageClassifier.classify({
        url: pageInfo.url,
        title: pageInfo.title,
      })

      console.log(`Page classified: ${label} - ${pageInfo.title}`)

      // Determine pet state from label
      const petState = LABEL_TO_PET_STATE[label]

      // Broadcast state change to all tabs
      await broadcastPetStateChange(petState)

      // Start/update time tracking
      timeTracker.startTracking(pageInfo, label)

      // Send classification result to content script
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'PAGE_CLASSIFIED',
          payload: { label, petState },
        }).catch(() => {
          // Content script not ready yet, ignore
        })
      }
    } catch (error) {
      console.error('Error handling tab change:', error)
    }
  }

  /**
   * Broadcast pet state change to all tabs
   */
  async function broadcastPetStateChange(state: string) {
    const tabs = await chrome.tabs.query({})

    for (const tab of tabs) {
      if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'PET_STATE_CHANGE',
          payload: { state },
        }).catch(() => {
          // Tab not ready, ignore
        })
      }
    }
  }

  /**
   * Handle messages
   */
  async function handleMessage(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) {
    try {
      switch (message.type) {
        case 'GET_CURRENT_PAGE':
          sendResponse({
            tab: currentTab,
            isIdle,
          })
          break

        case 'GET_DAILY_STATS':
          const stats = await timeTracker.getDailyStats()
          sendResponse({ stats })
          break

        case 'PAGE_CONTENT_EXTRACTED':
          // Content script extracted page content for better classification
          const { url, title, content } = message.payload
          const label = await pageClassifier.classify({ url, title, content })

          sendResponse({ label })
          break

        default:
          sendResponse({ error: 'Unknown message type' })
      }
    } catch (error) {
      console.error('Error handling message:', error)
      sendResponse({ error: 'Internal error' })
    }
  }

  /**
   * Cleanup on unload
   */
  chrome.runtime.onSuspend.addListener(() => {
    console.log('Background service suspending, stopping tracking')
    timeTracker.stopTracking()
  })
})
