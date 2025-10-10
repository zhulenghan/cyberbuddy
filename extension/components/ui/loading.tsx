import { cn } from '@/lib/utils/cn'

interface LoadingProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

const sizeClasses = {
  sm: 'w-6 h-6 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-12 h-12 border-4',
}

export function Loading({ className, size = 'md', text }: LoadingProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-gray-300 border-t-cyber-500',
          sizeClasses[size]
        )}
      />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}

export function LoadingPage({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="h-[600px] w-[400px] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Loading content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6">
        {/* Animated Logo with Border Fill */}
        <div className="relative w-24 h-24">
          {/* Center logo */}
          <div className="absolute inset-2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/40">
            <span className="text-4xl">🤖</span>
          </div>

          {/* SVG Border Animation */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <rect
              x="2"
              y="2"
              width="96"
              height="96"
              rx="16"
              ry="16"
              fill="none"
              stroke="url(#borderGradient)"
              strokeWidth="3"
              strokeDasharray="380"
              strokeDashoffset="380"
              className="border-fill-animation"
            />
          </svg>
        </div>

        {/* Loading text */}
        {text && (
          <p className="text-sm font-semibold text-gray-700">{text}</p>
        )}

        {/* Loading dots */}
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes borderFill {
          0% {
            stroke-dashoffset: 380;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        .border-fill-animation {
          animation: borderFill 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
