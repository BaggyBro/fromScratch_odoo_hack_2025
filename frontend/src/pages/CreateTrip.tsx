import { useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Wand2, Settings, X } from "lucide-react";
import { tripAPI } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CreateTrip = () => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [createdTripId, setCreatedTripId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Calculate tomorrow's date in yyyy-mm-dd format
  const getTomorrowDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  };

  const tomorrow = getTomorrowDate();

  const handleCreateTrip = async () => {
    if (!name || !startDate || !endDate) return;

    // Save trip to localStorage for calendar
    const trip = { title: name, start: startDate, end: endDate, description };
    const trips = JSON.parse(localStorage.getItem("trips") || "[]");
    trips.push(trip);
    localStorage.setItem("trips", JSON.stringify(trips));

    try {
      const response = await tripAPI.createTrip({
        name,
        startDate,
        endDate,
        description,
      });

      if (response.tripId) {
        navigate(`/build-itinerary/${response.tripId}`);
      } else {
        console.error("Failed to create trip");
      }
    } catch (error: any) {
      if (error.response) {
        // Backend responded with error status
        console.error(
          "Error creating trip:",
          error.response.data.error || error.message
        );
      } else {
        // Network or other error
        console.error("Error creating trip:", error.message);
      }
    }
  };

  const handleAiPlanning = async () => {
    if (!name || !startDate || !endDate) return;

    setIsLoading(true);
    try {
      // First create the trip normally
      const response = await tripAPI.createTrip({
        name,
        startDate,
        endDate,
        description,
      });

      if (response.tripId) {
        setCreatedTripId(response.tripId);
        setShowAiDialog(true);
      } else {
        console.error("Failed to create trip");
      }
    } catch (error: any) {
      console.error("Error creating trip:", error);
      alert("Failed to create trip. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiPromptSubmit = async () => {
    if (!aiPrompt.trim() || !createdTripId) return;

    setIsAiLoading(true);
    try {
      const response = await tripAPI.aiPlanTrip(createdTripId, aiPrompt);

      if (response.success && response.trip) {
        // Navigate to build itinerary with the AI-generated trip
        navigate(`/build-itinerary/${response.trip.id}`);
      } else {
        console.error("AI planning failed:", response.message);
        alert("AI planning failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Error in AI planning:", error);
      alert("AI planning failed. Please try again.");
    } finally {
      setIsAiLoading(false);
      setShowAiDialog(false);
      setAiPrompt("");
    }
  };

  const handleCloseAiDialog = () => {
    setShowAiDialog(false);
    setAiPrompt("");
    if (createdTripId) {
      // Navigate to the created trip if user cancels AI planning
      navigate(`/build-itinerary/${createdTripId}`);
    }
  };

  return (
    <main className="relative min-h-screen p-6">
      <div className="absolute inset-0 bg-[url('/back-image.jpg')] bg-cover bg-center blur-sm"></div>
      <div className="relative z-10 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#d3d3ff]">
          Plan a New Trip
        </h1>

        <Card className="bg-[#e0e0fe85]">
          <CardHeader>
            <CardTitle className="text-xl text-black">Trip Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Trip Name:
              </label>
              <Input
                type="text"
                placeholder="Enter trip name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-black">
                  Start Date:
                </label>
                <Input
                  type="date"
                  min={tomorrow}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-black">
                  End Date:
                </label>
                <Input
                  type="date"
                  min={tomorrow}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Description:
              </label>
              <Textarea
                placeholder="Add trip description (optional)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="pt-4 space-y-3">
              <Button
                onClick={handleCreateTrip}
                disabled={!name || !startDate || !endDate || isLoading}
                className="bg-[#d3d3ff]  hover:bg-black  text-black hover:text-[#d3d3ff] w-full"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Trip...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 " />
                    Create Trip Manually
                  </div>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#e0e0fe85] px-2 text-gray-500">Or</span>
                </div>
              </div>

              <Button
                onClick={handleAiPlanning}
                disabled={!name || !startDate || !endDate || isLoading}
                className="bg-purple-600 text-white hover:bg-purple-700 w-full"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Trip...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    Plan with AI
                  </div>
                )}
              </Button>

              <p className="text-xs text-black text-center">
                AI will create a complete itinerary based on your prompt
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Planning Dialog */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-600" />
              AI Trip Planning
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Trip ID:</strong> {createdTripId}
              </p>
              <p className="text-sm text-purple-700 mt-1">
                <strong>Trip:</strong> {name} ({startDate} to {endDate})
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Describe Your Dream Itinerary:
              </label>
              <Textarea
                placeholder="Tell us what kind of activities, cities, and experiences you want! For example: 'I want to visit spiritual places, do yoga and meditation, explore local culture, and try adventure activities like rafting. Budget-friendly options preferred.'"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Be specific about activities, interests, budget, and any special
                requirements.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleCloseAiDialog}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAiPromptSubmit}
                disabled={!aiPrompt.trim() || isAiLoading}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isAiLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Planning...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    Generate Itinerary
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default CreateTrip;
