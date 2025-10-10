import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Loading() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Logo/Icon */}
      <div className="mb-12">
        <div className="w-[141px] h-[133px] bg-vibe-gray-600 flex items-center justify-center rounded">
          <span className="text-black text-xl font-normal">Icon</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-[277px] relative mb-12">
        <div className="h-[19px] bg-vibe-gray-300 rounded-md overflow-hidden">
          <div className="h-full w-[29%] bg-vibe-gray-700 rounded-md animate-pulse"></div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center">
        <p className="text-[10px] font-normal">
          2025 VibeBuddy. All rights reserved
        </p>
      </div>
    </div>
  );
}
