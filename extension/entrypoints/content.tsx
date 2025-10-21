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

export default defineContentScript({
  matches: ['<all_urls>'],
  excludeMatches: ['https://chrome.google.com/*'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    console.log('Cyber Buddy content script loaded')

    // Inject CSS styles
    const style = document.createElement('style')
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      
      .cyber-buddy-pet-widget {
        font-family: 'Press Start 2P', monospace;
        user-select: none;
        pointer-events: auto;
        z-index: 9999;
      }
      
      .cyber-buddy-pet-widget * {
        box-sizing: border-box;
      }
      
      .pixel-art {
        image-rendering: pixelated;
        image-rendering: -moz-crisp-edges;
        image-rendering: crisp-edges;
      }
      
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes typing {
        0%, 20% { opacity: 0.3; }
        40% { opacity: 1; }
        60%, 100% { opacity: 0.3; }
      }
      
      .typing-animation {
        animation: typing 1.4s infinite;
      }
      
      .cyber-buddy-pet-widget button:hover {
        transform: scale(1.05);
      }
      
      .cyber-buddy-pet-widget button:active {
        transform: scale(0.95);
      }
    `
    document.head.appendChild(style)

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
function handleMessage(message: any, sender: any, sendResponse: any) {
  switch (message.type) {
    case 'PING':
      // Respond to ping to confirm content script is loaded
      sendResponse({ pong: true })
      break

    case 'PET_STATE_CHANGE':
      // Pet state change will be handled by PetWidget component via event
      window.dispatchEvent(
        new CustomEvent('cyber-buddy:state-change', {
          detail: message.payload,
        })
      )
      break

    case 'SHOW_PET':
    case 'HIDE_PET':
      // Pet visibility will be handled by PetWidget component via storage change
      window.postMessage({
        type: 'TOGGLE_PET_VISIBILITY',
        visible: message.payload.visible,
      }, '*')
      break

    case 'PAGE_CLASSIFIED':
      console.log('Page classified:', message.payload)
      break
  }
  
  return true // Keep message channel open for async response
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
