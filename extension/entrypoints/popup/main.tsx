import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { LoadingPage } from '@/components/ui/loading'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/lib/store'

// Pages
import Welcome from '@/pages/Welcome'
import Home from '@/pages/Home'
import CreatePet from '@/pages/CreatePet'
import Instruction from '@/pages/Instruction'
import FocusReport from '@/pages/FocusReport'
import Settings from '@/pages/Settings'

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

function App() {
  const { isLoading, loadSession } = useAuthStore()

  // Load session only once on app mount
  useEffect(() => {
    loadSession()
  }, [])

  // Show loading page during initial authentication check
  if (isLoading) {
    return <LoadingPage text="Loading..." />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Routes>
          {/* Public route */}
          <Route path="/" element={<Welcome />} />

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
