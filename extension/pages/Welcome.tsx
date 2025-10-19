import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function Welcome() {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, login, error } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Check if user has created a pet
      chrome.storage.local.get(['currentPet']).then(({ currentPet }) => {
        if (currentPet) {
          navigate('/home')
        } else {
          navigate('/create-pet')
        }
      })
    }
  }, [isAuthenticated, isLoading, navigate])

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true)
    try {
      await login()
      // Navigation will happen in useEffect after isAuthenticated changes
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-[600px] w-[400px] bg-gray-800 flex items-center justify-center">
        <div className="pixel-border p-6 text-center">
          <p className="font-pixel text-sm text-neon-cyan animate-pulse">LOADING...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[600px] w-[400px] bg-gray-800 flex items-center justify-center p-3 overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .font-pixel { font-family: 'Press Start 2P', cursive; }
        .pixel-border { border: 4px solid #1a1a1a; box-shadow: 8px 8px 0 #000000; background-color: #f0f0f0; }
        .pixel-button { border: 3px solid #1a1a1a; box-shadow: 4px 4px 0 #000000; transition: all 0.1s; cursor: pointer; }
        .pixel-button:active:not(:disabled) { box-shadow: 1px 1px 0 #000000; transform: translate(3px, 3px); }
        .pixel-button:disabled { opacity: 0.6; cursor: not-allowed; }
        .neon-pink { background-color: #ff00ff; }
        .neon-cyan { background-color: #00ffff; }
        .text-neon-pink { color: #ff00ff; }
        .text-neon-cyan { color: #00ffff; }
        .dark-bg { background-color: #1a1a1a; }
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
{/* Window Header */}
      <div className="pixel-border w-full p-4 overflow-y-auto max-h-full">
          {/* ---do we need this part?
          Window Header 
        <div className="dark-bg pixel-border border-2 px-3 py-2 mb-4 flex justify-between items-center relative">
          <div className="w-5 h-5 flex-shrink-0"></div>
          <h1 className="font-pixel text-[10px] absolute left-1/2 transform -translate-x-1/2 select-none text-neon-cyan whitespace-nowrap">
            V I B E B U D D Y . E X E
          </h1>
          <div className="flex space-x-2 z-10 flex-shrink-0">
            <div className="w-4 h-4 neon-cyan pixel-border border-2"></div>
            <div className="w-4 h-4 bg-red-600 pixel-border border-2"></div>
          </div>
        </div>
        */}
        {/* Main Content */}
        <div className="space-y-4">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 border-4 border-black bg-gray-300 flex items-center justify-center">
              <span className="text-5xl">🤖</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="font-pixel text-lg text-neon-pink">ViBE BUDDY</h2>
            <p className="font-mono text-[10px] text-black">Your AI-powered focus companion</p>
          </div>

          {/* Pet Showcase */}
          <div className="pixel-border bg-white p-3">
            <div className="flex items-center justify-center space-x-2 h-24">
              <div className="w-20 h-20 border-2 border-black bg-gray-200 flex items-center justify-center">
                <span className="text-3xl">🐱</span>
              </div>
              <div className="w-20 h-20 border-2 border-black bg-gray-200 flex items-center justify-center">
                <span className="text-3xl">🐶</span>
              </div>
              <div className="w-20 h-20 border-2 border-black bg-gray-200 flex items-center justify-center">
                <span className="text-3xl">🦊</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="pixel-border bg-red-100 border-red-600 p-2">
              <p className="font-mono text-[9px] text-red-800 text-center">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="pixel-button w-full neon-cyan font-pixel text-[10px] text-black py-3 hover:bg-cyan-300"
          >
            {isLoggingIn ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-blink">▶</span>
                SIGNING IN...
              </span>
            ) : (
              'CONTINUE WITH GOOGLE'
            )}
          </button>

          {/* Features List */}
          <div className="pixel-border bg-white p-3 space-y-2">
            <h3 className="font-pixel text-[9px] text-neon-pink mb-2 text-center">FEATURES</h3>
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <span className="text-neon-cyan text-[10px] flex-shrink-0">▶</span>
                <p className="font-mono text-[9px] text-black leading-relaxed">AI-powered productivity tracking</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-neon-cyan text-[10px] flex-shrink-0">▶</span>
                <p className="font-mono text-[9px] text-black leading-relaxed">Customize your cyber pet</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-neon-cyan text-[10px] flex-shrink-0">▶</span>
                <p className="font-mono text-[9px] text-black leading-relaxed">Stay focused & productive</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-1 pt-2">
            <p className="font-mono text-[8px] text-gray-400 leading-relaxed">
              By continuing, you agree to our{' '}
              <span className="text-neon-cyan underline cursor-pointer">Terms</span>
              {' '}and{' '}
              <span className="text-neon-cyan underline cursor-pointer">Privacy Policy</span>
            </p>
            <p className="font-mono text-[8px] text-gray-500">
              © 2025 Cyber Buddy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
