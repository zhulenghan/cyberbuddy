import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home as HomeIcon, Settings, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const navigate = useNavigate();
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const activities = [
    { id: "work", label: "WORK" },
    { id: "shopping", label: "SHOPPING" },
    { id: "recreation", label: "RECREATION" },
    { id: "research", label: "RESEARCH" },
    { id: "reading", label: "READING" },
  ];

  const toggleActivity = (id: string) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[15px] font-bold">Space ID: 123456789</p>
          <p className="text-[15px] font-bold">User ID: KitaGuan</p>
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
                    ? "bg-vibe-gray-900 text-white"
                    : "bg-vibe-gray-700"
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
            onClick={() => navigate("/focus-report")}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Pet 1 */}
            <div className="flex flex-col items-center">
              <div className="w-full aspect-square bg-vibe-gray-700 rounded flex items-center justify-center mb-3">
                <p className="text-xl font-bold">Pet IMAGE<br />HERE</p>
              </div>
              <p className="text-[15px] font-bold">PET NAME HERE</p>
            </div>

            {/* Pet 2 */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => navigate("/create-pet")}
                className="w-full aspect-square border-[10px] border-dashed border-vibe-gray-700 rounded flex items-center justify-center mb-3 hover:bg-vibe-gray-100 transition-colors"
              >
                <p className="text-5xl font-bold text-vibe-gray-700">＋</p>
              </button>
              <p className="text-[15px] font-bold text-vibe-gray-700">Add New Pet</p>
            </div>

            {/* Pet 3 */}
            <div className="flex flex-col items-center">
              <div className="w-full aspect-square border-[10px] border-dashed border-vibe-gray-700 rounded flex items-center justify-center mb-3">
                <p className="text-5xl font-bold text-vibe-gray-700">＋</p>
              </div>
              <p className="text-[15px] font-bold text-vibe-gray-700">PET NAME HERE</p>
            </div>
          </div>
        </div>

        {/* Meet with Pet Button */}
        <div className="mt-8 text-center">
          <Button className="bg-vibe-gray-700 hover:bg-vibe-gray-800 text-black h-[31px] px-12">
            <span className="font-bold">Meet with </span>
            <span className="font-normal italic">PET NAME HERE</span>
            <span className="font-bold"> right now!</span>
          </Button>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-4">
        <div className="flex justify-center items-center gap-12">
          <button
            onClick={() => navigate("/focus-setup")}
            className="flex flex-col items-center"
          >
            <Timer className="w-10 h-10 text-black" />
          </button>
          <button className="flex flex-col items-center drop-shadow-lg">
            <HomeIcon className="w-9 h-9 text-black stroke-[3]" />
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="flex flex-col items-center"
          >
            <Settings className="w-10 h-10 text-black" />
          </button>
        </div>
      </div>

      {/* Help Link */}
      <div className="text-center py-4">
        <p className="text-[8px] italic font-bold">
          Having question? &gt;Go to{" "}
          <span className="underline">guide</span>
        </p>
      </div>
    </div>
  );
}
