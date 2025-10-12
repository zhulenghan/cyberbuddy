import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/Header'
import { usePet } from '@/hooks/usePet'

export default function CreatePet() {
  const navigate = useNavigate()
  const { generatePet, generateBehaviorContent, isGenerating } = usePet()
  const [petName, setPetName] = useState('')
  const [coreEntity, setCoreEntity] = useState('')
  const [uniqueTraits, setUniqueTraits] = useState('')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generationHistory, setGenerationHistory] = useState<string[]>([])
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0)

  const handleGenerate = async () => {
    if (!coreEntity || !uniqueTraits) {
      alert('Please fill in both core entity and unique traits')
      return
    }

    try {
      const prompt = `${coreEntity} with ${uniqueTraits}`
      const result = await generatePet(prompt)

      // Backend returns images object with different states (social, focused, etc.)
      const imageUrl = result?.images?.social
      if (imageUrl) {
        setGeneratedImage(imageUrl)
        setGenerationHistory((prev) => [...prev, imageUrl])
        setCurrentHistoryIndex(generationHistory.length)
      }
    } catch (error) {
      console.error('Failed to generate pet:', error)
      alert('Failed to generate pet. Please try again.')
    }
  }

  const handleConfirm = async () => {
    if (!petName || !generatedImage) {
      alert('Please generate a pet and give it a name')
      return
    }

    try {
      // Get the generated pet from the store
      const prompt = `${coreEntity} with ${uniqueTraits}`
      const result = await generatePet(prompt)
      
      if (result) {
        // Generate behavior content for the pet
        try {
          await generateBehaviorContent(result.id)
          console.log('Behavior content generated successfully')
        } catch (error) {
          console.warn('Failed to generate behavior content:', error)
          // Continue without behavior content
        }
      }

      // Save pet to storage - the hook will handle this
      await chrome.storage.local.set({
        currentPet: {
          name: petName,
          prompt: prompt,
          imageUrl: generatedImage,
          createdAt: Date.now(),
        },
      })

      navigate('/focus-setup')
    } catch (error) {
      console.error('Failed to save pet:', error)
      alert('Failed to save pet. Please try again.')
    }
  }

  const handleRandomEntity = () => {
    const entities = [
      'a floating ghost',
      'a tiny dragon',
      'a mechanical bird',
      'a glowing crystal',
      'a fluffy cloud',
      'a wise owl',
      'a playful fox',
      'a digital spirit',
    ]
    setCoreEntity(entities[Math.floor(Math.random() * entities.length)])
  }

  const handleRandomTraits = () => {
    const traits = [
      'big eyes and wears red dress',
      'glowing wings and sparkles',
      'pixel art style with bright colors',
      'soft pastel colors and cute expression',
      'neon lights and cyberpunk aesthetic',
      'translucent body with stars inside',
      'tiny hat and round shape',
    ]
    setUniqueTraits(traits[Math.floor(Math.random() * traits.length)])
  }

  const handleRandomName = () => {
    const names = [
      'GbabyGhost',
      'PixelPal',
      'CyberBuddy',
      'SparkleWing',
      'NeonFriend',
      'CloudyDream',
      'TinyHelper',
      'GlowByte',
    ]
    setPetName(names[Math.floor(Math.random() * names.length)])
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

  return (
    <div className="h-[600px] w-[400px] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full px-5 py-4 gap-2.5 overflow-y-auto">
        {/* Header */}
        <div className="flex-shrink-0">
          <Header />
        </div>

        {/* Title */}
        <div className="flex-shrink-0 text-center">
          <h1 className="text-[22px] font-bold text-gray-800">PHASE 1. CREATE YOUR BUDDY</h1>
        </div>

        {/* Generate Button */}
        <div className="flex-shrink-0">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !coreEntity || !uniqueTraits}
            className="w-full h-[36px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white text-sm font-bold disabled:opacity-50 rounded-xl shadow-lg"
          >
            {isGenerating
              ? 'Generating...'
              : 'Click here to generate your cyber buddy!'}
          </Button>
        </div>

        {/* Preview and History */}
        <div className="flex-shrink-0">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 flex gap-3 shadow-lg border border-white/50">
            {/* Pet Preview */}
            <div className="flex-1 bg-white/80 aspect-square rounded-xl flex items-center justify-center shadow-md">
              {generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated pet"
                  className="w-full h-full object-cover rounded-xl pixel-art"
                />
              ) : (
                <p className="text-lg font-bold text-center text-gray-600">Pet Preview</p>
              )}
            </div>

            {/* History */}
            <div className="flex-1 flex flex-col">
              <div className="bg-white/80 rounded-xl p-2 flex-1 relative shadow-md">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-[13px] rounded-t flex items-center justify-center">
                  <span className="text-[9px] font-semibold text-white">
                    {currentHistoryIndex + 1} / {generationHistory.length || 1}
                  </span>
                </div>
                <div className="flex items-center justify-center h-full">
                  <p className="text-[12px] font-bold text-center text-gray-700">
                    GENERATION HISTORY
                  </p>
                </div>
                {generationHistory.length > 1 && (
                  <>
                    <button
                      className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-600"
                      onClick={() => navigateHistory('prev')}
                      disabled={currentHistoryIndex === 0}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      className="absolute right-0 top-1/2 -translate-y-1/2 rotate-180 text-gray-600"
                      onClick={() => navigateHistory('next')}
                      disabled={currentHistoryIndex === generationHistory.length - 1}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              <Button
                onClick={handleConfirm}
                disabled={!generatedImage || !petName}
                className="mt-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-xs font-bold disabled:opacity-50 rounded-lg shadow-md"
              >
                CONFIRM
              </Button>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex-shrink-0">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3.5 space-y-3 shadow-lg border border-white/50">
            {/* Core Entity */}
            <div>
              <label className="text-[10px] font-bold mb-1.5 block text-gray-700">
                Core Entity:
              </label>
              <div className="flex gap-2">
                <Input
                  value={coreEntity}
                  onChange={(e) => setCoreEntity(e.target.value)}
                  placeholder="e.g a floating ghost"
                  className="flex-1 h-[30px] bg-white/80 border border-white/50 text-[10px] rounded-lg shadow-sm"
                />
                <Button
                  onClick={handleRandomEntity}
                  className="bg-white/80 hover:bg-white h-[30px] px-3 text-[8px] font-bold rounded-lg shadow-sm text-gray-700 border border-white/50"
                >
                  Random
                </Button>
              </div>
            </div>

            {/* Unique Traits */}
            <div>
              <label className="text-[10px] font-bold mb-1.5 block text-gray-700">
                Unique traits:
              </label>
              <div className="flex gap-2">
                <Input
                  value={uniqueTraits}
                  onChange={(e) => setUniqueTraits(e.target.value)}
                  placeholder="e.g big eyes and wears red dress"
                  className="flex-1 h-[30px] bg-white/80 border border-white/50 text-[10px] rounded-lg shadow-sm"
                />
                <Button
                  onClick={handleRandomTraits}
                  className="bg-white/80 hover:bg-white h-[30px] px-3 text-[8px] font-bold rounded-lg shadow-sm text-gray-700 border border-white/50"
                >
                  Random
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Pet Name Section */}
        <div className="flex-shrink-0">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3.5 shadow-lg border border-white/50">
            <label className="text-[10px] font-bold mb-1.5 block text-gray-700">
              What would you like your pet to be called?
            </label>
            <div className="flex gap-2">
              <Input
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="e.g GbabyGhost"
                className="flex-1 h-[30px] bg-white/80 border border-white/50 text-[10px] rounded-lg shadow-sm"
              />
              <Button
                onClick={handleRandomName}
                className="bg-white/80 hover:bg-white h-[30px] px-3 text-[8px] font-bold rounded-lg shadow-sm text-gray-700 border border-white/50"
              >
                Random
              </Button>
            </div>
          </div>
        </div>

        {/* Next Button */}
        <div className="flex-shrink-0 pb-2">
          <Button
            onClick={() => navigate('/focus-setup')}
            className="w-full max-w-[220px] mx-auto block h-[32px] bg-white/80 hover:bg-white text-gray-800 text-xs font-bold shadow-md rounded-xl border border-white/50"
          >
            Ready? Proceed to phase 2！
          </Button>
        </div>
      </div>
    </div>
  )
}
