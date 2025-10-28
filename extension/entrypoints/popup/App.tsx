/**
 * Popup UI - Main App
 */

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePet } from '@/hooks/usePet'
import { useActivityTracker } from '@/hooks/useActivityTracker'
import '@/assets/styles/globals.css'
import './style.css'
import { useAuthStore } from '@/lib/store/authStore'

function App() {
  const { isAuthenticated, isLoading: authLoading, login, error } = useAuth()
  const { currentPet, currentState } = usePet()
  const { todayStats, currentLabel } = useActivityTracker()
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    useAuthStore.getState().loadSession()
  }, [])

  const handleLogin = async () => {
    setIsLoggingIn(true)
    try {
      await login()
      console.log('Login successful!')
    } catch (err) {
      console.error('Login failed:', err)
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (authLoading) {
    return (
      <div className="popup-container">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="popup-container">
        <div className="welcome">
          <h1 className="text-2xl font-bold mb-4">🤖 Cyber Buddy</h1>
          <p className="mb-4">Your AI-powered desktop companion</p>
          {error && (
            <div className="error-message mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}
          <button
            className="btn-pixel"
            onClick={handleLogin}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </div>
      </div>
    )
  }

  const totalHours = todayStats
    ? Math.floor(todayStats.totalDuration / (1000 * 60 * 60))
    : 0
  const totalMinutes = todayStats
    ? Math.floor((todayStats.totalDuration % (1000 * 60 * 60)) / (1000 * 60))
    : 0

  return (
    <div className="popup-container">
      {/* Header */}
      <div className="header">
        <h1 className="text-xl font-bold">Cyber Buddy</h1>
        <div className="pet-state">
          State: <span className="font-bold">{currentState}</span>
        </div>
      </div>

      {/* Current Activity */}
      <div className="section">
        <h2 className="section-title">Current Activity</h2>
        <div className="activity-label">
          <span className="label-badge">{currentLabel}</span>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="section">
        <h2 className="section-title">Today's Focus Time</h2>
        <div className="stats-time">
          {totalHours}h {totalMinutes}m
        </div>

        {todayStats && (
          <div className="stats-breakdown">
            {Object.entries(todayStats.byLabel).map(([label, stats]) => {
              if (stats.duration === 0) return null
              return (
                <div key={label} className="stat-item">
                  <span className="stat-label">{label}</span>
                  <span className="stat-value">
                    {Math.floor(stats.duration / (1000 * 60))}m
                  </span>
                  <span className="stat-percentage">
                    ({Math.round(stats.percentage)}%)
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions">
          <button className="btn-pixel btn-pixel-secondary">
            📊 View Report
          </button>
          <button className="btn-pixel btn-pixel-secondary">
            🎨 Change Pet
          </button>
          <button className="btn-pixel btn-pixel-secondary">⚙️ Settings</button>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <p className="text-xs text-gray-500">
          {currentPet ? `Pet: ${currentPet.prompt}` : 'No pet selected'}
        </p>
      </div>
    </div>
  )
}

export default App
