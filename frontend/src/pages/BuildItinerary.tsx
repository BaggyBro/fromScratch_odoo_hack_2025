import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTrip } from "@/hooks/useTrip";
import { formatDate, calculateDays } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Check, IndianRupee } from "lucide-react";
import { useState } from "react";
import axios from "axios";

const BuildItinerary = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { trip, loading, error } = useTrip(tripId);
  const [openSections, setOpenSections] = useState<Set<number>>(new Set());
  const [editingCost, setEditingCost] = useState<number | null>(null);
  const [costInput, setCostInput] = useState("");
  const [updatingCost, setUpdatingCost] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleCostEdit = (activityId: number, currentCost: number) => {
    setEditingCost(activityId);
    setCostInput(currentCost.toString());
  };

  const handleCostSave = async (activityId: number) => {
    const cost = parseFloat(costInput);
    if (isNaN(cost) || cost < 0) {
      alert("Please enter a valid cost amount");
      return;
    }

    setUpdatingCost(activityId);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/activity/cost",
        { activityId, cost },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the local trip data
      if (trip) {
        trip.stopActivities.forEach(sa => {
          if (sa.activity.id === activityId) {
            sa.activity.cost = cost;
          }
        });
      }
      
      setEditingCost(null);
      setCostInput("");
    } catch (error) {
      console.error("Failed to update cost:", error);
      alert("Failed to update cost. Please try again.");
    } finally {
      setUpdatingCost(null);
    }
  };

  const handleCostCancel = () => {
    setEditingCost(null);
    setCostInput("");
  };

  if (loading) {
    return (
      <main className="relative min-h-screen p-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm scale-105"
          style={{ backgroundImage: "url('/back-image.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-4xl mx-auto text-white">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
              <div className="space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !trip) {
    return (
      <main className="relative min-h-screen p-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm scale-105"
          style={{ backgroundImage: "url('/back-image.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-4xl mx-auto text-white">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4 text-red-600">Error</h1>
            <p className="text-muted-foreground mb-6">
              {error || "Trip not found"}
            </p>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Trip ID: {tripId || "Not provided"}
              </p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => navigate("/mytrips")}>
                  Back to My Trips
                </Button>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen p-4 overflow-hidden">
      {/* Blurred Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm scale-105"
        style={{ backgroundImage: "url('/back-image.jpg')" }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Foreground content */}
      <div className="relative max-w-4xl mx-auto text-white">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#d3d3ff]">
          Build Itinerary Screen
        </h1>

        {/* Trip Header */}
        <div className="mb-6 p-4 bg-[#e6e6fe] rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                {trip.name}
              </div>
              <div className="text-sm text-black">
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </div>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4 mb-6">
          {(() => {
            const cityGroups = new Map();
            trip.stopActivities.forEach((stopActivity) => {
              const cityId = stopActivity.city.id;
              if (!cityGroups.has(cityId)) {
                cityGroups.set(cityId, {
                  city: stopActivity.city,
                  activities: [],
                });
              }
              cityGroups.get(cityId).activities.push(stopActivity.activity);
            });

            return Array.from(cityGroups.values()).map((cityGroup, index) => (
              <Card
                key={cityGroup.city.id}
                className="border-2 border-gray-200 mb-10 bg-[#e6e6fe] backdrop-blur-sm"
              >
                <CardHeader className="pb-3">
                  <Collapsible 
                    open={openSections.has(index)} 
                    onOpenChange={() => toggleSection(index)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center space-x-3">
                          {cityGroup.city.landmark_img && (
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300">
                              <img
                                src={cityGroup.city.landmark_img}
                                alt={`${cityGroup.city.name} landmark`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <CardTitle className="text-lg text-black">
                            {cityGroup.city.name} {cityGroup.city.country}
                          </CardTitle>
                        </div>
                        <div className="flex items-center space-x-3">
                          {/* Total Cost Display */}
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Total Cost</div>
                            <div className="text-lg font-bold text-green-600">
                              ₹{cityGroup.activities.reduce((total, activity) => total + (activity.cost || 0), 0)}
                            </div>
                          </div>
                          {openSections.has(index) ? (
                            <ChevronDown className="h-5 w-5 text-black transition-transform duration-200" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-black transition-transform duration-200" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-4">
                      <div className="space-y-3">
                        {/* Activities */}
                        <div>
                          <h5 className="text-sm font-medium text-black mb-2">
                            Activities:
                          </h5>
                          <div className="space-y-2">
                            {cityGroup.activities.map((activity) => (
                              <div
                                key={activity.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-xl border"
                              >
                                <div className="flex-1">
                                  <span className="font-medium text-black">
                                    {activity.name}
                                  </span>
                                  {activity.type && (
                                    <Badge
                                      variant="outline"
                                      className="ml-2 text-xs text-black"
                                    >
                                      {activity.type}
                                    </Badge>
                                  )}
                                </div>
                                
                                {/* Cost Section */}
                                <div className="flex items-center space-x-2">
                                  {editingCost === activity.id ? (
                                    <div className="flex items-center space-x-2">
                                      <Input
                                        type="number"
                                        value={costInput}
                                        onChange={(e) => setCostInput(e.target.value)}
                                        className="w-20 h-8 text-sm"
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => handleCostSave(activity.id)}
                                        disabled={updatingCost === activity.id}
                                        className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                                      >
                                        {updatingCost === activity.id ? (
                                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <Check className="w-4 h-4" />
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleCostCancel}
                                        className="h-8 w-8 p-0"
                                      >
                                        ×
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-2">
                                      {activity.cost > 0 && (
                                        <span className="text-sm font-medium text-green-600">
                                          ₹{activity.cost}
                                        </span>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleCostEdit(activity.id, activity.cost || 0)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <IndianRupee className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardHeader>
              </Card>
            ));
          })()}
        </div>

        {/* Add Section */}
        <div className="text-center mb-6">
          <Button
            onClick={() => navigate(`/activity-search/${tripId}`)}
            className="bg-[#e6e6fe] hover:bg-purple-200 px-6 py-2 text-base"
          >
            + Add another Section
          </Button>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => navigate("/mytrips")}
            variant="outline"
            className="px-6 py-2"
          >
            Back to My Trips
          </Button>
          <Button 
            onClick={() => navigate("/mytrips")}
            className="bg-[#d3d3ff] hover:bg-purple-200 px-6 py-2"
          >
            Save Itinerary
          </Button>
        </div>
      </div>
    </main>
  );
};

export default BuildItinerary;