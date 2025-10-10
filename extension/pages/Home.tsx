import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/layout/Footer'
import { PetGrid } from '@/components/pet/PetCard'
import { usePet } from '@/hooks/usePet'
import { useActivityTracker } from '@/hooks/useActivityTracker'

export default function Home() {
  const navigate = useNavigate()
  const { currentPet, availablePets, selectPet } = usePet()
  const { todayStats } = useActivityTracker()
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

  // Mock user data - will be replaced with real data
  const userData = {
    spaceId: '123456789',
    userId: 'KitaGuan',
  }

  return (
    <div className="min-h-[600px] w-[420px] bg-white flex flex-col overflow-y-auto pb-20">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[15px] font-bold">Space ID: {userData.spaceId}</p>
          <p className="text-[15px] font-bold">User ID: {userData.userId}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs bg-vibe-gray-700 hover:bg-vibe-gray-800"
          >
            Share this extension
          </Button>
          <div className="w-[54px] h-[54px] rounded-full bg-vibe-gray-600 flex items-center justify-center">
            <span className="text-[10px] font-bold">sign in</span>
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <div className="px-6 py-8">
        <div className="bg-vibe-gray-500 rounded p-6 mb-6">
          <h2 className="text-xs font-bold text-center mb-4">
            YOUR ACTIVITIES TODAY
          </h2>
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            {activities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => toggleActivity(activity.id)}
                className={`h-[30px] rounded flex items-center justify-center text-xs font-normal transition-colors ${
                  selectedActivities.includes(activity.id)
                    ? 'bg-vibe-gray-900 text-white'
                    : 'bg-vibe-gray-700'
                }`}
              >
                {activity.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Report Button */}
        <div className="text-center mb-8">
          <Button
            onClick={() => navigate('/focus-report')}
            className="bg-vibe-gray-400 hover:bg-vibe-gray-500 text-black text-[15px] font-bold h-auto py-3 px-8"
          >
            Generate Report
          </Button>
        </div>

        {/* Pet Collections */}
        <div>
          <h2 className="text-[15px] font-bold text-center mb-6">
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

        {/* Meet with Pet Button */}
        <div className="mt-8 text-center">
          <Button className="bg-vibe-gray-700 hover:bg-vibe-gray-800 text-black h-[31px] px-12">
            <span className="font-bold">Meet with </span>
            <span className="font-normal italic">
              {currentPet?.name || 'PET NAME HERE'}
            </span>
            <span className="font-bold"> right now!</span>
          </Button>
        </div>
      </div>

      {/* Footer Navigation */}
      <Footer />

      {/* Help Link */}
      <div className="text-center py-4">
        <p className="text-[8px] italic font-bold">
          Having question? &gt;Go to <span className="underline">guide</span>
        </p>
      </div>
    </div>
  )
}
