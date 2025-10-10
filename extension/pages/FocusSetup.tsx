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
    <div className="h-[600px] w-[400px] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full px-6 py-4 gap-3">
        {/* Header */}
        <div className="flex-shrink-0">
          <Header />
        </div>

        {/* Title */}
        <div className="flex-shrink-0 text-center">
          <h1 className="text-[24px] font-bold text-gray-800">FOCUS MODE</h1>
        </div>

        {/* Activity Selection */}
        <div className="flex-shrink-0">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
            <p className="text-xs font-bold text-center mb-3 text-gray-700">
              Which activity would you like to focus on today?
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {activities.map((activity) => (
                <button
                  key={activity}
                  onClick={() => setSelectedActivity(activity)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-bold transition-all ${
                    selectedActivity === activity
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                      : 'bg-white/80 text-gray-700 hover:bg-white'
                  }`}
                >
                  {activity}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Time Setup */}
        <div className="flex-shrink-0">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50">
            <h2 className="text-xl font-bold text-center mb-5 text-gray-800">Time Setup</h2>

            <div className="flex items-center justify-center gap-6">
              {/* Duration Display */}
              <div className="relative">
                <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center shadow-lg">
                  <div className="w-[90px] h-[90px] rounded-full bg-white flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-gray-800">{duration}</span>
                    <span className="text-xs font-semibold text-gray-600">Minutes</span>
                  </div>
                </div>
                {/* Duration controls */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  <button
                    onClick={() => setDuration(Math.max(5, duration - 5))}
                    className="w-7 h-7 bg-white/80 hover:bg-white rounded-lg text-sm font-bold shadow-md border border-white/50 text-gray-700"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setDuration(Math.min(120, duration + 5))}
                    className="w-7 h-7 bg-white/80 hover:bg-white rounded-lg text-sm font-bold shadow-md border border-white/50 text-gray-700"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Rest Session Option */}
              <div className="flex flex-col gap-2 items-center">
                <p className="text-[10px] font-bold text-center text-gray-700">
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
                    className="w-5 h-5 border-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-0"></div>

        {/* Start Button */}
        <div className="flex-shrink-0">
          <Button
            onClick={handleStart}
            disabled={!selectedActivity}
            className="w-full max-w-[140px] mx-auto block h-[34px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white text-sm font-bold shadow-lg rounded-xl disabled:opacity-50"
          >
            Start
          </Button>
        </div>

        {/* Help Link */}
        <div className="flex-shrink-0 text-center">
          <p className="text-[8px] italic font-bold text-gray-600">
            Having question? &gt;Go to{' '}
            <span className="underline">focus mode guide</span>
          </p>
        </div>

        {/* Footer Navigation */}
        <div className="flex-shrink-0">
          <Footer />
        </div>
      </div>
    </div>
  )
}
