import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'

interface CarouselProps {
  items: React.ReactNode[]
  autoPlay?: boolean
  interval?: number
  className?: string
}

export function Carousel({ items, autoPlay = true, interval = 3000, className }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, items.length])

  if (items.length === 0) return null

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Carousel items */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map((item, index) => (
          <div key={index} className="w-full flex-shrink-0">
            {item}
          </div>
        ))}
      </div>

      {/* Indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === currentIndex
                  ? 'bg-vibe-dark w-4'
                  : 'bg-vibe-gray-600 hover:bg-vibe-gray-800'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface PetShowcaseCarouselProps {
  className?: string
  pets?: Array<{ imageUrl?: string; name?: string }>
}

export function PetShowcaseCarousel({ className, pets = [] }: PetShowcaseCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Use provided pets or show placeholder
  const displayPets = pets.length > 0 ? pets : [
    { name: 'Your Pet', imageUrl: undefined },
    { name: 'Your Pet', imageUrl: undefined },
    { name: 'Your Pet', imageUrl: undefined },
  ]

  useEffect(() => {
    if (displayPets.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayPets.length)
    }, 3000)

    return () => clearInterval(timer)
  }, [displayPets.length])

  const getCardStyle = (index: number) => {
    const diff = index - currentIndex
    const total = displayPets.length

    // Normalize diff to be between -total/2 and total/2
    let normalizedDiff = diff
    if (diff > total / 2) normalizedDiff = diff - total
    if (diff < -total / 2) normalizedDiff = diff + total

    // Calculate position and scale
    const isCenter = normalizedDiff === 0
    const absOffset = Math.abs(normalizedDiff)

    // Use pixel-based positioning for better control
    let translateX = normalizedDiff * 120 // Spread cards by 120px
    let scale = isCenter ? 1 : 0.75 - (absOffset * 0.1)
    let opacity = isCenter ? 1 : 0.5 - (absOffset * 0.15)
    let zIndex = isCenter ? 20 : 10 - absOffset
    let rotateY = normalizedDiff * 15 // 3D rotation

    return {
      transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${Math.max(scale, 0.5)}) rotateY(${rotateY}deg)`,
      opacity: Math.max(opacity, 0.2),
      zIndex: Math.max(zIndex, 0),
      transition: 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
    }
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayPets.length) % displayPets.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayPets.length)
  }

  return (
    <div className={cn('relative w-full h-[220px]', className)}>
      {/* 3D Carousel Container */}
      <div className="relative w-full h-full perspective-1000">
        <div className="relative w-full h-full preserve-3d">
          {displayPets.map((pet, index) => (
            <div
              key={index}
              className="absolute top-1/2 left-1/2 w-[160px] h-[180px]"
              style={getCardStyle(index)}
            >
              <div className="w-full h-full bg-vibe-gray-200 rounded-xl shadow-lg flex flex-col items-center justify-center p-3 border-2 border-vibe-gray-400">
                {pet.imageUrl ? (
                  <>
                    <div className="w-full h-[130px] flex items-center justify-center mb-2">
                      <img
                        src={pet.imageUrl}
                        alt={pet.name || 'Pet'}
                        className="max-w-full max-h-full object-contain pixel-art"
                      />
                    </div>
                    <p className="text-xs font-bold text-center text-gray-800">
                      {pet.name}
                    </p>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl mb-2">🤖</div>
                      <p className="text-[10px] text-gray-600">Create Your Cyber Buddy</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {displayPets.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-all hover:scale-105"
            aria-label="Previous pet"
          >
            <svg
              className="w-4 h-4 text-gray-800"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-all hover:scale-105"
            aria-label="Next pet"
          >
            <svg
              className="w-4 h-4 text-gray-800"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Indicators */}
      {displayPets.length > 1 && (
        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1.5 z-30">
          {displayPets.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all duration-300',
                index === currentIndex
                  ? 'bg-vibe-dark w-3'
                  : 'bg-vibe-gray-600 hover:bg-vibe-gray-800'
              )}
              aria-label={`Go to pet ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* 3D perspective styles */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  )
}
