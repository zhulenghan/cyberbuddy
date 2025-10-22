/**
 * Focus Timer Component
 * 
 * A floating timer for focus sessions
 */

import { useState, useEffect } from 'react'

interface FocusTimerProps {
  onClose: () => void
  onStart: (minutes: number) => void
  onTimeUpdate: (time: string) => void
  petPosition?: { x: number; y: number }
  onHide?: () => void
}

export default function FocusTimer({ onClose, onStart, onTimeUpdate, petPosition, onHide }: FocusTimerProps) {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const [totalSeconds, setTotalSeconds] = useState(25 * 60)
  const [initialMinutes, setInitialMinutes] = useState(25)
  const [displayTime, setDisplayTime] = useState('00:00')
  const [customMinutes, setCustomMinutes] = useState('')

  // Show completion notification
  const showCompletionNotification = () => {
    console.log('FocusTimer: Showing completion notification')
    
    // Get current pet position from storage
    chrome.storage.local.get(['petPosition'], (result) => {
      const currentPetPosition = result.petPosition || petPosition
      console.log('Current pet position:', currentPetPosition)
      
      // Create a notification dialog with adaptive positioning
      const notification = document.createElement('div')
      
      // Calculate adaptive position
      let topPosition, leftPosition, transformValue
      
      if (currentPetPosition) {
        const notificationHeight = 200 // Approximate height of notification
        const notificationWidth = 200 // Approximate width of notification
        const margin = 20 // Margin from screen edge
        
        // Check if there's enough space above the pet
        if (currentPetPosition.y - notificationHeight - margin > 0) {
          // Position above pet
          topPosition = `${currentPetPosition.y - notificationHeight - margin}px`
        } else {
          // Position below pet
          topPosition = `${currentPetPosition.y + 120}px`
        }
        
        // Check if there's enough space to center horizontally
        const screenWidth = window.innerWidth
        const leftCenter = currentPetPosition.x - notificationWidth / 2
        
        if (leftCenter >= margin && leftCenter + notificationWidth <= screenWidth - margin) {
          // Center horizontally
          leftPosition = `${leftCenter}px`
          transformValue = 'none'
        } else if (leftCenter < margin) {
          // Align to left edge with margin
          leftPosition = `${margin}px`
          transformValue = 'none'
        } else {
          // Align to right edge with margin
          leftPosition = `${screenWidth - notificationWidth - margin}px`
          transformValue = 'none'
        }
      } else {
        // Fallback to center of screen
        topPosition = '50%'
        leftPosition = '50%'
        transformValue = 'translate(-50%, -50%)'
      }
      
      notification.style.cssText = `
        position: fixed;
        top: ${topPosition};
        left: ${leftPosition};
        transform: ${transformValue};
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
    })
  }

  // Load timer state from storage on mount
  useEffect(() => {
    chrome.storage.local.get(['timerActive', 'timerMinutes', 'timerTime', 'timerPaused', 'timerCompact', 'timerStartTime', 'timerDuration'], (result) => {
      if (result.timerActive) {
        // If timer is running, calculate current remaining time
        if (result.timerStartTime && result.timerDuration) {
          const now = Date.now()
          const elapsed = Math.floor((now - result.timerStartTime) / 1000)
          const remaining = Math.max(0, result.timerDuration / 1000 - elapsed)
          const mins = Math.floor(remaining / 60)
          const secs = remaining % 60

          setMinutes(mins)
          setSeconds(secs)
          setInitialMinutes(result.timerMinutes || mins)
          setTotalSeconds((result.timerMinutes || mins) * 60)
          setIsRunning(true)
          setIsPaused(result.timerPaused || false)
          setIsCompact(false) // Always show full interface when opened
        } else {
          // Fallback to stored time
          const storedTime = result.timerTime || '25:00'
          console.log('FocusTimer: Loading fallback time:', storedTime)
          
          if (typeof storedTime === 'string' && storedTime.match(/^\d{2}:\d{2}$/)) {
            const timeParts = storedTime.split(':')
            const storedMinutes = parseInt(timeParts[0], 10)
            const storedSeconds = parseInt(timeParts[1], 10)

            setMinutes(storedMinutes)
            setSeconds(storedSeconds)
            setInitialMinutes(result.timerMinutes || storedMinutes)
            setTotalSeconds((result.timerMinutes || storedMinutes) * 60)
            setIsRunning(true)
            setIsPaused(result.timerPaused || false)
            setIsCompact(false) // Always show full interface when opened
          } else {
            console.warn('FocusTimer: Invalid timer time format:', storedTime, 'using default')
            setMinutes(25)
            setSeconds(0)
            setInitialMinutes(25)
            setTotalSeconds(25 * 60)
            setIsRunning(false)
            setIsPaused(false)
            setIsCompact(false)
          }
        }
      }
    })
  }, [])

  // Background timer - no UI updates, just storage updates
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        // Calculate current time from storage instead of local state
        chrome.storage.local.get(['timerStartTime', 'timerDuration'], (result) => {
          if (result.timerStartTime && result.timerDuration) {
            const now = Date.now()
            const elapsed = Math.floor((now - result.timerStartTime) / 1000)
            const remaining = Math.max(0, result.timerDuration / 1000 - elapsed)
            
            if (remaining === 0) {
              // Timer finished
              setIsRunning(false)
              onTimeUpdate('00:00')
              // Clear timer state - PetWidget will handle notification
              chrome.storage.local.set({ 
                timerActive: false,
                timerMinutes: 0,
                timerTime: '00:00',
                timerPaused: false,
                timerCompact: false,
                timerStartTime: null,
                timerDuration: null
              })
              console.log('FocusTimer: Timer completed, notification will be shown by PetWidget')
            } else {
              // Update storage with remaining time
              const mins = Math.floor(remaining / 60)
              const secs = remaining % 60
              const timeString = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
              
              chrome.storage.local.set({ 
                timerTime: timeString,
                timerActive: true,
                timerMinutes: mins,
                timerPaused: false,
                timerCompact: isCompact
              })
            }
          }
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, isPaused, onTimeUpdate, isCompact])

  // Load current time from storage when component mounts or when user opens timer
  useEffect(() => {
    if (isRunning) {
      chrome.storage.local.get(['timerTime'], (result) => {
        if (result.timerTime) {
          const timeParts = result.timerTime.split(':')
          const storedMinutes = parseInt(timeParts[0], 10)
          const storedSeconds = parseInt(timeParts[1], 10)
          setMinutes(storedMinutes)
          setSeconds(storedSeconds)
          onTimeUpdate(result.timerTime)
        }
      })
    }
  }, [isRunning, onTimeUpdate])

  // Update display time for compact mode
  useEffect(() => {
    if (isCompact && isRunning) {
      const updateDisplayTime = () => {
        chrome.storage.local.get(['timerStartTime', 'timerDuration'], (result) => {
          if (result.timerStartTime && result.timerDuration) {
            const now = Date.now()
            const elapsed = Math.floor((now - result.timerStartTime) / 1000)
            const remaining = Math.max(0, result.timerDuration / 1000 - elapsed)
            const mins = Math.floor(remaining / 60)
            const secs = remaining % 60
            setDisplayTime(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`)
          }
        })
      }
      
      // Update immediately
      updateDisplayTime()
      
      // Update every second only when in compact mode
      const interval = setInterval(updateDisplayTime, 1000)
      
      return () => clearInterval(interval)
    }
  }, [isCompact, isRunning])

  const handleStart = () => {
    console.log('FocusTimer: Starting timer with', minutes, 'minutes')
    setInitialMinutes(minutes)
    setIsRunning(true)
    setIsPaused(false)
    setIsCompact(false) // Don't auto-hide timer
    onStart(minutes)
    
    // Calculate end time using timestamp
    const now = Date.now()
    const duration = minutes * 60 * 1000 // Convert to milliseconds
    const endTime = now + duration
    
    // Save timer state with timestamp
    chrome.storage.local.set({ 
      timerActive: true,
      timerMinutes: minutes,
      timerTime: `${String(minutes).padStart(2, '0')}:00`,
      timerPaused: false,
      timerCompact: false, // Don't auto-hide timer
      timerStartTime: now,
      timerDuration: duration
    })
    
    // Request notification permission if needed
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const handlePause = () => {
    setIsPaused(true)
    // Save paused state but keep timerActive true
    chrome.storage.local.set({ 
      timerActive: true,
      timerMinutes: minutes,
      timerTime: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      timerPaused: true,
      timerCompact: isCompact
    })
  }

  const handleResume = () => {
    setIsPaused(false)
    // Save resumed state
    chrome.storage.local.set({ 
      timerActive: true,
      timerMinutes: minutes,
      timerTime: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      timerPaused: false,
      timerCompact: isCompact
    })
  }

  const handleTimeClick = () => {
    if (isCompact) {
      console.log('FocusTimer: Switching to full mode')
      // Load current time from storage
      chrome.storage.local.get(['timerStartTime', 'timerDuration'], (result) => {
        if (result.timerStartTime && result.timerDuration) {
          const now = Date.now()
          const elapsed = Math.floor((now - result.timerStartTime) / 1000)
          const remaining = Math.max(0, result.timerDuration / 1000 - elapsed)
          const mins = Math.floor(remaining / 60)
          const secs = remaining % 60
          
          setMinutes(mins)
          setSeconds(secs)
          onTimeUpdate(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`)
        }
      })
      
      setIsCompact(false) // Show controls
      // Save state
      chrome.storage.local.set({ 
        timerActive: true,
        timerMinutes: minutes,
        timerTime: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
        timerPaused: isPaused,
        timerCompact: false
      })
    } else {
      console.log('FocusTimer: Switching to compact mode')
      setIsCompact(true) // Hide controls
      // Save state
      chrome.storage.local.set({ 
        timerActive: true,
        timerMinutes: minutes,
        timerTime: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
        timerPaused: isPaused,
        timerCompact: true
      })
    }
  }

  const handleHide = () => {
    console.log('FocusTimer: Hiding timer')
    if (onHide) {
      onHide()
    }
  }

  const handleExit = () => {
    console.log('FocusTimer: Exiting timer completely')
    // Stop timer and close
    setIsRunning(false)
    setIsPaused(false)
    setIsCompact(false)
    // Clear timer state
    chrome.storage.local.set({
      timerActive: false,
      timerMinutes: initialMinutes,
      timerTime: `${String(initialMinutes).padStart(2, '0')}:00`,
      timerPaused: false,
      timerCompact: false,
      timerStartTime: null,
      timerDuration: null
    })
    onClose()
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsPaused(false)
    setMinutes(initialMinutes)
    setSeconds(0)
    // Clear timer state
    chrome.storage.local.set({ 
      timerActive: false,
      timerMinutes: initialMinutes,
      timerTime: `${String(initialMinutes).padStart(2, '0')}:00`,
      timerPaused: false,
      timerCompact: false
    })
  }

  const handleSetTime = (mins: number) => {
    setTotalSeconds(mins * 60)
    setMinutes(mins)
    setSeconds(0)
    setInitialMinutes(mins)
    setIsRunning(false)
    setIsPaused(false)
    setCustomMinutes('') // Clear custom input
    // Save new time setting
    chrome.storage.local.set({ 
      timerActive: false,
      timerMinutes: mins,
      timerTime: `${String(mins).padStart(2, '0')}:00`,
      timerPaused: false,
      timerCompact: false
    })
  }

  const handleCustomTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setCustomMinutes(value)
    }
  }

  const handleCustomTimeSubmit = () => {
    const mins = parseInt(customMinutes, 10)
    if (!isNaN(mins) && mins > 0 && mins <= 999) {
      handleSetTime(mins)
    } else {
      alert('请输入 1-999 之间的分钟数')
    }
  }

  const handleCustomTimeKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCustomTimeSubmit()
    }
  }

  // Calculate position based on pet position - below pet
  const getPosition = () => {
    if (petPosition) {
      return {
        position: 'fixed' as const,
        top: `${petPosition.y + 140}px`, // 140px below pet (pet size + margin)
        left: `${petPosition.x - 100}px`, // centered on pet
        transform: 'none',
      }
    }
    return {
      position: 'fixed' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }
  }


  // Full mode - show all controls
  console.log('FocusTimer: Rendering full mode, minutes:', minutes, 'seconds:', seconds, 'isRunning:', isRunning)
  return (
    <div style={{
      ...getPosition(),
      background: 'rgba(0, 0, 0, 0.95)',
      border: '2px solid #00ffff',
      borderRadius: '8px',
      padding: '12px',
      minWidth: '180px',
      maxWidth: '200px',
      zIndex: 9998,
      fontFamily: "'Press Start 2P', monospace",
      boxShadow: '0 4px 20px rgba(0, 255, 255, 0.3)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '8px', color: '#ff00ff', margin: 0 }}>FOCUS TIMER</h3>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={handleHide}
            style={{
              background: '#ffff00',
              border: '1px solid #000',
              color: '#000',
              cursor: 'pointer',
              fontSize: '6px',
              padding: '2px 4px',
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            HIDE
          </button>
          <button
            onClick={handleExit}
            style={{
              background: '#ff0000',
              border: '1px solid #000',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '6px',
              padding: '2px 4px',
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            EXIT
          </button>
        </div>
      </div>

      {/* Timer Display */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '16px',
          color: '#00ffff',
          marginBottom: '8px',
          fontFamily: "'Press Start 2P', monospace",
          textShadow: '0 0 5px #00ffff',
          padding: '6px',
          borderRadius: '4px',
          backgroundColor: 'rgba(0, 255, 255, 0.1)',
        }}
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>

      {/* Quick Set Buttons */}
      <div style={{ display: 'flex', gap: '3px', marginBottom: '6px', justifyContent: 'center' }}>
        {[15, 25, 45].map((mins) => (
          <button
            key={mins}
            onClick={() => handleSetTime(mins)}
            disabled={isRunning}
            style={{
              background: totalSeconds === mins * 60 ? '#00ffff' : '#555',
              border: '1px solid #000',
              color: totalSeconds === mins * 60 ? '#000' : '#fff',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontSize: '6px',
              padding: '3px 5px',
              fontFamily: "'Press Start 2P', monospace",
              opacity: isRunning ? 0.5 : 1,
            }}
          >
            {mins}m
          </button>
        ))}
      </div>

      {/* Custom Time Input */}
      <div style={{ display: 'flex', gap: '3px', marginBottom: '8px', alignItems: 'center', justifyContent: 'center' }}>
        <input
          type="text"
          value={customMinutes}
          onChange={handleCustomTimeInput}
          onKeyPress={handleCustomTimeKeyPress}
          placeholder="自定义"
          maxLength={3}
          disabled={isRunning}
          style={{
            width: '60px',
            padding: '3px 4px',
            fontSize: '6px',
            fontFamily: "'Press Start 2P', monospace",
            border: '1px solid #00ffff',
            background: 'rgba(0, 255, 255, 0.1)',
            color: '#00ffff',
            textAlign: 'center',
            borderRadius: '2px',
            outline: 'none',
            opacity: isRunning ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
          onFocus={(e) => {
            e.target.style.background = 'rgba(0, 255, 255, 0.2)'
            e.target.style.boxShadow = '0 0 8px rgba(0, 255, 255, 0.5)'
          }}
          onBlur={(e) => {
            e.target.style.background = 'rgba(0, 255, 255, 0.1)'
            e.target.style.boxShadow = 'none'
          }}
        />
        <span style={{ fontSize: '6px', color: '#888' }}>分钟</span>
        <button
          onClick={handleCustomTimeSubmit}
          disabled={isRunning || !customMinutes}
          style={{
            background: '#00ff00',
            border: '1px solid #000',
            color: '#000',
            cursor: (isRunning || !customMinutes) ? 'not-allowed' : 'pointer',
            fontSize: '6px',
            padding: '3px 6px',
            fontFamily: "'Press Start 2P', monospace",
            opacity: (isRunning || !customMinutes) ? 0.5 : 1,
          }}
        >
          SET
        </button>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
        {!isRunning ? (
          <button
            onClick={handleStart}
            style={{
              background: '#00ff00',
              border: '1px solid #000',
              color: '#000',
              cursor: 'pointer',
              fontSize: '6px',
              padding: '4px 8px',
              fontFamily: "'Press Start 2P', monospace",
              flex: 1,
            }}
          >
            START
          </button>
        ) : isPaused ? (
          <button
            onClick={handleResume}
            style={{
              background: '#00ff00',
              border: '1px solid #000',
              color: '#000',
              cursor: 'pointer',
              fontSize: '6px',
              padding: '4px 8px',
              fontFamily: "'Press Start 2P', monospace",
              flex: 1,
            }}
          >
            RESUME
          </button>
        ) : (
          <button
            onClick={handlePause}
            style={{
              background: '#ffff00',
              border: '1px solid #000',
              color: '#000',
              cursor: 'pointer',
              fontSize: '6px',
              padding: '4px 8px',
              fontFamily: "'Press Start 2P', monospace",
              flex: 1,
            }}
          >
            PAUSE
          </button>
        )}
        <button
          onClick={handleReset}
          style={{
            background: '#ff00ff',
            border: '1px solid #000',
            color: '#000',
            cursor: 'pointer',
            fontSize: '6px',
            padding: '4px 8px',
            fontFamily: "'Press Start 2P', monospace",
            flex: 1,
          }}
        >
          RESET
        </button>
      </div>
    </div>
  )
}

