import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { LoadingPage } from '@/components/ui/loading'
import { PetShowcaseCarousel } from '@/components/ui/carousel'
import { useAuth } from '@/hooks/useAuth'

export default function Welcome() {
  const [name, setName] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, login } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/home')
    }
  }, [isAuthenticated, isLoading, navigate])

  const handleStart = async () => {
    if (!name || !agreedToTerms) return

    try {
      // Save user name to storage
      await chrome.storage.local.set({ userName: name })

      // If not authenticated, trigger Google OAuth
      if (!isAuthenticated) {
        await login()
      }

      // Navigate to home after successful login
      navigate('/home')
    } catch (error) {
      console.error('Failed to start:', error)
    }
  }

  if (isLoading) {
    return <LoadingPage text="Loading..." />
  }

  return (
    <div className="min-h-[600px] w-[420px] bg-white flex flex-col items-center justify-center px-4 overflow-y-auto">
      {/* Logo/Icon */}
      <div className="mb-8">
        <div className="w-[141px] h-[133px] bg-vibe-gray-600 flex items-center justify-center rounded">
          <span className="text-black text-xl font-normal">Icon</span>
        </div>
      </div>

      {/* Carousel of pet visuals */}
      <PetShowcaseCarousel className="mb-8" />

      {/* Welcome Section */}
      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-[30px] font-bold mb-6">Welcome!</h1>

        {/* Name Input */}
        <div className="w-full max-w-[217px] mb-4">
          <Input
            type="text"
            placeholder="input name here"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-[25px] bg-vibe-gray-600 border-none text-center text-[10px] shadow-md"
          />
        </div>

        {/* Greeting */}
        {name && (
          <p className="text-xl font-normal mb-4">Nice to meet you, {name}!</p>
        )}

        {/* Terms Checkbox */}
        <div className="flex items-center gap-3 mb-6">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            className="w-5 h-5 border-black data-[state=checked]:bg-vibe-dark"
          />
          <label
            htmlFor="terms"
            className="text-[8px] italic text-sm font-normal cursor-pointer"
          >
            By checking this box, you are agreeing to our{' '}
            <span className="underline">terms of service</span>
          </label>
        </div>

        {/* Start Button */}
        <Button
          onClick={handleStart}
          disabled={!name || !agreedToTerms}
          className="w-full max-w-[217px] h-[41px] bg-vibe-gray-800 hover:bg-vibe-gray-900 text-black text-xl font-normal shadow-md disabled:opacity-50"
        >
          LET'S START!
        </Button>

        {/* Alternative Account Link */}
        <p className="mt-4 text-[8px]">&gt;&gt; use another account?</p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center">
        <p className="text-[10px] font-normal">
          2025 VibeBuddy. All rights reserved
        </p>
      </div>
    </div>
  )
}
