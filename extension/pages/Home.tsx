import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/layout/Footer'
import { PetGrid } from '@/components/pet/PetCard'
import { usePet } from '@/hooks/usePet'
import { useActivityTracker } from '@/hooks/useActivityTracker'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const navigate = useNavigate()
  const { currentPet, availablePets, selectPet } = usePet()
  const { todayStats } = useActivityTracker()
  const { user } = useAuth()
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])

  const activities = [
    { id: 'work', label: 'WORK' },
    { id: 'shopping', label: 'SHOPPING' },
    { id: 'recreation', label: 'RECREATION' },
    { id: 'research', label: 'RESEARCH' },
    { id: 'reading', label: 'READING' },
  ]

  const toggleActivity = (id: string) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  return (
    <div className="h-[600px] w-[400px] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full px-6 py-4 gap-3">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between">
          <div>
            <p className="text-[15px] font-bold text-gray-800">User: {user?.name || user?.email || 'Guest'}</p>
            <p className="text-[10px] text-gray-600">{user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs bg-white/80 hover:bg-white shadow-md rounded-lg px-3 py-1.5 font-semibold text-gray-700"
            >
              Share
            </Button>
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name || 'User'}
                className="w-[48px] h-[48px] rounded-full border-2 border-white shadow-lg"
              />
            ) : (
              <div className="w-[48px] h-[48px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center border-2 border-white shadow-lg">
                <span className="text-sm font-bold text-white">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Activities Section */}
        <div className="flex-shrink-0">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50">
            <h2 className="text-xs font-bold text-center mb-3 text-gray-700">
              YOUR ACTIVITIES TODAY
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {activities.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => toggleActivity(activity.id)}
                  className={`h-[32px] rounded-lg flex items-center justify-center text-[10px] font-semibold transition-all ${
                    selectedActivities.includes(activity.id)
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                      : 'bg-white/80 text-gray-700 hover:bg-white'
                  }`}
                >
                  {activity.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Report Button */}
        <div className="flex-shrink-0 text-center">
          <Button
            onClick={() => navigate('/focus-report')}
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white text-sm font-bold h-auto py-2.5 px-8 rounded-xl shadow-lg"
          >
            Generate Report
          </Button>
        </div>

        {/* Pet Collections */}
        <div className="flex-shrink-0">
          <h2 className="text-sm font-bold text-center mb-3 text-gray-800">
            Your Cyber Buddy Collections
          </h2>
          <PetGrid
            pets={availablePets.map(pet => ({
              id: pet.id,
              name: pet.name || 'Unnamed Pet',
              imageUrl: pet.imageUrl,
            }))}
            onPetClick={(petId) => {
              selectPet(petId)
            }}
            onAddClick={() => navigate('/create-pet')}
            maxPets={3}
          />
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-0"></div>

        {/* Meet with Pet Button */}
        <div className="flex-shrink-0 text-center">
          <Button className="bg-white/80 hover:bg-white text-gray-800 h-auto py-2 px-8 rounded-xl shadow-md border border-white/50">
            <span className="font-bold text-sm">Meet with </span>
            <span className="font-normal italic text-sm">
              {currentPet?.name || 'PET NAME HERE'}
            </span>
            <span className="font-bold text-sm"> right now!</span>
          </Button>
        </div>

        {/* Footer Navigation */}
        <div className="flex-shrink-0">
          <Footer />
        </div>

        {/* Help Link */}
        <div className="flex-shrink-0 text-center py-2">
          <p className="text-[8px] italic font-bold text-gray-600">
            Having question? &gt;Go to <span className="underline">guide</span>
          </p>
        </div>
      </div>
    </div>
  )
}
