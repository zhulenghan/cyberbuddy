import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

interface HeaderProps {
  showBack?: boolean
  title?: string
  className?: string
  children?: React.ReactNode
}

export function Header({ showBack = true, title, className = '', children }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <div className={`px-4 py-3 flex items-center gap-4 ${className}`}>
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="hover:bg-vibe-gray-200 rounded-full p-1 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {title && (
        <h1 className="font-pixel text-xl font-bold flex-1" style={{color: 'red'}}>{title}</h1>
      )}
      {children}
    </div>
  )
}
