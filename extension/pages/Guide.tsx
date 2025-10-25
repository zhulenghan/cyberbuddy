import { useNavigate } from 'react-router-dom'
import { PixelFooter } from '@/components/layout/PixelFooter'
import { ArrowLeftIcon } from 'raster-react'

export default function Guide() {
  const navigate = useNavigate()

  return (
    <div className="h-[600px] w-[450px] bg-gray-800 flex relative overflow-hidden">
      {/* Left Sidebar Navigation */}
      <PixelFooter />
      
      {/* Main Content - properly spaced from sidebar */}
      <div className="ml-16 flex-1 relative z-10 h-full">
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
        .guide-section { margin-bottom: 20px; padding: 16px; border: 2px solid #1a1a1a; background-color: #ffffff; }
        .guide-title { font-size: 12px; color: #ff00ff; margin-bottom: 8px; }
        .guide-content { font-size: 10px; line-height: 1.4; color: #1a1a1a; font-family: monospace; }
        .privacy-section { border-color: #00ffff; }
      `}</style>

        <div className="pixel-border w-full h-full p-4 overflow-y-auto">
        {/* Window Header */}
        <div className="dark-bg pixel-border border-2 px-4 py-2 mb-4 flex justify-between items-center relative">
            <button
            onClick={() => navigate(-1)}
            className="w-5 h-5 neon-cyan pixel-border border-2 cursor-pointer flex items-center justify-center text-sm text-black font-bold pixel-button hover:bg-cyan-300 z-10 flex-shrink-0"
          >
            <ArrowLeftIcon className="w-8 h-8 text-black stroke-[3]" />
          </button>
          <h1 className="font-pixel text-[8px] absolute left-1/2 transform -translate-x-1/2 select-none text-neon-cyan whitespace-nowrap">
            G U I D E S  &  H E L P
          </h1>
          <div className="flex space-x-2 z-10 flex-shrink-0">
            <div className="w-4 h-4 neon-cyan pixel-border border-2 cursor-pointer"></div>
            <div className="w-4 h-4 bg-red-600 pixel-border border-2 cursor-pointer"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          
          {/* Content Area - Ready for your content */}
          <div className="text-center text-[12px] font-mono text-gray-500 mt-8">
            <p>Guide content coming soon...</p>
            <p className="mt-4 text-[10px]">This page is ready for you to add your guides and documentation.</p>
          </div>

        </div>
        </div>
      </div>
    </div>
  )
}