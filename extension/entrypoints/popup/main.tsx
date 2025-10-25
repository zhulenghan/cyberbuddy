import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { LoadingPage } from '@/components/ui/loading'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/lib/store'
import { CONFIG } from '@/lib/config'

// Pages
import Welcome from '@/pages/Welcome'
import Home from '@/pages/Home'
import CreatePet from '@/pages/CreatePet'
import Instruction from '@/pages/Instruction'
import FocusReport from '@/pages/FocusReport'
import Settings from '@/pages/Settings'
import Guide from '@/pages/Guide'

import '@/assets/styles/globals.css'
import './style.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AuthRedirect() {
  const { isAuthenticated, isLoading } = useAuth()
  const [petCheckComplete, setPetCheckComplete] = useState(false)
  const [redirectPath, setRedirectPath] = useState<string | null>(null)
  
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('AuthRedirect: User authenticated, checking for pet...')
      
      // Check if user has a pet
      chrome.storage.local.get([CONFIG.STORAGE_KEYS.CURRENT_PET]).then((result) => {
        const currentPet = result[CONFIG.STORAGE_KEYS.CURRENT_PET]
        console.log('AuthRedirect: Current pet check:', currentPet)
        
        if (currentPet) {
          console.log('AuthRedirect: Pet found, redirecting to home')
          setRedirectPath('/home')
        } else {
          console.log('AuthRedirect: No pet found, redirecting to create-pet')
          setRedirectPath('/create-pet')
        }
        setPetCheckComplete(true)
      }).catch((error) => {
        console.error('AuthRedirect: Error checking for pet:', error)
        setRedirectPath('/create-pet')
        setPetCheckComplete(true)
      })
    } else if (!isAuthenticated && !isLoading) {
      // Not authenticated, show welcome page
      setPetCheckComplete(true)
    }
  }, [isAuthenticated, isLoading])
  
  // If authenticated and we have determined the redirect path
  if (isAuthenticated && redirectPath && petCheckComplete) {
    return <Navigate to={redirectPath} replace />
  }
  
  // If not authenticated and check is complete
  if (!isAuthenticated && petCheckComplete) {
    return <Welcome />
  }
  
  // Still checking authentication or pet status
  return <LoadingPage text="Loading..." />
}

function App() {
  const { isLoading, loadSession } = useAuthStore()

  // Load session only once on app mount
  useEffect(() => {
    console.log('Main App: Loading session on startup...')
    loadSession()
  }, [loadSession])

  // Show loading page during initial authentication check
  if (isLoading) {
    return <LoadingPage text="Checking authentication..." />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Routes>
          {/* Public route - with automatic redirect if authenticated */}
          <Route path="/" element={<AuthRedirect />} />

          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-pet"
            element={
              <ProtectedRoute>
                <CreatePet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instruction"
            element={
              <ProtectedRoute>
                <Instruction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/focus-report"
            element={
              <ProtectedRoute>
                <FocusReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guide"
            element={
              <ProtectedRoute>
                <Guide />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MemoryRouter>
      <Toaster />
    </QueryClientProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
