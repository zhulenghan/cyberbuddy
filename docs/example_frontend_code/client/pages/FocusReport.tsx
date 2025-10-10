import { ChevronLeft, Home, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function FocusReport() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Title and Pet */}
      <div className="px-6 flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[30px] font-bold mb-2">FOCUS REPORT</h1>
          <p className="text-[10px] font-bold">
            Congrats! You reached your focus goal!
          </p>
        </div>
        <div className="w-[121px] h-[114px] bg-vibe-gray-700 rounded flex items-center justify-center">
          <p className="text-[15px] text-center px-2">
            Pet figure graphic (pet holding trophy sth)
          </p>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="px-4 mb-6">
        <div className="bg-vibe-gray-500 rounded p-4 shadow-md">
          <div className="mb-4">
            <p className="text-[10px] font-bold">Monthly Stats</p>
            <p className="text-sm font-bold">October</p>
          </div>

          {/* Bar Chart */}
          <div className="relative h-32 flex items-end justify-around gap-2 mb-4">
            <div className="w-5 h-16 bg-vibe-gray-700 rounded"></div>
            <div className="w-5 h-12 bg-vibe-gray-700 rounded"></div>
            <div className="w-5 h-16 bg-vibe-gray-700 rounded"></div>
            <div className="w-5 h-12 bg-vibe-gray-700 rounded"></div>
            <div className="w-5 h-20 bg-vibe-gray-700 rounded"></div>
            <div className="w-5 h-12 bg-vibe-gray-700 rounded"></div>
            <div className="w-5 h-32 bg-vibe-gray-900 rounded relative">
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[6px] font-bold whitespace-nowrap">
                70min
              </span>
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex justify-around text-[6px] font-bold text-center">
            <span>01</span>
            <span>02</span>
            <span>03</span>
            <span>04</span>
            <span>05</span>
            <span>06</span>
            <span>07</span>
          </div>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="px-4 mb-6">
        <div className="bg-vibe-gray-500 rounded p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] font-bold">10/03</span>
            <span className="text-[8px] font-bold">10/09</span>
          </div>
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5, 0, 0].map((active, i) => (
              <div
                key={i}
                className={`w-[10px] h-[10px] rounded-full ${
                  active ? "bg-vibe-dark" : "bg-vibe-gray-700"
                }`}
              />
            ))}
          </div>
          <p className="text-[8px] font-bold text-center">Days active 5/7</p>
        </div>
      </div>

      {/* Stats and Persona */}
      <div className="px-4 mb-6">
        <div className="bg-vibe-gray-500 rounded p-4 shadow-md flex gap-4">
          <div className="flex-1">
            <p className="text-[10px] font-bold mb-2">Word count: xxxx</p>
            <p className="text-[10px] font-bold mb-2">Webpage used: #tag# #tag# #tag#</p>
            <p className="text-[10px] font-bold">Your have surpassed xxx % people sth</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold mb-2">Your Focus Persona:</p>
            <p className="text-xl font-bold">&quot;XXX&quot;</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 space-y-3 mb-6">
        <Button className="w-full h-[25px] bg-vibe-gray-700 hover:bg-vibe-gray-800 text-[11px] font-bold shadow-md">
          Back
        </Button>
        <Button className="w-full h-[25px] bg-vibe-gray-700 hover:bg-vibe-gray-800 text-[11px] font-bold shadow-md">
          Share
        </Button>
        <Button className="w-full h-[25px] bg-vibe-gray-700 hover:bg-vibe-gray-800 text-[11px] font-bold shadow-md">
          Start new!
        </Button>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-4">
        <div className="flex justify-center items-center gap-12">
          <button
            onClick={() => navigate("/focus-setup")}
            className="flex flex-col items-center"
          >
            <div className="w-10 h-10 rounded-full bg-vibe-gray-600"></div>
          </button>
          <button
            onClick={() => navigate("/home")}
            className="flex flex-col items-center"
          >
            <Home className="w-9 h-9 text-black stroke-[3]" />
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="flex flex-col items-center"
          >
            <Settings className="w-10 h-10 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}
