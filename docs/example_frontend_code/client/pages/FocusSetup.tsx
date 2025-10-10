import { useState } from "react";
import { ChevronLeft, Home, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function FocusSetup() {
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState("");
  const [skipRest, setSkipRest] = useState(false);
  const [duration, setDuration] = useState(30);

  const activities = ["Work", "Study", "Reading", "Music", "Shopping", "Searching"];

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
        <h1 className="text-[25px] font-bold">FOCUS MODE</h1>
      </div>

      {/* Activity Selection */}
      <div className="px-6 mb-6">
        <div className="bg-vibe-gray-500 rounded p-4">
          <p className="text-xs font-bold text-center mb-4">
            Which activity would you like to focus on today?
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {activities.map((activity) => (
              <button
                key={activity}
                onClick={() => setSelectedActivity(activity)}
                className={`px-6 py-2 rounded text-[10px] font-bold transition-colors ${
                  selectedActivity === activity
                    ? "bg-vibe-gray-900 text-white"
                    : "bg-vibe-gray-700"
                }`}
              >
                {activity}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Time Setup */}
      <div className="px-6 mb-6">
        <div className="bg-vibe-gray-500 rounded p-6">
          <h2 className="text-[21px] font-bold text-center mb-6">Time Setup</h2>
          
          <div className="flex items-center justify-center gap-8">
            {/* Duration Display */}
            <div className="relative">
              <div className="w-[134px] h-[138px] rounded-full bg-vibe-gray-700 flex items-center justify-center">
                <div className="w-[95px] h-[98px] rounded-full bg-vibe-gray-500 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold">{duration}</span>
                  <span className="text-sm font-bold">Minutes</span>
                </div>
              </div>
            </div>

            {/* Rest Session Option */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold text-center">
                You will have 1 rest session
                <br />
                <br />
                Skip the rest?
              </p>
              <div className="flex items-center justify-center">
                <Checkbox
                  id="skip-rest"
                  checked={skipRest}
                  onCheckedChange={(checked) => setSkipRest(checked as boolean)}
                  className="w-4 h-4 border-black"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="px-6 mb-4">
        <Button
          onClick={() => navigate("/focus-report")}
          className="w-full max-w-[132px] mx-auto block h-[31px] bg-vibe-gray-700 hover:bg-vibe-gray-800 text-[15px] font-bold shadow-md"
        >
          Start
        </Button>
      </div>

      {/* Help Link */}
      <div className="text-center mb-8">
        <p className="text-[8px] italic font-bold">
          Having question? &gt;Go to{" "}
          <span className="underline">focus mode guide</span>
        </p>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-4">
        <div className="flex justify-center items-center gap-12">
          <button className="flex flex-col items-center">
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
