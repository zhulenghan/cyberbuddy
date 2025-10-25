import { useNavigate, useLocation } from 'react-router-dom'
import { HomeIcon, ClockIcon, CircleAlertIcon } from 'raster-react' 

interface PixelFooterProps {
  className?: string
}

export function PixelFooter({ className = '' }: PixelFooterProps) {
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
      highlight: true,
    },
    {
      icon: CircleAlertIcon,
      path: '/settings',
      label: 'Settings',
    },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .pixel-footer {
          font-family: 'Press Start 2P', cursive;
        }
        .pixel-nav-btn {
          border: 3px solid #1a1a1a;
          box-shadow: 4px 4px 0 #000000;
          transition: all 0.1s;
          cursor: pointer;
          background-color: #808080;
        }
        .pixel-nav-btn:active {
          box-shadow: 1px 1px 0 #000000;
          transform: translate(3px, 3px);
        }
        .pixel-nav-btn.active {
          background-color: #ff00ff;
          border-color: #ff00ff;
          color: #ffffff;
        }
        .pixel-nav-btn:hover:not(.active) {
          background-color: #00ffff;
          border-color: #00ffff;
        }
      `}</style>
      
      <div className={`fixed left-0 top-0 h-full w-16 bg-gray-800 border-r-4 border-black z-50 pixel-footer ${className}`}>
        <div className="flex flex-col items-center gap-4 h-full justify-center py-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`pixel-nav-btn w-12 h-12 flex items-center justify-center ${
                  isActive ? 'active' : ''
                }`}
                aria-label={item.label}
                title={item.label}
              >
                <Icon
                  className={`${
                    item.highlight ? 'w-6 h-6 stroke-[3]' : 'w-5 h-5 stroke-[2]'
                  } ${isActive ? 'text-white' : 'text-black'}`}
                />
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
