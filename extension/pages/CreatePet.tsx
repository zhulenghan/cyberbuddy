import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePet } from '@/hooks/usePet'

export default function CreatePet() {
  const navigate = useNavigate()
  const { generatePet, generateBehaviorContent, isGenerating } = usePet()
  const [petName, setPetName] = useState('')
  const [coreEntity, setCoreEntity] = useState('')
  const [uniqueTraits, setUniqueTraits] = useState('')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isImageConfirmed, setIsImageConfirmed] = useState(false)
  const [generationHistory, setGenerationHistory] = useState<string[]>([])
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0)

  const handleGenerate = async () => {
    if (!coreEntity || !uniqueTraits) {
      alert('Please define your CORE ENTITY and TRAITS first!')
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
        setIsImageConfirmed(false) // Reset confirmation when new image is generated
      }
    } catch (error) {
      console.error('Failed to generate pet:', error)
      alert('Failed to generate pet. Please try again.')
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
    <div className="h-[800px] w-[600px] bg-gray-800 flex items-center justify-center p-3 overflow-hidden">
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
      `}</style>

      <div className="pixel-border w-full p-3 overflow-y-auto max-h-full">
        {/* Window Header */}
        <div className="dark-bg pixel-border border-2 px-4 py-2 mb-4 flex justify-between items-center relative">
          <button
            onClick={() => navigate('/home')}
            className="w-5 h-5 bg-neon-cyan pixel-border border-2 cursor-pointer flex items-center justify-center text-sm text-black font-bold pixel-button hover:bg-cyan-300 z-10 flex-shrink-0"
          >
            <span className="transform scale-x-150">←</span>
          </button>

          <h1 className="font-pixel text-sm absolute left-1/2 transform -translate-x-1/2 neon-cyan whitespace-nowrap">
            V I B E B U D D Y . E X E
          </h1>

          <div className="flex space-x-2 z-10 flex-shrink-0">
            <div className="w-4 h-4 bg-neon-cyan pixel-border border-2"></div>
            <div className="w-4 h-4 bg-red-600 pixel-border border-2"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-3">
          <h1 className="font-pixel text-lg mb-4 neon-pink text-center">
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
          <div className="grid grid-cols-2 gap-3 h-64">
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
                isImageConfirmed ? (
                  <img src={generatedImage} alt="Pet" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-xs">IMAGE<br />GENERATED!</p>
                )
              ) : (
                <p>Pet Preview</p>
              )}
            </div>

            {/* RIGHT: Generation History / Status */}
            <div className="border-2 border-black bg-white p-2 flex flex-col justify-between">
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

              <div className="flex-grow flex items-center justify-center">
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
          <section className="p-3 pixel-border bg-white">
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
