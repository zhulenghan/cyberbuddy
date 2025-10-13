import { useNavigate } from 'react-router-dom'
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
      danger: true,
    },
    {
      label: 'LOG OUT',
      onClick: handleLogout,
      danger: true,
    },
  ]

  return (
    <div className="h-[600px] w-[400px] bg-gray-800 flex items-center justify-center p-3 overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .font-pixel { font-family: 'Press Start 2P', cursive; }
        .pixel-border { border: 4px solid #1a1a1a; box-shadow: 8px 8px 0 #000000; background-color: #f0f0f0; }
        .pixel-button { border: 3px solid #1a1a1a; box-shadow: 4px 4px 0 #000000; transition: all 0.1s; cursor: pointer; }
        .pixel-button:active:not(:disabled) { box-shadow: 1px 1px 0 #000000; transform: translate(3px, 3px); }
        .neon-pink { background-color: #ff00ff; }
        .neon-cyan { background-color: #00ffff; }
        .text-neon-pink { color: #ff00ff; }
        .text-neon-cyan { color: #00ffff; }
        .dark-bg { background-color: #1a1a1a; }
      `}</style>

      <div className="pixel-border w-full p-3 overflow-y-auto max-h-full">
        {/* Window Header */}
        <div className="dark-bg pixel-border border-2 px-3 py-2 mb-3 flex justify-between items-center relative">
          <button
            onClick={() => navigate('/home')}
            className="w-5 h-5 neon-cyan pixel-border border-2 cursor-pointer flex items-center justify-center text-sm text-black font-bold pixel-button hover:bg-cyan-300 z-10 flex-shrink-0"
          >
            <span className="transform scale-x-150">←</span>
          </button>
          <h1 className="font-pixel text-sm absolute left-1/2 transform -translate-x-1/2 select-none text-neon-cyan whitespace-nowrap">
            V I B E B U D D Y . E X E
          </h1>
          <div className="flex space-x-2 z-10 flex-shrink-0">
            <div className="w-4 h-4 neon-cyan pixel-border border-2 cursor-pointer"></div>
            <div className="w-4 h-4 bg-red-600 pixel-border border-2 cursor-pointer"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Settings Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 border-4 border-black bg-gray-300 flex items-center justify-center">
              <svg className="w-12 h-12 text-black" viewBox="0 0 264 270" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M127.016 0.945084C119.344 0.957184 111.672 0.977113 104 1.00002V36H95L94 40C93.4879 40.0488 92.978 40.0937 92.4701 40.1384C90.292 40.33 88.1477 40.5187 86 41L85 43C83.7081 43.3351 83.0766 43.4989 82.4376 43.625C81.8266 43.7456 81.2087 43.8316 80 44V42L75 41L74 32H63V22H53L52 31L42 32V42L35.0664 41.9024C33.8608 41.9593 33.3586 41.9831 32.9508 42.1915C32.6596 42.3404 32.4166 42.5834 32 43C31.9282 44.5193 31.9161 46.0417 31.9375 47.5625L32 52H22L21.8594 54.4844L21.75 57.75C21.6775 59.4175 21.6424 60.2253 21.6789 61.0299C21.7132 61.7859 21.8108 62.5391 22 64C23.9837 66.4797 25.2357 67.7452 28.25 68.75L30 69V72C30.9186 72.3419 31.4081 72.5241 31.8762 72.7505C32.4102 73.0087 32.9164 73.3243 34 74C34.6504 75.3414 35.3163 76.6753 36 78L40 79V94L36 95V103L32 104V109H0V162L32 163L33 168H36V177L40 178V192H37C36.6207 192.959 36.4233 193.458 36.1873 193.938C35.931 194.459 35.6293 194.959 35 196C33.2749 196.575 32.5418 196.819 32.0401 197.304C31.6693 197.661 31.425 198.15 31 199L30 201L27 202C26.3697 203.681 25.7021 205.348 25 207L21 208V218H32V228L42 229L43 238H52V249H64V239H72L73 233H75L76 228H86V231H96V236H104V270H159V237H166L167 232H176V228H187V232L191 233L192 239H197V249H208V238H218V228H229V218H242V207L239 206L238 203L236 202.5L234 202C233.533 200.6 233.245 199.734 232.8 198.958C232.081 197.701 230.953 196.679 228 194L225.879 193.293C224.864 192.74 224.304 192.435 223.974 191.968C223.57 191.393 223.514 190.572 223.391 188.742L223.25 184.875C223.149 182.584 223.06 180.292 223 178H227V168H230V162H264V109L231 108L230 103H228V94L223 93L224 79L227 78L228 75L232 73L233 70C234.719 69.4271 235.453 69.1825 235.966 68.7019C236.349 68.3437 236.609 67.8543 237.062 67L238 65L240 64V52H229V42H218V32L209 31L208 22H197V31H192C191.622 32.2087 191.426 32.8319 191.187 33.4378C190.933 34.083 190.628 34.7085 190 36L187 37L185.812 39.5625L185 42L176 43V40L167 39L166 35H159C159.021 31.1061 159.038 27.2123 159.049 23.3184C159.053 21.7331 159.057 20.1478 159.062 18.5625C159.075 16.2189 159.088 13.8754 159.093 11.5317L159.098 9.31642C159.115 6.86822 159.088 4.44832 159 2.00002C158.594 1.59427 158.353 1.35315 158.065 1.20184C157.643 0.980218 157.119 0.951223 155.83 0.879761L152.929 0.88649L149.654 0.886719L146.09 0.902359C142.344 0.906786 138.599 0.912505 134.853 0.924576C132.241 0.933208 129.629 0.940041 127.016 0.945084Z" fill="currentColor"/>
                <path d="M88 93C117.04 93 146.08 93 176 93C176.021 106.839 176.041 120.679 176.062 134.938C176.072 139.314 176.081 143.69 176.09 148.199C176.095 153.526 176.095 153.526 176.095 156.017C176.097 157.764 176.101 159.511 176.106 161.257C176.113 163.897 176.114 166.536 176.114 169.176C176.117 169.959 176.121 170.742 176.124 171.549C176.114 176.886 176.114 176.886 175 178C172.292 178.095 169.609 178.126 166.9 178.114C166.051 178.114 165.203 178.114 164.328 178.114C161.509 178.113 158.69 178.105 155.871 178.098C153.922 178.096 151.973 178.094 150.024 178.093C144.883 178.09 139.742 178.08 134.601 178.069C128.439 178.057 122.277 178.052 116.114 178.046C106.743 178.036 97.3715 178.017 88 178C88 149.95 88 121.9 88 93Z" fill="#1a1a1a"/>
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="font-pixel text-base text-center text-neon-pink mb-4">SETTINGS</h2>

          {/* Menu Items */}
          <div className="space-y-2 px-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`pixel-button w-full font-pixel text-[9px] py-3 uppercase ${
                  item.danger
                    ? 'bg-red-600 text-white hover:bg-red-500'
                    : 'bg-gray-300 text-black hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Footer / Guidance */}
          <div className="text-center text-[8px] font-mono text-gray-400 mt-4">
            Having question? &gt;Go to <span className="text-neon-cyan underline cursor-pointer">guide</span>
          </div>

          {/* Footer Navigation Icons */}
          <Footer />
        </div>
      </div>
    </div>
  )
}
