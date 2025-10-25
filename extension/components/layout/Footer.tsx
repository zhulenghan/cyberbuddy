import { useNavigate, useLocation } from 'react-router-dom'
import { HomeIcon, ClockIcon, CircleAlertIcon } from 'raster-react' 
//change to pixel icons from raster-react

interface FooterProps {
  className?: string
}

export function Footer({ className = '' }: FooterProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    {
      icon: ClockIcon,
      path: '/instruction',
      label: 'Focus',
    },
    {
      icon: HomeIcon,
      path: '/home',
      label: 'Home',
      highlight: true, // Home icon has special styling
    },
    {
      icon: CircleAlertIcon,
      path: '/settings',
      label: 'Settings',
    },
  ]

  return (
    <div className={`fixed top-0 left-0 h-full w-16 bg-gray-800 border-r-2 border-black z-50 ${className}`}>
      <div className="flex flex-col items-center gap-3 h-full justify-center py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`pixel-border border-2 bg-gray-800 p-2 flex items-center justify-center transition-all ${
                isActive ? 'border-[#ff00ff] drop-shadow-lg' : 'border-black'
              }`}
              aria-label={item.label}
            >
              <Icon
                className={`${
                  item.highlight ? 'w-6 h-6 stroke-[3]' : 'w-5 h-5'
                } ${isActive ? 'text-[#ff00ff]' : 'text-[#00ffff]'}`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
