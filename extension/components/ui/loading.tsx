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
    <div className="w-[400px] h-[600px] bg-gray-800 flex items-center justify-center p-3">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .font-pixel { font-family: 'Press Start 2P', cursive; }
        .pixel-border { border: 4px solid #1a1a1a; box-shadow: 8px 8px 0 #000000; background-color: #f0f0f0; }
        .text-neon-cyan { color: #00ffff; }
        .text-neon-pink { color: #ff00ff; }
        
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
        
        @keyframes bounce-pixel {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .bounce-1 { animation: bounce-pixel 1s infinite; animation-delay: 0s; }
        .bounce-2 { animation: bounce-pixel 1s infinite; animation-delay: 0.15s; }
        .bounce-3 { animation: bounce-pixel 1s infinite; animation-delay: 0.3s; }
      `}</style>

      <div className="pixel-border p-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 border-4 border-black bg-gray-300 flex items-center justify-center">
            <img 
              src="/icon/96.png" 
              alt="Cyber Buddy" 
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>

        {/* Loading text */}
        <div className="mb-4">
          <p className="font-pixel text-base text-neon-pink mb-2">{text.toUpperCase()}</p>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-black border-2 border-black bounce-1"></div>
          <div className="w-3 h-3 bg-black border-2 border-black bounce-2"></div>
          <div className="w-3 h-3 bg-black border-2 border-black bounce-3"></div>
        </div>

        {/* Blinking cursor */}
        <div className="mt-4 flex justify-center">
          <span className="font-pixel text-sm text-neon-cyan animate-blink">▶</span>
        </div>
      </div>
    </div>
  )
}
