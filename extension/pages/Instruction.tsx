import { useState } from 'react'
import instructionImage from '@/assets/instruction.png'
import { useNavigate } from 'react-router-dom'
import { Footer } from '@/components/layout/Footer'
import { ArrowLeftIcon } from 'raster-react'
import { showPet } from '@/lib/utils/petControl'

export default function Instruction() {
  const navigate = useNavigate()
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const isConfirmed = selectedActivities.length > 0

  const activityOptions = [
    'Work',
    'Study',
    'Reading',
    'Music',
    'Shopping',
    'Social',
  ]

  const toggleActivity = (name: string) => {
    setSelectedActivities((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  return (
    <div className="h-[600px] w-[400px] bg-gray-800 flex items-center justify-center p-3 overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .font-pixel { font-family: 'Press Start 2P', cursive; }
        .pixel-border { border: 4px solid #1a1a1a; box-shadow: 8px 8px 0 #000000; background-color: #f0f0f0; }
        .pixel-button { border: 3px solid #000000ff; box-shadow: 4px 4px 0 #000000ff; transition: all 0.1s; cursor: pointer; }
        .pixel-button:active:not(:disabled) { box-shadow: 1px 1px 0 #000000; transform: translate(3px, 3px); }
        .pixel-input { border: 2px solid #000000ff; box-shadow: 2px 2px 0 #000000; font-family: monospace; padding: 6px 8px; background-color: #ffffff; font-size: 12px; }
        .text-neon-pink { color: #ff00ff; }
        .text-neon-cyan { color: #00ffff; }
        .dark-bg { background-color: #1a1a1a; }
        .neon-pink { color: #ff00ff; }
        .neon-cyan { color: #00ffff; }
        .bg-neon-cyan { background-color: #00ffff; }
        .activity-btn { font-size: 10px; padding: 6px 10px; background-color: #d0d0d0; margin: 4px; border-radius: 0; border: 2px solid #a0a0a0; box-shadow: 2px 2px 0 #808080; }
        .activity-btn.selected { background-color: #555555; color: #fff; box-shadow: 2px 2px 0 #000; }
        .phase-separator { height: 4px; background-color: #1a1a1a; margin: 16px 0; box-shadow: 0 4px 0 #000; }
      `}</style>

      <div className="pixel-border w-full h-full p-4 overflow-y-auto">
        {/* Window Header */}
        <div className="dark-bg pixel-border border-2 px-4 py-2 mb-4 flex justify-between items-center relative">
           <button
            onClick={() => navigate(-1)}
            className="w-5 h-5 neon-cyan pixel-border border-2 cursor-pointer flex items-center justify-center text-sm text-black font-bold pixel-button hover:bg-cyan-300 z-10 flex-shrink-0"
          >
            <ArrowLeftIcon className="w-4 h-4 bg-neon-cyan border-black text-black stroke-[3]" />
          </button>
          <h1 className="font-pixel text-[8px] absolute left-1/2 transform -translate-x-1/2 select-none text-neon-cyan whitespace-nowrap">
            V I B E B U D D Y . E X E
          </h1>
        {/* Square decorations */}
          <div className="flex space-x-1 z-10 flex-shrink-0">
            <div className="p-1 w-4 h-4 pixel-border border-2" style={{ backgroundColor: '#00ffff' }}></div>
            <div className="w-4 h-4 bg-red-600 pixel-border border-2"></div>
          </div>
        </div>

        {/* Phase 2: Set Activity */}
        <div className="space-y-3">
          <h1 className="font-pixel text-[10px] mb-2 text-neon-pink text-center">PHASE 2. SET ACTIVITY</h1>
          <section className="p-3 pixel-border bg-white space-y-3">
            <p className="font-pixel text-[10px] text-gray mb-2 text-center">Which activity do you want to do?</p>
            <div className="font-pixel flex flex-wrap justify-center p-1">
              {activityOptions.map((name) => (
                <button
                  key={name}
                  onClick={() => toggleActivity(name)}
                  className={`pixel-button activity-btn ${selectedActivities.includes(name) ? 'selected' : ''}`}
                >
                  {name}
                </button>
              ))}
            </div>
            <button
              disabled={!isConfirmed}
              className={`py-1 pixel-button text-[7px] w-full font-pixel text-xs ${isConfirmed ? 'bg-green-500 text-white hover:bg-green-400' : 'bg-gray-400 text-black'}`}
            >
              {isConfirmed ? 'ACTIVITIES LOCKED' : 'CONFIRM'}
            </button>
          </section>
        </div>

        <div className="phase-separator"></div>

        {/* Phase 3: Instruction */}
        <div className="space-y-3">
          <h1 className="font-pixel text-[10px] mb-2 text-neon-pink text-center">PHASE 3. INSTRUCTION</h1>
          <section className="p-3 pixel-border bg-white">
            <div className="flex justify-center">
              <img 
                src={instructionImage}
                alt="Instruction Guide" 
                className="max-w-full h-auto"
                style={{ maxHeight: '400px' }}
              />
            </div>
          </section>

          <button
            onClick={async () => {
              await showPet()
              
              // Show refresh prompt
              const shouldRefresh = confirm(
                'Your pet is here！\n\n' +
                'Press "OK" to refresh current page and see your pet immediately.\n' +
                'Click "Cancel" to refresh manually later.'
              )
              if (shouldRefresh) {
                // Get active tab and reload it
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                  if (tabs[0]?.id) {
                    chrome.tabs.reload(tabs[0].id)
                  }
                })
              }
              
              navigate('/home')
            }}
            className="pixel-button w-full bg-red-600 font-pixel text-[10px] text-white hover:bg-red-500 py-2.5"
          >
            Meet with your buddy now!
          </button>

          {/* Footer icons */}
          <div className="flex justify-around p-3 mt-2">
            {/* We rely on shared Footer for actual routing; this block is decorative */}
            <Footer />
          </div>
        </div>
      </div>
    </div>
  )
}


