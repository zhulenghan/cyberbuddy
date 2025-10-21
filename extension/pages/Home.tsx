import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Footer } from '@/components/layout/Footer'
import { usePet } from '@/hooks/usePet'
import { useAuth } from '@/hooks/useAuth'
import { ArrowLeftIcon } from 'raster-react'
import { showPet } from '@/lib/utils/petControl'
import { debugPetData } from '@/lib/utils/debugPet'

type PetSlotData = 
  | { id: string; name?: string; isCreate: false }
  | { id: string; name: string; isCreate: true }

export default function Home() {
  const navigate = useNavigate()
  const { currentPet, availablePets, selectPet } = usePet()
  const { user } = useAuth()
  const [currentPetIndex, setCurrentPetIndex] = useState(0)

  // Activities for display (read-only)
  const activities = ['Work', 'Study', 'Reading', 'Music', 'Shopping', 'Social', '...']

  // Calculate total slots (pets + 1 create slot)
  const totalSlots = availablePets.length + 1

  // Get pet data for a given index
  const getPetData = (index: number): PetSlotData => {
    if (index === availablePets.length) {
      return { id: 'create', name: 'Create New Buddy', isCreate: true }
    }
    const pet = availablePets[index]
    console.log('Home: Pet data for index', index, ':', pet)
    console.log('Home: pet.name:', pet.name)
    console.log('Home: pet.prompt:', pet.prompt)
    // Use custom name, or prompt as fallback, or generate a default name
    const petName = pet.name || pet.prompt?.split(' ').slice(0, 3).join(' ') || `Pet ${index + 1}`
    console.log('Home: Using display name:', petName)
    return { id: pet.id, name: petName, isCreate: false }
  }

  // Navigate pets
  const handlePetNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      setCurrentPetIndex((prev) => (prev + 1) % totalSlots)
    } else {
      setCurrentPetIndex((prev) => (prev - 1 + totalSlots) % totalSlots)
    }
  }

  // Get visible pet indices
  const prevIndex = (currentPetIndex - 1 + totalSlots) % totalSlots
  const activeIndex = currentPetIndex
  const nextIndex = (currentPetIndex + 1) % totalSlots

  const activePet = getPetData(activeIndex)

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
        .activity-btn-display { font-size: 10px; padding: 6px 10px; background-color: #d0d0d0; margin: 4px; border-radius: 0; border: 2px solid #a0a0a0; box-shadow: 2px 2px 0 #808080; }
        .circular-avatar { width: 65px; height: 55px; border-radius: 80%; background-color: #ff00ff; border: 3px solid #1a1a1a; box-shadow: 2px 2px 0 #000000; cursor: pointer; display: flex; align-items: center; justify-content: center; font-family: 'Press Start 2P', cursive; font-size: 10px; color: #1a1a1a; user-select: none; }
        .create-slot { border: 4px dashed #777; background-color: #e0e0e0; transition: all 0.1s; cursor: pointer; box-shadow: none; display: flex; align-items: center; justify-content: center; }
        .create-slot:hover { border-color: #ff00ff; background-color: #f5f5f5; }
        .plus-sign { font-size: 3rem; font-weight: bold; color: #777; line-height: 1; }
      `}</style>

      <div className="pixel-border w-full h-full p-4 overflow-y-auto">
        {/* Window Header */}
        <div className="dark-bg pixel-border border-2 px-4 py-2 mb-4 flex justify-between items-center relative">
           <button
            onClick={() => navigate(-1)}
            className="w-5 h-5 neon-cyan pixel-border border-2 cursor-pointer flex items-center justify-center text-sm text-black font-bold pixel-button hover:bg-cyan-300 z-10 flex-shrink-0"
          >
            <ArrowLeftIcon className="w-8 h-8 bg-whitetext-black stroke-[3]" />
          </button>
          <h1 className="font-pixel text-[8px] absolute left-1/2 transform -translate-x-1/2 select-none text-neon-cyan whitespace-nowrap">
            V I B E B U D D Y . E X E
          </h1>

          <div className="flex space-x-1 z-10 flex-shrink-0">
            <div className="w-4 h-4 pixel-border border-2" style={{ backgroundColor: '#00ffff' }}></div>
            <div className="w-4 h-4 bg-red-600 pixel-border border-2"></div>
        </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* User Info & Top Actions */}
          <div className="flex justify-between items-start text-black text-[10px] font-mono p-2">
            
            <div className="flex space-x-2 items-center">
              <div className="circular-avatar" title="Sign In / User Profile">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
              <p className="font-bold">Space ID : <span className="text-neon-pink">123456789</span></p>
              <p className="font-bold">User ID : <br /><span className="text-neon-pink">{user?.name || user?.email || 'Guest'}</span></p>
              </div>
              <button className="pixel-button px-2 py-1 bg-gray-300 hover:bg-gray-200 text-[8px] font-pixel">
                Share this extension
              </button>
            </div>
          </div>

          {/* YOUR ACTIVITIES TODAY */}
          <section className="p-3 pixel-border bg-gray-100 space-y-2">
            <h2 className="font-pixel text-[10px] text-center text-black mb-2">YOUR ACTIVITIES TODAY</h2>
            <div className="flex flex-wrap justify-center">
              {activities.map((activity) => (
                <span key={activity} className="activity-btn-display font-pixel">
                  {activity}
                </span>
              ))}
            </div>
          </section>

          {/* Generate Report Button */}
          <button
            onClick={() => navigate('/focus-report')}
            className="pixel-button w-full bg-gray-400 font-pixel text-[10px] text-black hover:bg-gray-300 py-2"
          >
            Generate Report
          </button>

          {/* Pet Collection View */}
          <section className="text-center space-y-3">
            <h2 className="font-pixel text-[10px] text-neon-cyan">Your Cyber Buddy Collections</h2>

            <div className="flex items-center justify-center space-x-2">
              {/* Left Arrow Button */}
              <button
                onClick={() => handlePetNavigation('prev')}
                className="w-6 h-6 text-neon-cyan hover:text-neon-pink transition duration-150 transform hover:scale-125"
              >
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11 3L5 8l6 5V3zM9 8l2 2V6l-2 2z" />
                </svg>
              </button>

              {/* Three Slot Display Container */}
              <div className="flex justify-center items-end space-x-1">
                {/* Slot 1: Previous Pet (Smaller) */}
                {(() => {
                  const pet = getPetData(prevIndex)
                  return (
                    <div
                      onClick={() => handlePetNavigation('prev')}
                      className={`w-20 h-20 border-4 flex items-center justify-center text-center p-1 text-[8px] opacity-50 cursor-pointer ${
                        pet.isCreate ? 'create-slot' : 'border-black bg-gray-100'
                      }`}
                    >
                      {pet.isCreate ? (
                        <span className="text-2xl font-bold text-gray-500">+</span>
                      ) : (
                        <p className="font-pixel text-neon-pink leading-tight">Pet Icon</p>
                      )}
                    </div>
                  )
                })()}

                {/* Slot 2: Active Pet (Larger) */}
                {(() => {
                  const pet = getPetData(activeIndex)
                  return (
                    <div
                      className={`w-28 h-28 border-4 flex flex-col items-center justify-center text-center p-2 text-[10px] ${
                        pet.isCreate ? 'create-slot' : 'border-black bg-gray-200'
                      }`}
                    >
                      {pet.isCreate ? (
                        <span className="plus-sign text-4xl">+</span>
                      ) : (
                        <>
                          <p className="font-pixel text-neon-pink mb-1">Pet Icon</p>
                          <p className="font-pixel text-black text-[8px] leading-tight">
                            {pet.name || 'Unnamed'}
                          </p>
                        </>
                      )}
                    </div>
                  )
                })()}

                {/* Slot 3: Next Pet (Smaller) */}
                {(() => {
                  const pet = getPetData(nextIndex)
                  return (
                    <div
                      onClick={() => handlePetNavigation('next')}
                      className={`w-20 h-20 border-4 flex items-center justify-center text-center p-1 text-[8px] opacity-50 cursor-pointer ${
                        pet.isCreate ? 'create-slot' : 'border-black bg-gray-100'
                      }`}
                    >
                      {pet.isCreate ? (
                        <span className="text-2xl font-bold text-gray-500">+</span>
                      ) : (
                        <p className="font-pixel text-neon-pink leading-tight">Pet Icon</p>
                      )}
                    </div>
                  )
                })()}
              </div>

              {/* Right Arrow Button */}
              <button
                onClick={() => handlePetNavigation('next')}
                className="w-6 h-6 text-neon-cyan hover:text-neon-pink transition duration-150 transform hover:scale-125"
              >
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path d="M5 3l6 5-6 5V3zM7 8l2 2V6l-2 2z" />
                </svg>
              </button>
            </div>

            <p className="font-pixel text-[10px] text-black pt-1">
              {activePet.isCreate ? 'New Buddy Slot' : activePet.name || 'PET NAME HERE'}
            </p>

            {/* Meet CTA */}
            <button
              onClick={async () => {
                if (activePet.isCreate) {
                  navigate('/create-pet')
                } else {
                  // Debug pet data first
                  console.log('=== DEBUGGING PET DATA ===')
                  await debugPetData()
                  
                  // Select this pet and show it on the page
                  await selectPet(activePet.id)
                  await showPet()
                }
              }}
              className="pixel-button w-full bg-red-600 font-pixel text-[10px] text-white hover:bg-red-500 py-2"
            >
              {activePet.isCreate ? (
                'Return to Creator'
              ) : (
                <>
                  Meet with <span className="italic">{activePet.name || 'PET NAME HERE'}</span> right now!
                </>
              )}
            </button>
          </section>

          {/* Footer / Guidance */}
          <div className="text-center text-[8px] font-mono text-gray-400 mt-1">
            Having question? &gt;Go to <span className="text-neon-cyan underline cursor-pointer">guide</span>
          </div>

          {/* Footer Navigation Icons */}
          <Footer />
        </div>
      </div>
    </div>
  )
}
