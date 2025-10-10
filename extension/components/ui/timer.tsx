import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface TimerProps {
  duration: number // in milliseconds
  onComplete?: () => void
  onTick?: (remaining: number) => void
  autoStart?: boolean
  className?: string
}

export function Timer({
  duration,
  onComplete,
  onTick,
  autoStart = false,
  className,
}: TimerProps) {
  const [remaining, setRemaining] = useState(duration)
  const [isRunning, setIsRunning] = useState(autoStart)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1000

        if (next <= 0) {
          setIsRunning(false)
          onComplete?.()
          return 0
        }

        onTick?.(next)
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, onComplete, onTick])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const progress = ((duration - remaining) / duration) * 100

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Circular Timer Display */}
      <div className="relative">
        <svg className="w-[134px] h-[138px] transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="67"
            cy="69"
            r="60"
            fill="#C6C6C6"
            stroke="none"
          />
          {/* Progress circle */}
          <circle
            cx="67"
            cy="69"
            r="52"
            fill="#E5E5E5"
            stroke="#909090"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{formatTime(remaining)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!isRunning && remaining > 0 && (
          <button
            onClick={() => setIsRunning(true)}
            className="px-4 py-2 bg-vibe-gray-700 hover:bg-vibe-gray-800 rounded text-sm font-bold transition-colors"
          >
            {remaining === duration ? 'Start' : 'Resume'}
          </button>
        )}

        {isRunning && (
          <button
            onClick={() => {
              setIsRunning(false)
              setIsPaused(true)
            }}
            className="px-4 py-2 bg-vibe-gray-700 hover:bg-vibe-gray-800 rounded text-sm font-bold transition-colors"
          >
            Pause
          </button>
        )}

        {(isPaused || (!isRunning && remaining < duration && remaining > 0)) && (
          <button
            onClick={() => {
              setRemaining(duration)
              setIsRunning(false)
              setIsPaused(false)
            }}
            className="px-4 py-2 bg-vibe-gray-600 hover:bg-vibe-gray-700 rounded text-sm font-bold transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}

interface TimerDisplayProps {
  minutes: number
  className?: string
}

export function TimerDisplay({ minutes, className }: TimerDisplayProps) {
  return (
    <div className={cn('relative', className)}>
      <div className="w-[134px] h-[138px] rounded-full bg-vibe-gray-700 flex items-center justify-center">
        <div className="w-[95px] h-[98px] rounded-full bg-vibe-gray-500 flex flex-col items-center justify-center">
          <span className="text-sm font-bold">{minutes}</span>
          <span className="text-sm font-bold">Minutes</span>
        </div>
      </div>
    </div>
  )
}
