import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/hooks/useAuth'

export default function Settings() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Failed to logout:', error)
      alert('Failed to logout. Please try again.')
    }
  }

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      return
    }

    try {
      await chrome.storage.local.clear()
      await chrome.storage.sync.clear()
      alert('All data has been cleared.')
      navigate('/')
    } catch (error) {
      console.error('Failed to clear data:', error)
      alert('Failed to clear data. Please try again.')
    }
  }

  const menuItems = [
    {
      label: 'Achievement System',
      onClick: () => alert('Achievement system coming soon!'),
    },
    {
      label: 'LANGUAGES',
      onClick: () => alert('Language settings coming soon!'),
    },
    {
      label: 'VIEW MY PLAN',
      onClick: () => alert('Plan view coming soon!'),
    },
    {
      label: 'CLEAR ALL DATA',
      onClick: handleClearData,
    },
    {
      label: 'LOG OUT',
      onClick: handleLogout,
    },
  ]

  return (
    <div className="h-[600px] w-[400px] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full px-6 py-4 gap-4">
        {/* Header */}
        <div className="flex-shrink-0">
          <Header />
        </div>

        {/* Logo/Icon */}
        <div className="flex-shrink-0 flex justify-center">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/40">
            <span className="text-2xl">⚙️</span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-shrink-0 px-8 space-y-3">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              onClick={item.onClick}
              className="w-full h-[60px] bg-white/70 backdrop-blur-sm hover:bg-white text-gray-800 text-sm font-bold uppercase rounded-2xl shadow-lg border border-white/50 transition-all"
            >
              {item.label}
            </Button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-0"></div>

        {/* Footer Navigation */}
        <div className="flex-shrink-0">
          <Footer />
        </div>
      </div>
    </div>
  )
}
