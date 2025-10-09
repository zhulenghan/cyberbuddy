/**
 * Content Script
 *
 * Responsibilities:
 * - Inject Pet Widget into page
 * - Listen for pet state changes
 * - Extract page content for classification
 */

import { createRoot } from 'react-dom/client'
import PetWidget from './content/PetWidget'
import '@/assets/styles/globals.css'

export default defineContentScript({
  matches: ['<all_urls>'],
  excludeMatches: ['https://chrome.google.com/*'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    console.log('Cyber Buddy content script loaded')

    // Create UI container
    const ui = await createShadowRootUi(ctx, {
      name: 'cyber-buddy-pet',
      position: 'inline',
      onMount: (container) => {
        // Create React root and render Pet Widget
        const root = createRoot(container)
        root.render(<PetWidget />)
        return root
      },
      onRemove: (root) => {
        root?.unmount()
      },
    })

    // Mount UI
    ui.mount()

    // Listen for messages from background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      handleMessage(message)
      sendResponse({ received: true })
    })

    // Extract and send page content for better classification
    setTimeout(() => {
      extractAndSendPageContent()
    }, 2000) // Wait for page to settle
  },
})

/**
 * Handle messages from background service
 */
function handleMessage(message: any) {
  switch (message.type) {
    case 'PET_STATE_CHANGE':
      // Pet state change will be handled by PetWidget component via event
      window.dispatchEvent(
        new CustomEvent('cyber-buddy:state-change', {
          detail: message.payload,
        })
      )
      break

    case 'PAGE_CLASSIFIED':
      console.log('Page classified:', message.payload)
      break
  }
}

/**
 * Extract page content for classification
 */
function extractAndSendPageContent() {
  try {
    // Get page title
    const title = document.title

    // Get headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
      .map((el) => el.textContent?.trim())
      .filter(Boolean)
      .slice(0, 5)

    // Get meta description
    const metaDescription =
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute('content') || ''

    // Get some body text
    const bodyText = document.body.innerText.slice(0, 1000)

    // Send to background for analysis
    chrome.runtime.sendMessage({
      type: 'PAGE_CONTENT_EXTRACTED',
      payload: {
        url: window.location.href,
        title,
        content: `${headings.join(' ')} ${metaDescription} ${bodyText}`,
      },
    })
  } catch (error) {
    console.error('Failed to extract page content:', error)
  }
}
