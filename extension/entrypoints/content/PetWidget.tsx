/**
 * Enhanced Pet Widget Component
 *
 * Features:
 * - Draggable floating pet
 * - Click menu with focus timer, chat, and hide options
 * - GIF support
 * - State-based animations
 */

import { useEffect, useState } from 'react'
import type { PetState } from '@shared/types'
import { CONFIG } from '@/lib/config'
import FocusTimer from './FocusTimer'
import ChatBox from './ChatBox'
import { debugPetData, validatePetImages } from '@/lib/utils/debugPet'

export default function PetWidget() {
  const [petState, setPetState] = useState<PetState>('idle')
  const [position, setPosition] = useState(CONFIG.PET_DEFAULT_POSITION)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [petImage, setPetImage] = useState<string | null>(null)
  const [petName, setPetName] = useState('Buddy')
  const [isVisible, setIsVisible] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [showTimer, setShowTimer] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [timerActive, setTimerActive] = useState(false)
  const [timerTime, setTimerTime] = useState('25:00')

  // Show completion notification
  const showCompletionNotification = () => {
    console.log('PetWidget: Showing completion notification')
    
    // Get current pet position
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: ${position.y - 120}px;
      left: ${position.x - 100}px;
      background: rgba(0, 0, 0, 0.95);
      border: 4px solid #00ff00;
      border-radius: 12px;
      padding: 20px;
      z-index: 99999;
      font-family: 'Press Start 2P', monospace;
      box-shadow: 0 8px 32px rgba(0, 255, 0, 0.5);
      text-align: center;
      min-width: 200px;
      pointer-events: auto;
    `
    
    // Create elements
    const title = document.createElement('div')
    title.style.cssText = 'font-size: 16px; color: #00ff00; margin-bottom: 12px;'
    title.textContent = '🎉 FOCUS COMPLETE! 🎉'
    
    const message = document.createElement('div')
    message.style.cssText = 'font-size: 12px; color: #ffffff; margin-bottom: 16px;'
    message.textContent = 'Great job! Time for a break.'
    
    const button = document.createElement('button')
    button.style.cssText = `
      background: #00ff00;
      border: 2px solid #000;
      color: #000;
      padding: 8px 16px;
      font-family: 'Press Start 2P', monospace;
      font-size: 10px;
      cursor: pointer;
      border-radius: 4px;
    `
    button.textContent = 'OK'
    button.onclick = () => {
      console.log('Notification button clicked')
      notification.remove()
    }
    
    notification.appendChild(title)
    notification.appendChild(message)
    notification.appendChild(button)
    
    document.body.appendChild(notification)
    console.log('Notification appended to body')
    
    // Auto remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        console.log('Auto-removing notification')
        notification.remove()
      }
    }, 10000)
    
    // Play notification sound
    if (Notification.permission === 'granted') {
      new Notification('Focus Session Complete!', {
        body: 'Great job! Time for a break.',
        icon: chrome.runtime.getURL('icon/128.png'),
      })
    }
  }

  // Background timer monitor - check every second
  useEffect(() => {
    const interval = setInterval(() => {
      chrome.storage.local.get(['timerActive', 'timerStartTime', 'timerDuration'], (result) => {
        if (result.timerActive && result.timerStartTime && result.timerDuration) {
          const now = Date.now()
          const elapsed = Math.floor((now - result.timerStartTime) / 1000)
          const remaining = Math.max(0, result.timerDuration / 1000 - elapsed)
          
          // Check if timer just finished (remaining === 0)
          if (remaining === 0) {
            console.log('PetWidget: Timer completed in background!')
            // Show notification
            showCompletionNotification()
            // Clear timer state
            chrome.storage.local.set({
              timerActive: false,
              timerMinutes: 0,
              timerTime: '00:00',
              timerPaused: false,
              timerCompact: false,
              timerStartTime: null,
              timerDuration: null
            })
            // Update local state
            setTimerActive(false)
            setTimerTime('25:00')
          }
        }
      })
    }, 1000) // Check every second

    return () => clearInterval(interval)
  }, [position]) // Include position so notification uses current position

  // Listen for visibility toggle messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'TOGGLE_PET_VISIBILITY') {
        setIsVisible(event.data.visible)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Listen for state changes
  useEffect(() => {
    const handleStateChange = (event: CustomEvent) => {
      const { state } = event.detail
      setPetState(state)
    }

    window.addEventListener(
      'cyber-buddy:state-change' as any,
      handleStateChange
    )

    return () => {
      window.removeEventListener(
        'cyber-buddy:state-change' as any,
        handleStateChange
      )
    }
  }, [])

  // Update pet image when state changes
  useEffect(() => {
    chrome.storage.local.get([CONFIG.STORAGE_KEYS.CURRENT_PET], (result) => {
      const currentPet = result[CONFIG.STORAGE_KEYS.CURRENT_PET]
      if (currentPet && currentPet.images) {
        const pet = currentPet
        
        // Map frontend states to backend states
        const stateMapping: Record<PetState, string> = {
          idle: 'social',
          happy: 'entertainment', 
          focused: 'focused',
          tired: 'shopping',
          excited: 'entertainment'
        }
        
        const backendState = stateMapping[petState] || 'social'
        
        if (pet.images[backendState]) {
          console.log('Updating pet image for new state', petState, '->', backendState, ':', pet.images[backendState])
          setPetImage(pet.images[backendState])
        } else if (pet.images.social) {
          console.log('Using social image as fallback for state', petState)
          setPetImage(pet.images.social)
        }
      }
    })
  }, [petState])

  // Load pet data from storage
  useEffect(() => {
    const loadPetData = () => {
      chrome.storage.local.get([CONFIG.STORAGE_KEYS.CURRENT_PET, 'petVisible', 'timerActive', 'timerTime'], (result) => {
        console.log('Loading pet data:', result)

        const currentPet = result[CONFIG.STORAGE_KEYS.CURRENT_PET]
        if (currentPet) {
          const pet = currentPet
          console.log('PetWidget: Pet data:', pet)
          console.log('PetWidget: pet.name:', pet.name)
          console.log('PetWidget: pet.prompt:', pet.prompt)
          const displayName = pet.name || pet.prompt || 'Buddy'
          console.log('PetWidget: Using display name:', displayName)
          setPetName(displayName)

          // Debug pet data
          console.log('=== PETWIDGET DEBUG ===')
          console.log('Current pet:', pet)
          const validation = validatePetImages(pet)
          console.log('Pet validation:', validation)

          // Map frontend states to backend states
          const stateMapping: Record<PetState, string> = {
            idle: 'social',
            happy: 'entertainment',
            focused: 'focused',
            tired: 'shopping',
            excited: 'entertainment'
          }

          const backendState = stateMapping[petState] || 'social'

          // Load pet image based on current state
          if (pet.images && pet.images[backendState]) {
            console.log('Setting pet image for state', petState, '->', backendState, ':', pet.images[backendState])
            setPetImage(pet.images[backendState])
          } else if (pet.images && pet.images.social) {
            console.log('Using social image as fallback:', pet.images.social)
            setPetImage(pet.images.social)
          } else {
            console.log('No pet images found, using placeholder')
            setPetImage('https://via.placeholder.com/128/00D9FF/ffffff?text=Pet')
          }
        } else {
          console.log('No current pet found, using placeholder')
          setPetImage('https://via.placeholder.com/128/00D9FF/ffffff?text=Pet')
        }

        // Check if pet should be visible
        if (result.petVisible !== undefined) {
          setIsVisible(result.petVisible)
        }

        // Load timer state
        if (result.timerActive) {
          setTimerActive(true)
          const storedTime = result.timerTime || '25:00'
          console.log('PetWidget: Loading timer time from storage:', storedTime)
          // Validate timer time format
          if (typeof storedTime === 'string' && storedTime.match(/^\d{2}:\d{2}$/)) {
            setTimerTime(storedTime)
          } else {
            console.warn('PetWidget: Invalid timer time format:', storedTime, 'using default')
            setTimerTime('25:00')
          }
          // Load compact mode state
          if (result.timerCompact) {
            // Timer should be in compact mode, but we need to show the timer interface
            setShowTimer(true)
          }
        }
      })
    }

    // Load initial data
    loadPetData()

    // Listen for storage changes
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes[CONFIG.STORAGE_KEYS.CURRENT_PET]) {
        const pet = changes[CONFIG.STORAGE_KEYS.CURRENT_PET].newValue
        console.log('Pet data changed:', pet)
        if (pet) {
          setPetName(pet.name || pet.prompt || 'Buddy')
          // Map frontend states to backend states
          const stateMapping: Record<PetState, string> = {
            idle: 'social',
            happy: 'entertainment', 
            focused: 'focused',
            tired: 'shopping',
            excited: 'entertainment'
          }
          
          const backendState = stateMapping[petState] || 'social'
          
          // Update image based on current state
          if (pet.images && pet.images[backendState]) {
            console.log('Updating pet image for state', petState, '->', backendState, ':', pet.images[backendState])
            setPetImage(pet.images[backendState])
          } else if (pet.images && pet.images.social) {
            console.log('Using social image as fallback:', pet.images.social)
            setPetImage(pet.images.social)
          }
        }
      }
      if (changes.petVisible) {
        setIsVisible(changes.petVisible.newValue)
      }
      if (changes.timerActive) {
        setTimerActive(changes.timerActive.newValue)
      }
        if (changes.timerTime) {
          const newTime = changes.timerTime.newValue
          console.log('PetWidget: Timer time changed:', newTime)
          // Validate timer time format
          if (typeof newTime === 'string' && newTime.match(/^\d{2}:\d{2}$/)) {
            setTimerTime(newTime)
          } else {
            console.warn('PetWidget: Invalid timer time format in storage change:', newTime)
          }
        }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    // Cleanup
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (showMenu) return // Don't drag when menu is open
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  // Handle drag move
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      }
      setPosition(newPosition)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, position])

  // Save position to storage when it changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      chrome.storage.local.set({ petPosition: position })
      console.log('PetWidget: Position saved to storage:', position)
    }, 100) // Debounce to avoid too many writes

    return () => clearTimeout(timeoutId)
  }, [position])

  // Handle pet click (toggle menu)
  const handlePetClick = (e: React.MouseEvent) => {
    if (isDragging) return
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  // Timer callbacks
  const handleTimerStart = (minutes: number) => {
    console.log('PetWidget: Timer started with', minutes, 'minutes')
    console.log('PetWidget: Before timer start - isVisible:', isVisible, 'petImage:', petImage)
    setTimerActive(true)
    setShowMenu(false)
    // Save timer state to storage
    chrome.storage.local.set({ 
      timerActive: true, 
      timerMinutes: minutes,
      timerTime: `${String(minutes).padStart(2, '0')}:00`,
      timerPaused: false,
      timerCompact: false // Don't auto-hide timer
    })
    console.log('PetWidget: After timer start - isVisible:', isVisible, 'petImage:', petImage)
  }

  const handleTimerClose = () => {
    console.log('PetWidget: Timer closed')
    setShowTimer(false)
    setTimerActive(false)
    setTimerTime('25:00')
    // Clear timer state from storage
    chrome.storage.local.set({ 
      timerActive: false,
      timerMinutes: 25,
      timerTime: '25:00',
      timerPaused: false,
      timerCompact: false,
      timerStartTime: null,
      timerDuration: null
    })
  }

  const handleTimerHide = () => {
    console.log('PetWidget: Timer hidden')
    setShowTimer(false)
    // Don't change timerActive - keep timer running in background
  }

  const handleTimerTimeUpdate = (time: string) => {
    setTimerTime(time)
    // Storage updates are now handled by FocusTimer component
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showMenu) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showMenu])

  // Menu actions
  const handleOpenTimer = () => {
    if (timerActive) {
      // If timer is active, show timer controls
      setShowTimer(true)
    } else {
      // If timer is not active, show timer setup
      setShowTimer(true)
    }
    setShowMenu(false)
  }

  const handleOpenChat = () => {
    setShowChat(true)
    setShowMenu(false)
  }

  const handleHidePet = () => {
    setIsVisible(false)
    setShowMenu(false)
    // Save visibility state
    chrome.storage.local.set({ petVisible: false })
  }

  if (!isVisible || !petImage) {
    console.log('PetWidget: Not rendering - isVisible:', isVisible, 'petImage:', petImage)
    return null
  }

  return (
    <>
      <div
        className="cyber-buddy-pet-widget"
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${CONFIG.PET_SIZE}px`,
          height: `${CONFIG.PET_SIZE}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: 9999,
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
      >

        <div
          className="pet-container"
          onClick={handlePetClick}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: isDragging ? 'none' : 'transform 0.3s ease',
            animation: petState === 'entertainment' ? 'bounce 1s infinite' : 'none',
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
          }}
        >
          <img
            src={petImage}
            alt="Pet"
            className="pixel-art"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
            draggable={false}
          />
        </div>

        {/* Menu */}
        {showMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '50%',
              left: '140px',
              transform: 'translateY(-50%)',
              background: '#1a1a1a',
              border: '3px solid #00ffff',
              borderRadius: '8px',
              padding: '12px',
              minWidth: '180px',
              boxShadow: '0 4px 16px rgba(0, 255, 255, 0.3)',
              zIndex: 10000,
            }}
          >
            <div style={{ marginBottom: '8px', fontSize: '10px', color: '#00ffff', fontWeight: 'bold', textAlign: 'center' }}>
              {petName}'s Menu
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleOpenTimer}
                style={{
                  background: '#00ffff',
                  border: '2px solid #000',
                  color: '#000',
                  padding: '10px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'transform 0.1s',
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                ⏰ {timerActive ? `计时中 ${timerTime || '25:00'}` : '专注计时器'}
              </button>
              <button
                onClick={handleOpenChat}
                style={{
                  background: '#ff00ff',
                  border: '2px solid #000',
                  color: '#000',
                  padding: '10px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'transform 0.1s',
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                💬 和宠物对话
              </button>
              <button
                onClick={handleHidePet}
                style={{
                  background: '#555',
                  border: '2px solid #000',
                  color: '#fff',
                  padding: '10px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'transform 0.1s',
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                👻 收起宠物
              </button>
            </div>
          </div>
        )}

        {/* State indicator (for debugging) */}
        {CONFIG.DEBUG && (
          <div
            style={{
              position: 'absolute',
              bottom: '-20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              whiteSpace: 'nowrap',
            }}
          >
            {petState}
          </div>
        )}

      </div>

      {/* Focus Timer (below pet) */}
      {showTimer && (
        <FocusTimer 
          onClose={handleTimerClose} 
          onStart={handleTimerStart}
          onTimeUpdate={handleTimerTimeUpdate}
          petPosition={position}
          onHide={handleTimerHide}
        />
      )}

      {/* Chat Box (below pet) */}
      {showChat && (
        <ChatBox
          petName={petName}
          position={position}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  )
}
