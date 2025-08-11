import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, MapPin, Clock, IndianRupee, Calendar } from "lucide-react";
import { useState } from "react";
import mumbaiItinerary from "@/data/mumbaiItinerary.json";
import hyderabadItinerary from "@/data/hyderabadItinerary.json";

const Itinerary = () => {
  const { place } = useParams<{ place: string }>();
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0, 1, 2])); // Open all days by default

  // Get itinerary data based on the place parameter
  const getTripData = () => {
    switch (place?.toLowerCase()) {
      case 'mumbai':
        return mumbaiItinerary.trip;
      case 'hyderabad':
        return hyderabadItinerary.trip;
      default:
        return null;
    }
  };

  const trip = getTripData();

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

  // Group activities by day
  const activitiesByDay = trip.stopActivities.reduce((acc, stopActivity) => {
    const date = stopActivity.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(stopActivity);
    return acc;
  }, {} as Record<string, typeof trip.stopActivities>);

  // Sort days
  const sortedDays = Object.keys(activitiesByDay).sort();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  if (!trip) {
    return (
      <main className="relative min-h-screen p-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm scale-105"
          style={{ backgroundImage: "url('/back-image.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-4xl mx-auto text-white">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4 text-red-600">Itinerary Not Found</h1>
            <p className="text-muted-foreground mb-6">
              No itinerary found for {place}
            </p>
            <Button onClick={() => navigate("/")}>
              Back to Home
            </Button>
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
          {trip.name} - Itinerary
        </h1>

        {/* Trip Header */}
        <div className="mb-6 p-4 bg-[#e6e6fe] rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                {trip.name}
              </div>
              <div className="text-sm text-black flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </div>
            </div>
            <div className="text-sm text-black">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {trip.status}
              </Badge>
            </div>
          </div>
          {trip.description && (
            <p className="text-sm text-gray-600 mt-2">{trip.description}</p>
          )}
        </div>

        {/* Days */}
        <div className="space-y-4 mb-6">
          {sortedDays.map((day, dayIndex) => {
            const dayActivities = activitiesByDay[day];
            const totalCost = dayActivities.reduce((sum, sa) => sum + (sa.activity.cost || 0), 0);
            
            return (
              <Card
                key={day}
                className="border-2 border-gray-200 mb-6 bg-[#e6e6fe] backdrop-blur-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection(dayIndex)}>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-800 font-bold text-lg">D{dayIndex + 1}</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg text-black">
                          {formatDate(day)}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {dayActivities.length} activities
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {/* Total Cost Display */}
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Total Cost</div>
                        <div className="text-lg font-bold text-green-600">
                          ₹{totalCost}
                        </div>
                      </div>
                      {openSections.has(dayIndex) ? (
                        <ChevronDown className="h-5 w-5 text-black transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-black transition-transform duration-200" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {openSections.has(dayIndex) && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Activities */}
                      <div>
                        <h5 className="text-sm font-medium text-black mb-3">
                          Activities:
                        </h5>
                        <div className="space-y-3">
                          {dayActivities.map((stopActivity, activityIndex) => (
                            <div
                              key={stopActivity.id}
                              className="flex items-start space-x-4 p-3 bg-gray-50 rounded-xl border"
                            >
                              {/* Time */}
                              <div className="flex-shrink-0 w-16 text-center">
                                <div className="text-sm font-medium text-purple-600">
                                  {formatTime(stopActivity.time)}
                                </div>
                              </div>
                              
                              {/* Activity Details */}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-black">
                                    {stopActivity.activity.name}
                                  </h4>
                                  <div className="flex items-center space-x-2">
                                    {stopActivity.activity.cost > 0 && (
                                      <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                                        <IndianRupee className="w-3 h-3" />
                                        {stopActivity.activity.cost}
                                      </span>
                                    )}
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-black"
                                    >
                                      {stopActivity.activity.type}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-2">
                                  {stopActivity.activity.description}
                                </p>
                                
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {stopActivity.activity.durationMinutes} min
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {stopActivity.city.name}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="px-6 py-2"
          >
            Back to Home
          </Button>
          <Button 
            onClick={() => navigate("/create-trip")}
            className="bg-[#d3d3ff] hover:bg-purple-200 px-6 py-2"
          >
            Plan Your Own Trip
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Itinerary; 