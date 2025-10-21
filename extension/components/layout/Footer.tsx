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
    <div className={`fixed bottom-0 left-0 right-0 py-4 ${className}`}>
      <div className="flex justify-center items-center gap-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`pixel-border border-2 bg-transparent p-2 flex items-center justify-center transition-all ${
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
