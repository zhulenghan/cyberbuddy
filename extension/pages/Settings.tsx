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
    <div className="min-h-[600px] w-[420px] bg-white flex flex-col overflow-y-auto pb-20">
      {/* Header */}
      <Header />

      {/* Logo/Icon */}
      <div className="flex justify-center mb-8">
        <div className="w-[36px] h-[32px] bg-vibe-gray-700 flex items-center justify-center">
          <span className="text-[8px] font-normal">Icon</span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-12 space-y-4 mb-8">
        {menuItems.map((item, index) => (
          <Button
            key={index}
            onClick={item.onClick}
            className="w-full h-[68px] bg-vibe-gray-600 hover:bg-vibe-gray-700 text-black text-[15px] font-bold uppercase"
          >
            {item.label}
          </Button>
        ))}
      </div>

      {/* Footer Navigation */}
      <Footer />
    </div>
  )
}
