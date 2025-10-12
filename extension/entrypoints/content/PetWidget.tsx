/**
 * Pet Widget Component
 *
 * Renders the pet on the page
 */

import { useEffect, useState } from 'react'
import type { PetState } from '@shared/types'
import { CONFIG } from '@/lib/config'

export default function PetWidget() {
  const [petState, setPetState] = useState<PetState>('social')
  const [position, setPosition] = useState(CONFIG.PET_DEFAULT_POSITION)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [petImage, setPetImage] = useState<string | null>(null)

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

  // Load pet image
  useEffect(() => {
    // TODO: Load actual pet image from storage
    // For now, use placeholder
    setPetImage('https://via.placeholder.com/128/00D9FF/ffffff?text=Pet')
  }, [])

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
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
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      // Save position
      chrome.runtime.sendMessage({
        type: 'PET_POSITION_CHANGED',
        payload: { position },
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, position])

  if (!petImage) return null

  return (
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
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: isDragging ? 'none' : 'transform 0.3s ease',
          animation: petState === 'entertainment' ? 'bounce 1s infinite' : 'none',
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

      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .pixel-art {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
      `}</style>
    </div>
  )
}
