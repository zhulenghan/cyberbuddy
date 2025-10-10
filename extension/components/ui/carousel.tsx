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
}

export function PetShowcaseCarousel({ className }: PetShowcaseCarouselProps) {
  const showcasePets = [
    { id: 1, text: 'Floating Ghost', color: 'bg-gradient-to-br from-purple-200 to-purple-400' },
    { id: 2, text: 'Tiny Dragon', color: 'bg-gradient-to-br from-red-200 to-orange-400' },
    { id: 3, text: 'Pixel Bird', color: 'bg-gradient-to-br from-blue-200 to-cyan-400' },
    { id: 4, text: 'Cyber Cat', color: 'bg-gradient-to-br from-pink-200 to-rose-400' },
    { id: 5, text: 'Digital Spirit', color: 'bg-gradient-to-br from-green-200 to-emerald-400' },
  ]

  const items = showcasePets.map((pet) => (
    <div
      key={pet.id}
      className={cn(
        'w-full h-full flex items-center justify-center rounded',
        pet.color
      )}
    >
      <p className="text-center text-sm font-bold px-4 text-gray-800">
        {pet.text}
        <br />
        <span className="text-xs">Cyber Pet</span>
      </p>
    </div>
  ))

  return (
    <div className={cn('relative w-full max-w-[420px] h-[326px]', className)}>
      {/* Left side preview */}
      <div className="absolute left-0 top-0 w-[96px] h-[326px] bg-vibe-gray-200 rounded shadow-lg flex items-center justify-center z-0">
        <p className="text-center text-xs px-2">
          Visuals of other
          <br />
          cyber pets
        </p>
      </div>

      {/* Center carousel */}
      <div className="absolute left-1/2 -translate-x-1/2 w-[253px] h-[326px] z-10">
        <Carousel
          items={items}
          autoPlay={true}
          interval={3000}
          className="w-full h-full bg-vibe-gray-200 rounded shadow-lg"
        />
      </div>

      {/* Right side preview */}
      <div className="absolute right-0 top-0 w-[96px] h-[326px] bg-vibe-gray-200 rounded shadow-lg flex items-center justify-center z-0">
        <p className="text-center text-xs px-2">
          Visuals of other
          <br />
          cyber pets
        </p>
      </div>
    </div>
  )
}
