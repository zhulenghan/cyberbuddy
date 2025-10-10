import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function Placeholder() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-vibe-gray-600 rounded-lg mx-auto mb-6 flex items-center justify-center">
          <span className="text-3xl">🚧</span>
        </div>
        <h1 className="text-2xl font-bold mb-4">Page Under Construction</h1>
        <p className="text-vibe-gray-900 mb-8">
          This page is not yet implemented. Please continue prompting to fill in this page content if you'd like to see it!
        </p>
        <Button
          onClick={() => navigate("/")}
          className="bg-vibe-gray-700 hover:bg-vibe-gray-800 text-black gap-2"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
