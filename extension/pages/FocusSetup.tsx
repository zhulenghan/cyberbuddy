import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function FocusSetup() {
  const navigate = useNavigate()
  const [selectedActivity, setSelectedActivity] = useState('')
  const [skipRest, setSkipRest] = useState(false)
  const [duration, setDuration] = useState(30)

  const activities = [
    'Work',
    'Study',
    'Reading',
    'Music',
    'Shopping',
    'Searching',
  ]

  const handleStart = async () => {
    if (!selectedActivity) {
      alert('Please select an activity')
      return
    }

    try {
      // Send message to background script to start focus timer
      await chrome.runtime.sendMessage({
        type: 'START_FOCUS_TIMER',
        payload: {
          activity: selectedActivity,
          duration: duration * 60 * 1000,
          skipRest,
        },
      })

      navigate('/focus-report')
    } catch (error) {
      console.error('Failed to start focus timer:', error)
      alert('Failed to start focus timer. Please try again.')
    }
  }

  return (
    <div className="min-h-[600px] w-[420px] bg-white flex flex-col overflow-y-auto pb-20">
      {/* Header */}
      <Header />

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-[25px] font-bold">FOCUS MODE</h1>
      </div>

      {/* Activity Selection */}
      <div className="px-6 mb-6">
        <div className="bg-vibe-gray-500 rounded p-4">
          <p className="text-xs font-bold text-center mb-4">
            Which activity would you like to focus on today?
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {activities.map((activity) => (
              <button
                key={activity}
                onClick={() => setSelectedActivity(activity)}
                className={`px-6 py-2 rounded text-[10px] font-bold transition-colors ${
                  selectedActivity === activity
                    ? 'bg-vibe-gray-900 text-white'
                    : 'bg-vibe-gray-700'
                }`}
              >
                {activity}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Time Setup */}
      <div className="px-6 mb-6">
        <div className="bg-vibe-gray-500 rounded p-6">
          <h2 className="text-[21px] font-bold text-center mb-6">Time Setup</h2>

          <div className="flex items-center justify-center gap-8">
            {/* Duration Display */}
            <div className="relative">
              <div className="w-[134px] h-[138px] rounded-full bg-vibe-gray-700 flex items-center justify-center">
                <div className="w-[95px] h-[98px] rounded-full bg-vibe-gray-500 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold">{duration}</span>
                  <span className="text-sm font-bold">Minutes</span>
                </div>
              </div>
              {/* Duration controls */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                <button
                  onClick={() => setDuration(Math.max(5, duration - 5))}
                  className="px-2 py-1 bg-vibe-gray-700 rounded text-xs"
                >
                  -
                </button>
                <button
                  onClick={() => setDuration(Math.min(120, duration + 5))}
                  className="px-2 py-1 bg-vibe-gray-700 rounded text-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Rest Session Option */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold text-center">
                You will have 1 rest session
                <br />
                <br />
                Skip the rest?
              </p>
              <div className="flex items-center justify-center">
                <Checkbox
                  id="skip-rest"
                  checked={skipRest}
                  onCheckedChange={(checked) => setSkipRest(checked as boolean)}
                  className="w-4 h-4 border-black"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="px-6 mb-4">
        <Button
          onClick={handleStart}
          disabled={!selectedActivity}
          className="w-full max-w-[132px] mx-auto block h-[31px] bg-vibe-gray-700 hover:bg-vibe-gray-800 text-[15px] font-bold shadow-md disabled:opacity-50"
        >
          Start
        </Button>
      </div>

      {/* Help Link */}
      <div className="text-center mb-8">
        <p className="text-[8px] italic font-bold">
          Having question? &gt;Go to{' '}
          <span className="underline">focus mode guide</span>
        </p>
      </div>

      {/* Footer Navigation */}
      <Footer />
    </div>
  )
}
