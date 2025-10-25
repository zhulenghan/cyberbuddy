import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePet } from '@/hooks/usePet'
import { usePetStore } from '@/lib/store/petStore'
import { CONFIG } from '@/lib/config'
import { useAuthStore } from '@/lib/store/authStore'
import { ArrowLeftIcon } from 'raster-react'
import { apiClient } from '@/lib/api' // Import API client
import { indexedDBStorage } from '@/lib/storage' // Import indexedDBStorage
import type { Pet } from '@/lib/types' // Import Pet type

export default function CreatePet() {
  const navigate = useNavigate()
  const { currentPet, generatePet, generateBehaviorContent, isGenerating, error: petError } = usePet()
  const { tokens } = useAuthStore()
  const [petName, setPetName] = useState('')
  const [coreEntity, setCoreEntity] = useState('')
  const [uniqueTraits, setUniqueTraits] = useState('')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isImageConfirmed, setIsImageConfirmed] = useState(false)
  const [generationHistory, setGenerationHistory] = useState<string[]>([])
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0)
  const [tempPetData, setTempPetData] = useState<any>(null) // Store temporary pet data before confirmation

  const resolveAbsoluteUrl = (url: string): string => {
    if (/^https?:\/\//i.test(url)) return url
    const base = CONFIG.API_BASE_URL.replace(/\/$/, '')
    const path = url.replace(/^\//, '')
    return `${base}/${path}`
  }

  const fetchImageAsBlobUrl = async (url: string): Promise<string> => {
    try {
      const absoluteUrl = resolveAbsoluteUrl(url)
      
      // S3 presigned URLs don't need/accept Authorization headers
      // Only add auth for non-S3 URLs
      const isS3Url = /\.s3[.-].*\.amazonaws\.com/i.test(absoluteUrl)
      const headers: HeadersInit = {}
      
      if (!isS3Url && tokens?.accessToken) {
        headers['Authorization'] = `Bearer ${tokens.accessToken}`
      }
      
      const res = await fetch(absoluteUrl, { headers })
      if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`)
      const blob = await res.blob()
      return URL.createObjectURL(blob)
    } catch (e) {
      console.error('Failed to convert image to blob URL, fallback to original URL:', e)
      return url
    }
  }

  const handleGenerate = async () => {
    if (!coreEntity || !uniqueTraits) {
      alert('Please define your CORE ENTITY and TRAITS first!')
      return
    }

    try {
      const prompt = `${coreEntity} with ${uniqueTraits}`
      
      // Mock pet generation for development (replace with real API when available)
      console.log('=== CREATEPET: Generating pet images (mock implementation) ===')
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create mock pet data
      const mockPetData: Pet = {
        id: `pet_${Date.now()}`,
        name: petName || 'Generated Pet',
        prompt,
        images: {
          idle: 'https://via.placeholder.com/128x128/4F46E5/FFFFFF?text=🤖',
          happy: 'https://via.placeholder.com/128x128/10B981/FFFFFF?text=😊',
          focused: 'https://via.placeholder.com/128x128/F59E0B/FFFFFF?text=🎯',
          tired: 'https://via.placeholder.com/128x128/6B7280/FFFFFF?text=😴',
          excited: 'https://via.placeholder.com/128x128/EF4444/FFFFFF?text=🎉'
        },
        style: 'pixel',
        isActive: true,
        createdAt: new Date().toISOString(),
      }
      
      const result = mockPetData
      console.log('Pet generation result (mock):', result)

      // Store temporary pet data (will save only on confirmation)
      setTempPetData(result)

      // Backend returns images object with different states (idle, happy, focused, etc.)
      // Use the first available image
      const petData = result as Pet
      const imageUrl = petData?.images?.idle || 
                       petData?.images?.happy || 
                       petData?.images?.focused ||
                       petData?.images?.tired ||
                       petData?.images?.excited ||
                       (petData?.images ? Object.values(petData.images)[0] : undefined)
      
      console.log('Selected image URL:', imageUrl)
      
      if (imageUrl) {
        const blobUrl = await fetchImageAsBlobUrl(imageUrl)
        console.log('Blob URL created:', blobUrl)
        setGeneratedImage(blobUrl)
        setGenerationHistory((prev) => [...prev, imageUrl])
        setCurrentHistoryIndex(generationHistory.length)
        setIsImageConfirmed(false) // Reset confirmation when new image is generated
      } else {
        console.error('No image URL found in result:', result)
        alert('Image generated but no URL found. Check console for details.')
      }
    } catch (error) {
      console.error('Failed to generate pet:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to generate pet: ${message}`)
    }
  }

  const handleConfirmImage = () => {
    if (!generatedImage) return
    setIsImageConfirmed(true)
  }

  const handleProceed = async () => {
    if (!isImageConfirmed || !petName) {
      alert('You must CONFIRM the static image and name your pet before proceeding!')
      return
    }

    if (!tempPetData) {
      alert('No pet data found. Please generate an image first.')
      return
    }

    try {
      console.log('=== CREATEPET: Saving confirmed pet ===')
      console.log('Pet name:', petName)
      console.log('Temp pet data:', tempPetData)
      
      // Create the final pet object with the user's chosen name
      const newPet: Pet = {
        ...tempPetData,
        name: petName,
        isActive: true, // Mark as active since we're creating it
      }
      
      console.log('Final pet object to save:', newPet)
      
      // Save to IndexedDB
      await indexedDBStorage.savePet(newPet)
      console.log('Saved to IndexedDB')
      
      // Save to Chrome storage as current pet
      await chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.CURRENT_PET]: newPet })
      console.log('Saved to chrome.storage.local')
      
      // Update the pet store
      const { availablePets } = usePetStore.getState()
      
      // Deactivate all other pets
      const updatedPets = availablePets.map(p => ({ ...p, isActive: false }))
      
      // Add new pet to the list
      const allPets = [...updatedPets, newPet]
      
      usePetStore.setState({ 
        currentPet: newPet,
        availablePets: allPets 
      })
      console.log('Updated pet store, total pets:', allPets.length)
      
      // Generate behavior content for the pet
      try {
        await generateBehaviorContent(newPet.id)
        console.log('Behavior content generated successfully')
      } catch (error) {
        console.warn('Failed to generate behavior content:', error)
        // Continue without behavior content
      }

      // Navigate to instruction page
      navigate('/instruction')
    } catch (error) {
      console.error('Failed to proceed:', error)
      alert('Failed to proceed. Please try again.')
    }
  }

  const handleInputChange = () => {
    // Reset confirmation when inputs change
    if (isImageConfirmed) {
      setIsImageConfirmed(false)
    }
  }

  const handleRandomEntity = () => {
    const entities = [
      'A sentient glitch sprite with butterfly wings',
      'A biomechanical teddy bear with a glowing core',
      'A vaporwave-inspired marble fox with holographic eyes',
      'A cute, floating cloud made of sparkling data packets',
      'A giant but friendly pixelated serpent',
    ]
    setCoreEntity(entities[Math.floor(Math.random() * entities.length)])
    handleInputChange()
  }

  const handleRandomTraits = () => {
    const traits = [
      'covered in fuzzy rainbow fur and wearing a crown',
      'has three rotating eyes and emits static noise',
      'made of liquid mercury and constantly dissolving',
      'wearing futuristic combat armor and holding a tiny sword',
      'made of pure neon light, translucent and geometric',
    ]
    setUniqueTraits(traits[Math.floor(Math.random() * traits.length)])
    handleInputChange()
  }

  const handleRandomName = () => {
    const names = ['Pixie', 'Glitch', 'Byte', 'Roku', 'Neon', 'Zippy', 'Cypher', 'Ghosty', 'Vibe', 'Buddy']
    setPetName(names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100))
  }

  const navigateHistory = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1
      setCurrentHistoryIndex(newIndex)
      setGeneratedImage(generationHistory[newIndex])
    } else if (
      direction === 'next' &&
      currentHistoryIndex < generationHistory.length - 1
    ) {
      const newIndex = currentHistoryIndex + 1
      setCurrentHistoryIndex(newIndex)
      setGeneratedImage(generationHistory[newIndex])
    }
  }

  // Get image preview state for styling
  const getPreviewState = () => {
    if (isGenerating) return 'loading'
    if (isImageConfirmed && generatedImage) return 'confirmed'
    if (generatedImage) return 'generated'
    return 'empty'
  }

  const previewState = getPreviewState()

  return (
    <div className="h-[600px] w-[450px] bg-gray-800 flex items-center justify-center p-3 overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .font-pixel {
          font-family: 'Press Start 2P', cursive;
        }
        
        .pixel-border {
          border: 4px solid #1a1a1a;
          box-shadow: 8px 8px 0 #000000;
          background-color: #f0f0f0;
        }
        
        .pixel-button {
          border: 3px solid #1a1a1a;
          box-shadow: 4px 4px 0 #000000;
          transition: all 0.1s;
        }
        
        .pixel-button:active:not(:disabled) {
          box-shadow: 1px 1px 0 #000000;
          transform: translate(3px, 3px);
        }
        
        .pixel-button:disabled {
          cursor: not-allowed;
          filter: grayscale(100%);
          opacity: 0.7;
        }
        
        .pixel-input {
          border: 2px solid #1a1a1a;
          box-shadow: 2px 2px 0 #000000;
          font-family: monospace;
          padding: 6px 8px;
          background-color: #ffffff;
          font-size: 12px;
        }
        
        .neon-pink { color: #ff00ff; }
        .neon-cyan { color: #00ffff; }
        .bg-neon-cyan { background-color: #00ffff; }
        .dark-bg { background-color: #1a1a1a; }
        .text-neon-pink { color: #ff00ff; }
        .text-neon-cyan { color: #00ffff; }
      `}</style>

      <div className="pixel-border w-full h-full p-4 overflow-y-auto">
        {/* Window Header */}
        <div className="dark-bg pixel-border border-2 px-4 py-2 mb-4 flex justify-between items-center relative">
           <button
            onClick={() => navigate(-1)}
            className="w-5 h-5 neon-cyan pixel-border border-2 cursor-pointer flex items-center justify-center text-sm text-black font-bold pixel-button hover:bg-cyan-300 z-10 flex-shrink-0"
          >
            <ArrowLeftIcon className="w-4 h-4 bg-neon-cyan text-black stroke-[3]" />
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
        <div className="space-y-3">
          <h1 className="font-pixel text-[11px] mb-4 neon-pink text-center">
            PHASE 1. CREATE YOUR BUDDY
          </h1>

        {/* Form Section */}
          <section className="p-3 pixel-border bg-white space-y-3">
            {/* Core Entity */}
            <div>
              <label className="font-pixel text-[10px] mb-1 block">Core Entity:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coreEntity}
                  onChange={(e) => {
                    setCoreEntity(e.target.value)
                    handleInputChange()
                  }}
                  placeholder="e.g. a floating ghost"
                  className="pixel-input w-full text-sm"
                />
                <button
                  onClick={handleRandomEntity}
                  className="pixel-button bg-gray-300 text-black hover:bg-gray-200 w-20 text-[10px] font-mono"
                >
                  Random
                </button>
              </div>
            </div>

            {/* Unique Traits */}
            <div>
              <label className="font-pixel text-[10px] mb-1 block">Unique traits:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={uniqueTraits}
                  onChange={(e) => {
                    setUniqueTraits(e.target.value)
                    handleInputChange()
                  }}
                  placeholder="e.g big eyes and wears red dress"
                  className="pixel-input w-full text-sm"
                />
                <button
                  onClick={handleRandomTraits}
                  className="pixel-button bg-gray-300 text-black hover:bg-gray-200 w-20 text-[10px] font-mono"
                >
                  Random
                </button>
              </div>
            </div>
          </section>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !coreEntity || !uniqueTraits}
            className="pixel-button w-full bg-blue-500 font-pixel text-xs text-white hover:bg-blue-400 py-2"
          >
            {isGenerating ? 'GENERATING...' : 'Click here to generate your cyper buddy!'}
          </button>

          {/* Preview Grid */}
          <div className="grid grid-cols-2 gap-1 h-64">
            {/* LEFT: Pet Image Preview */}
            <div
              className={`aspect-square border-4 border-black flex items-center justify-center text-[10px] font-pixel leading-relaxed text-center ${
                previewState === 'loading'
                  ? 'dark-bg text-yellow-400'
                  : previewState === 'confirmed'
                  ? 'bg-green-500 text-black'
                  : previewState === 'generated'
                  ? 'bg-blue-300 text-black'
                  : 'bg-gray-700 neon-pink'
              }`}
            >
              {isGenerating ? (
                <p>LOADING...<br />PLEASE WAIT</p>
              ) : generatedImage ? (
                <img src={generatedImage} alt="Pet" className="w-full h-full object-cover" />
              ) : (
                <p>Pet Preview</p>
              )}
            </div>

            {/* RIGHT: Generation History / Status */}
            <div className="aspect-square border-2 border-black bg-white p-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-black font-pixel text-[10px] border-b border-black pb-2">
                <button
                  className="text-lg px-1 hover:bg-gray-200"
                  onClick={() => navigateHistory('prev')}
                  disabled={currentHistoryIndex === 0 || generationHistory.length <= 1}
                >
                  ‹
                </button>
                <p className="neon-cyan text-[9px]">
                  {generatedImage ? `RESULT ${currentHistoryIndex + 1} / ${generationHistory.length}` : 'GENERATION HISTORY'}
                </p>
                <button
                  className="text-lg px-1 hover:bg-gray-200"
                  onClick={() => navigateHistory('next')}
                  disabled={currentHistoryIndex >= generationHistory.length - 1}
                >
                  ›
                </button>
              </div>

              <div className="flex-grow flex items-center justify-center px-2">
                <p className="text-[10px] font-mono text-gray-700 text-center">
                  {generatedImage && !isImageConfirmed
                    ? 'Preview generated. Click CONFIRM to lock.'
                    : isImageConfirmed
                    ? 'CONFIRMED!'
                    : 'Generated image will appear here.'}
                </p>
              </div>

              <button
                onClick={handleConfirmImage}
                disabled={!generatedImage || isImageConfirmed}
                className={`pixel-button w-full font-pixel text-[10px] mt-2 py-2 ${
                  isImageConfirmed
                    ? 'bg-gray-500 text-white'
                    : generatedImage
                    ? 'bg-green-500 hover:bg-green-400 text-white'
                    : 'bg-gray-300 text-black'
                }`}
              >
                {isImageConfirmed ? 'CONFIRMED!' : 'CONFIRM'}
              </button>
          </div>
        </div>

          {/* Pet Naming Input */}
          <section className="p-3 pixel-border bg-white" style={{ marginTop: '-70px' }}>
            <label className="font-pixel text-[10px] mb-1 block">What would you like your pet to be called?</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="e.g. GbabyGhost"
                className="pixel-input w-full text-sm"
              />
              <button
                onClick={handleRandomName}
                className="pixel-button bg-gray-300 text-black hover:bg-gray-200 w-20 text-[10px] font-mono"
              >
                Random
              </button>
            </div>
          </section>

          {/* Proceed Button */}
          <button
            onClick={handleProceed}
            disabled={!isImageConfirmed || !petName}
            className={`pixel-button w-full font-pixel text-xs py-2.5 ${
              isImageConfirmed && petName
                ? 'bg-green-500 hover:bg-green-400 text-white'
                : 'bg-gray-400 text-black'
            }`}
          >
            Ready? Proceed to phase 2 !
          </button>
        </div>
      </div>
    </div>
  )
}
