import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreatePet() {
  const navigate = useNavigate();
  const [petName, setPetName] = useState("");
  const [coreEntity, setCoreEntity] = useState("");
  const [uniqueTraits, setUniqueTraits] = useState("");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-[25px] font-bold">PHASE 1. CREATE YOUR BUDDY</h1>
      </div>

      {/* Generate Button */}
      <div className="px-4 mb-6">
        <Button className="w-full h-[39px] bg-vibe-gray-700 hover:bg-vibe-gray-800 text-black text-[15px] font-bold">
          Click here to generate your cyber buddy!
        </Button>
      </div>

      {/* Preview and History */}
      <div className="px-4 mb-6">
        <div className="bg-vibe-gray-300 rounded p-4 flex gap-4">
          {/* Pet Preview */}
          <div className="flex-1 bg-vibe-gray-700 aspect-square rounded flex items-center justify-center">
            <p className="text-xl font-bold text-center">Pet Preview</p>
          </div>

          {/* History */}
          <div className="flex-1 flex flex-col">
            <div className="bg-vibe-gray-700 rounded p-2 flex-1 relative">
              <div className="bg-vibe-gray-900 h-[13px] rounded-t flex items-center justify-center">
                <span className="text-[10px] font-normal">1</span>
              </div>
              <div className="flex items-center justify-center h-full">
                <p className="text-[13px] font-bold text-center">GENERATION HISTORY</p>
              </div>
              <button className="absolute left-0 top-1/2 -translate-y-1/2">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button className="absolute right-0 top-1/2 -translate-y-1/2 rotate-180">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            <Button className="mt-2 bg-vibe-gray-700 hover:bg-vibe-gray-800 text-xs font-bold">
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
            <label className="text-[10px] font-bold mb-2 block">Core Entity:</label>
            <div className="flex gap-2">
              <Input
                value={coreEntity}
                onChange={(e) => setCoreEntity(e.target.value)}
                placeholder="e.g a floating ghost"
                className="flex-1 h-[30px] bg-vibe-gray-700 border-none text-[10px]"
              />
              <Button className="bg-vibe-gray-700 hover:bg-vibe-gray-800 h-[30px] px-3 text-[8px] font-bold">
                Random
              </Button>
            </div>
          </div>

          {/* Unique Traits */}
          <div>
            <label className="text-[10px] font-bold mb-2 block">Unique traits:</label>
            <div className="flex gap-2">
              <Input
                value={uniqueTraits}
                onChange={(e) => setUniqueTraits(e.target.value)}
                placeholder="e.g big eyes and wears red dress"
                className="flex-1 h-[30px] bg-vibe-gray-700 border-none text-[10px]"
              />
              <Button className="bg-vibe-gray-700 hover:bg-vibe-gray-800 h-[30px] px-3 text-[8px] font-bold">
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
            <Button className="bg-vibe-gray-700 hover:bg-vibe-gray-800 h-[30px] px-3 text-[8px] font-bold">
              Random
            </Button>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="px-4 pb-8">
        <Button
          onClick={() => navigate("/focus-setup")}
          className="w-full max-w-[233px] mx-auto block h-[32px] bg-vibe-gray-700 hover:bg-vibe-gray-800 text-xs font-bold shadow-md"
        >
          Ready? Proceed to phase 2！
        </Button>
      </div>
    </div>
  );
}
