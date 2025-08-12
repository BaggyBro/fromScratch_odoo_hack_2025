import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTrip } from "@/hooks/useTrip";
import { formatDate, calculateDays } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Check, IndianRupee, AlertCircle, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

const BuildItinerary = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { trip, loading, error } = useTrip(tripId);
  const [openSections, setOpenSections] = useState<Set<number>>(new Set());
  const [editingCost, setEditingCost] = useState<number | null>(null);
  const [costInput, setCostInput] = useState("");
  const [updatingCost, setUpdatingCost] = useState<number | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareComment, setShareComment] = useState("");
  const [sharing, setSharing] = useState(false);
  const { toast } = useToast();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view this itinerary",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
  }, [navigate, toast]);

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
      toast({
        title: "Invalid Cost",
        description: "Please enter a valid cost amount",
        variant: "destructive",
      });
      return;
    }

    setUpdatingCost(activityId);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/activity/cost`,
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
      
      toast({
        title: "Cost Updated! 💰",
        description: "Activity cost has been updated successfully",
      });
      
      setEditingCost(null);
      setCostInput("");
    } catch (error) {
      console.error("Failed to update cost:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update cost. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingCost(null);
    }
  };

  const handleCostCancel = () => {
    setEditingCost(null);
    setCostInput("");
  };

  const handleShareTrip = async () => {
    if (!shareComment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please add a comment before sharing your trip",
        variant: "destructive",
      });
      return;
    }

    setSharing(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to share your trip",
          variant: "destructive",
        });
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/community`,
        {
          title: `Shared Trip: ${trip.name}`,
          content: shareComment,
          tripId: trip.id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: "Trip Shared! 🎉",
        description: "Your trip has been shared to the community successfully",
      });

      setShowShareModal(false);
      setShareComment("");
    } catch (error) {
      console.error("Failed to share trip:", error);
      toast({
        title: "Share Failed",
        description: "Failed to share trip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSharing(false);
    }
  };

  const shareToSocialMedia = (platform: string) => {
    const tripUrl = `${window.location.origin}/build-itinerary/${trip.id}`;
    const tripTitle = `Check out my amazing trip: ${trip.name}`;
    const tripDescription = shareComment || `I just planned an incredible journey to ${trip.stopActivities.map(sa => sa.city.name).join(', ')}!`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tripTitle)}&url=${encodeURIComponent(tripUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(tripUrl)}&quote=${encodeURIComponent(tripDescription)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(tripUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${tripTitle} ${tripUrl}`)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
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
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowShareModal(true)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 bg-white text-black border-gray-300"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
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
                              ₹0
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
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-green-600">
                                      ₹0
                                    </span>
                                  </div>
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-black mb-4">Share Your Trip</h3>
            <p className="text-sm text-gray-600 mb-4">
              Share "{trip.name}" with the community and let others know about your amazing journey!
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a comment about your trip:
              </label>
              <textarea
                value={shareComment}
                onChange={(e) => setShareComment(e.target.value)}
                placeholder="Share your experience, tips, or what made this trip special..."
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                rows={4}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 text-right mt-1">
                {shareComment.length}/500
              </div>
            </div>

            {/* Social Media Sharing */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share to social media:
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => shareToSocialMedia('twitter')}
                  className="flex-1 bg-blue-400 hover:bg-blue-500 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors"
                >
                  Twitter
                </button>
                <button
                  type="button"
                  onClick={() => shareToSocialMedia('facebook')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors"
                >
                  Facebook
                </button>
                <button
                  type="button"
                  onClick={() => shareToSocialMedia('linkedin')}
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors"
                >
                  LinkedIn
                </button>
                <button
                  type="button"
                  onClick={() => shareToSocialMedia('whatsapp')}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors"
                >
                  WhatsApp
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setShowShareModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleShareTrip}
                disabled={sharing || !shareComment.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {sharing ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sharing...</span>
                  </div>
                ) : (
                  "Share to Community"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default BuildItinerary;