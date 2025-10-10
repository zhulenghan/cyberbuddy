import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Settings, Timer } from 'lucide-react'

interface FooterProps {
  className?: string
}

export function Footer({ className = '' }: FooterProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    {
      icon: Timer,
      path: '/focus-setup',
      label: 'Focus',
    },
    {
      icon: Home,
      path: '/home',
      label: 'Home',
      highlight: true, // Home icon has special styling
    },
    {
      icon: Settings,
      path: '/settings',
      label: 'Settings',
    },
  ]

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t py-4 ${className}`}>
      <div className="flex justify-center items-center gap-12">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center transition-all ${
                isActive ? 'drop-shadow-lg' : ''
              }`}
              aria-label={item.label}
            >
              <Icon
                className={`${
                  item.highlight
                    ? 'w-9 h-9 stroke-[3]'
                    : 'w-10 h-10'
                } text-black ${isActive ? 'scale-110' : ''}`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
