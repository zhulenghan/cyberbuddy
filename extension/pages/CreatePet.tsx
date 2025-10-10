import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/Header'
import { usePet } from '@/hooks/usePet'

export default function CreatePet() {
  const navigate = useNavigate()
  const { generatePet, isGenerating } = usePet()
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

      if (result?.imageUrl) {
        setGeneratedImage(result.imageUrl)
        setGenerationHistory((prev) => [...prev, result.imageUrl])
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
      // Save pet to storage - the hook will handle this
      await chrome.storage.local.set({
        currentPet: {
          name: petName,
          prompt: `${coreEntity} with ${uniqueTraits}`,
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
    <div className="min-h-[600px] w-[420px] bg-white flex flex-col overflow-y-auto">
      {/* Header */}
      <Header />

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-[25px] font-bold">PHASE 1. CREATE YOUR BUDDY</h1>
      </div>

      {/* Generate Button */}
      <div className="px-4 mb-6">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !coreEntity || !uniqueTraits}
          className="w-full h-[39px] bg-vibe-gray-700 hover:bg-vibe-gray-800 text-black text-[15px] font-bold disabled:opacity-50"
        >
          {isGenerating
            ? 'Generating...'
            : 'Click here to generate your cyber buddy!'}
        </Button>
      </div>

      {/* Preview and History */}
      <div className="px-4 mb-6">
        <div className="bg-vibe-gray-300 rounded p-4 flex gap-4">
          {/* Pet Preview */}
          <div className="flex-1 bg-vibe-gray-700 aspect-square rounded flex items-center justify-center">
            {generatedImage ? (
              <img
                src={generatedImage}
                alt="Generated pet"
                className="w-full h-full object-cover rounded pixel-art"
              />
            ) : (
              <p className="text-xl font-bold text-center">Pet Preview</p>
            )}
          </div>

          {/* History */}
          <div className="flex-1 flex flex-col">
            <div className="bg-vibe-gray-700 rounded p-2 flex-1 relative">
              <div className="bg-vibe-gray-900 h-[13px] rounded-t flex items-center justify-center">
                <span className="text-[10px] font-normal text-white">
                  {currentHistoryIndex + 1} / {generationHistory.length || 1}
                </span>
              </div>
              <div className="flex items-center justify-center h-full">
                <p className="text-[13px] font-bold text-center">
                  GENERATION HISTORY
                </p>
              </div>
              {generationHistory.length > 1 && (
                <>
                  <button
                    className="absolute left-0 top-1/2 -translate-y-1/2"
                    onClick={() => navigateHistory('prev')}
                    disabled={currentHistoryIndex === 0}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    className="absolute right-0 top-1/2 -translate-y-1/2 rotate-180"
                    onClick={() => navigateHistory('next')}
                    disabled={currentHistoryIndex === generationHistory.length - 1}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
            <Button
              onClick={handleConfirm}
              disabled={!generatedImage || !petName}
              className="mt-2 bg-vibe-gray-700 hover:bg-vibe-gray-800 text-xs font-bold disabled:opacity-50"
            >
              CONFIRM
            </Button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="px-4 mb-6">
        <div className="bg-vibe-gray-300 rounded p-4 space-y-4">
          {/* Core Entity */}
          <div>
            <label className="text-[10px] font-bold mb-2 block">
              Core Entity:
            </label>
            <div className="flex gap-2">
              <Input
                value={coreEntity}
                onChange={(e) => setCoreEntity(e.target.value)}
                placeholder="e.g a floating ghost"
                className="flex-1 h-[30px] bg-vibe-gray-700 border-none text-[10px]"
              />
              <Button
                onClick={handleRandomEntity}
                className="bg-vibe-gray-700 hover:bg-vibe-gray-800 h-[30px] px-3 text-[8px] font-bold"
              >
                Random
              </Button>
            </div>
          </div>

          {/* Unique Traits */}
          <div>
            <label className="text-[10px] font-bold mb-2 block">
              Unique traits:
            </label>
            <div className="flex gap-2">
              <Input
                value={uniqueTraits}
                onChange={(e) => setUniqueTraits(e.target.value)}
                placeholder="e.g big eyes and wears red dress"
                className="flex-1 h-[30px] bg-vibe-gray-700 border-none text-[10px]"
              />
              <Button
                onClick={handleRandomTraits}
                className="bg-vibe-gray-700 hover:bg-vibe-gray-800 h-[30px] px-3 text-[8px] font-bold"
              >
                Random
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Pet Name Section */}
      <div className="px-4 mb-6">
        <div className="bg-vibe-gray-300 rounded p-4">
          <label className="text-[10px] font-bold mb-2 block">
            What would you like your pet to be called?
          </label>
          <div className="flex gap-2">
            <Input
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="e.g GbabyGhost"
              className="flex-1 h-[30px] bg-vibe-gray-700 border-none text-[10px]"
            />
            <Button
              onClick={handleRandomName}
              className="bg-vibe-gray-700 hover:bg-vibe-gray-800 h-[30px] px-3 text-[8px] font-bold"
            >
              Random
            </Button>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="px-4 pb-8">
        <Button
          onClick={() => navigate('/focus-setup')}
          className="w-full max-w-[233px] mx-auto block h-[32px] bg-vibe-gray-700 hover:bg-vibe-gray-800 text-xs font-bold shadow-md"
        >
          Ready? Proceed to phase 2！
        </Button>
      </div>
    </div>
  )
}
