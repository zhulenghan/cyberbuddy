import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LoadingPage } from '@/components/ui/loading'
import { PetShowcaseCarousel } from '@/components/ui/carousel'
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
    return <LoadingPage text="Loading..." />
  }

  return (
    <div className="h-[600px] w-[400px] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col overflow-hidden relative">
      {/* Decorative background - stays in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Content Container - all in normal flow */}
      <div className="relative z-10 flex flex-col h-full px-6 py-4 gap-3">

        {/* Header Section */}
        <div className="flex-shrink-0 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl shadow-purple-500/40 mb-2 transform hover:scale-105 transition-all duration-300">
            <span className="text-2xl">🤖</span>
          </div>
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
            Cyber Buddy
          </h1>
          <p className="text-[11px] text-gray-600 font-medium">
            Your AI-powered focus companion
          </p>
        </div>

        {/* Carousel Section */}
        <div className="flex-shrink-0">
          <PetShowcaseCarousel />
        </div>

        {/* Error Message - conditional */}
        {error && (
          <div className="flex-shrink-0 animate-shake">
            <div className="p-2.5 bg-red-50 border-2 border-red-200 rounded-xl shadow-lg">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-[11px] font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Spacer to push content */}
        <div className="flex-1 min-h-0"></div>

        {/* Action Section */}
        <div className="flex-shrink-0 space-y-3">
          {/* Login Button */}
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full h-11 bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-gray-300 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoggingIn ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </Button>

          {/* Features */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2.5 border-2 border-white/80 shadow-md">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[11px] font-medium text-gray-700">AI-powered productivity tracking</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[11px] font-medium text-gray-700">Customize your cyber pet</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-pink-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[11px] font-medium text-gray-700">Stay focused & productive</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 space-y-1.5">
          <p className="text-[10px] text-gray-500 text-center leading-relaxed">
            By continuing, you agree to our{' '}
            <span className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">Terms</span>
            {' '}and{' '}
            <span className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">Privacy Policy</span>
          </p>
          <p className="text-[10px] font-medium text-gray-400 text-center">
            © 2025 Cyber Buddy
          </p>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-shake {
          animation: shake 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
