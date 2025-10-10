import { ChevronLeft, Home, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const navigate = useNavigate();

  const menuItems = [
    { label: "Achievement System", onClick: () => navigate("/activity") },
    { label: "LANGUAGES", onClick: () => {} },
    { label: "VIEW MY PLAN", onClick: () => {} },
    { label: "CLEAR ALL DATA", onClick: () => {} },
    { label: "LOG OUT", onClick: () => navigate("/") },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Logo/Icon */}
      <div className="flex justify-center mb-8">
        <div className="w-[36px] h-[32px] bg-vibe-gray-700 flex items-center justify-center">
          <span className="text-[8px] font-normal">Icon</span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-12 space-y-4 mb-8">
        {menuItems.map((item, index) => (
          <Button
            key={index}
            onClick={item.onClick}
            className="w-full h-[68px] bg-vibe-gray-600 hover:bg-vibe-gray-700 text-black text-[15px] font-bold uppercase"
          >
            {item.label}
          </Button>
        ))}
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
          <button className="flex flex-col items-center drop-shadow-lg">
            <SettingsIcon className="w-10 h-10 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}
