import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { tripAPI } from "@/lib/api";
import { formatDate, calculateDays } from "@/lib/utils";
import { Calendar, MapPin, Users, Search, Filter, SortAsc } from "lucide-react";

interface Trip {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  stopActivities: Array<{
    id: number;
    city: {
      id: number;
      name: string;
      country: string;
    };
    activity: {
      id: number;
      name: string;
      type: string;
      cost: number;
    };
  }>;
}

interface TripsResponse {
  success: boolean;
  trips: Trip[];
}

const MyTrips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response: TripsResponse = await tripAPI.getUserTrips();
      if (response.success) {
        setTrips(response.trips);
      } else {
        setError("Failed to fetch trips");
      }
    } catch (err: any) {
      console.error("Error fetching trips:", err);
      setError(err.response?.data?.message || "Failed to fetch trips");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "UPCOMING":
        return "bg-blue-100 text-blue-800";
      case "ONGOING":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "UPCOMING":
        return "🗓️";
      case "ONGOING":
        return "🚀";
      case "COMPLETED":
        return "✅";
      default:
        return "📋";
    }
  };

  const groupTripsByStatus = (trips: Trip[]) => {
    const grouped = {
      upcoming: trips.filter(trip => trip.status.toUpperCase() === "UPCOMING"),
      ongoing: trips.filter(trip => trip.status.toUpperCase() === "ONGOING"),
      completed: trips.filter(trip => trip.status.toUpperCase() === "COMPLETED")
    };
    return grouped;
  };

  const filterTrips = (trips: Trip[], query: string) => {
    if (!query) return trips;
    return trips.filter(trip => 
      trip.name.toLowerCase().includes(query.toLowerCase()) ||
      trip.description.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getUniqueCities = (trip: Trip) => {
    const cities = new Set();
    trip.stopActivities.forEach(sa => {
      cities.add(sa.city.name);
    });
    return Array.from(cities);
  };

  const getTotalCost = (trip: Trip) => {
    return trip.stopActivities.reduce((total, sa) => total + (sa.activity.cost || 0), 0);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-6">
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
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-red-600">Error</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchTrips} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const filteredTrips = filterTrips(trips, searchQuery);
  const groupedTrips = groupTripsByStatus(filteredTrips);

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#d3d3ff]">My Trips</h1>
          <Button 
            onClick={() => navigate("/create-trip")}
            className="bg-[#d3d3ff] hover:bg-purple-200"
          >
            + Create New Trip
          </Button>
        </div>
        
        {/* Search and Filter Section */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="px-6 py-3 border-[#E6E6FA]/40 hover:bg-[#E6E6FA]/10">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" className="px-6 py-3 border-[#E6E6FA]/40 hover:bg-[#E6E6FA]/10">
                <SortAsc className="w-4 h-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>
        </section>

        {/* Trip Categories */}
        {Object.entries(groupedTrips).map(([status, statusTrips]) => {
          if (statusTrips.length === 0) return null;
          
          const statusLabels = {
            upcoming: "Upcoming",
            ongoing: "Ongoing", 
            completed: "Completed"
          };

          return (
            <section key={status} className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-white">
                {statusLabels[status as keyof typeof statusLabels]} ({statusTrips.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statusTrips.map((trip) => {
                  const cities = getUniqueCities(trip);
                  const totalCost = getTotalCost(trip);
                  const daysLeft = calculateDays(new Date().toISOString(), trip.startDate);
                  
                  return (
                    <Card key={trip.id} className="hover:scale-105 border-2 border-transparent hover:border-[#E6E6FA]/40 transition-all duration-300 cursor-pointer" onClick={() => navigate(`/build-itinerary/${trip.id}`)}>
                      <CardHeader className="text-center pb-3">
                        <div className="text-4xl mb-2">{getStatusIcon(trip.status)}</div>
                        <CardTitle className="text-lg text-white">{trip.name}</CardTitle>
                        <Badge className={`${getStatusColor(trip.status)} text-xs`}>
                          {trip.status}
                        </Badge>
                      </CardHeader>
                      <CardContent className="text-center">
                        <p className="text-muted-foreground mb-4 text-sm">
                          {trip.description || "No description available"}
                        </p>
                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex items-center justify-center text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                          </div>
                          {cities.length > 0 && (
                            <div className="flex items-center justify-center text-muted-foreground">
                              <MapPin className="w-4 h-4 mr-2" />
                              {cities.slice(0, 2).join(", ")}
                              {cities.length > 2 && ` +${cities.length - 2} more`}
                            </div>
                          )}
                          {trip.stopActivities.length > 0 && (
                            <div className="flex items-center justify-center text-muted-foreground">
                              <Users className="w-4 h-4 mr-2" />
                              {trip.stopActivities.length} activities
                            </div>
                          )}
                          {totalCost > 0 && (
                            <div className="text-green-600 font-medium">
                              ${totalCost} total cost
                            </div>
                          )}
                          {status === "upcoming" && daysLeft > 0 && (
                            <div className="text-blue-600 font-medium">
                              {daysLeft} days until start
                            </div>
                          )}
                        </div>
                        <Button variant="outline" className="w-full group-hover:bg-[#E6E6FA]/10">
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}

        {filteredTrips.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold mb-2 text-white">
              {searchQuery ? "No trips found" : "No trips yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "Try adjusting your search terms" : "Start planning your next adventure!"}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => navigate("/create-trip")}
                className="bg-[#d3d3ff] hover:bg-purple-200"
              >
                Create Your First Trip
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyTrips; 