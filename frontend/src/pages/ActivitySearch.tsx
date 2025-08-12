import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Filter,
  SortAsc,
  Check,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";

// Activity shape from fetchCityActivities
interface Activity {
  name: string;
  category: string[];
  address: string;
  coordinates: [number, number];
  image: string;
}

interface SearchResult {
  city: string;
  activities: Activity[];
  count?: number;
}

const ActivitySearch = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<Set<number>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const activitiesPerPage = 6;

  const searchTags = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata"];

  const categoryOptions = [
    "tourism",
    "entertainment",
    "leisure",
    "national_park",
    "commercial.food_and_drink",
    "sports",
    "culture",
    "shopping",
    "nightlife",
    "outdoor",
  ];

  const getPlaceholderImage = (activityName: string) => {
    return `https://via.placeholder.com/600x400/4F46E5/FFFFFF?text=${encodeURIComponent(
      activityName
    )}`;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !tripId) return;

    setIsLoading(true);
    setCurrentPage(1);
    try {
      const token = localStorage.getItem("token");
      const categories =
        selectedCategories.size > 0
          ? Array.from(selectedCategories).join(",")
          : "tourism,entertainment,leisure,national_park,commercial.food_and_drink";

      const response = await axios.post(
        `http://localhost:3000/trips/${tripId}/search/api`,
        {
          city: searchQuery,
          categories: categories,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchResults(response.data as SearchResult);
      setSelectedActivities(new Set());
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults({ city: searchQuery, activities: [], count: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    handleSearch();
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const toggleActivity = (globalIndex: number) => {
    setSelectedActivities((prev) => {
      const next = new Set(prev);
      if (next.has(globalIndex)) next.delete(globalIndex);
      else next.add(globalIndex);

      // Print the updated array of selected activity indices
      console.log("Selected activities (indices):", Array.from(next));

      // Also print the actual selected activity objects
      if (searchResults?.activities) {
        const selectedActivityObjects = Array.from(next).map(
          (idx) => searchResults.activities[idx]
        );
        console.log("Selected activities (objects):", selectedActivityObjects);
      }

      return next;
    });
  };

  // Submit selected activities in the required payload to be saved on backend
  const handleAddSelected = async () => {
    if (!tripId || !searchResults) return;
    const all = searchResults.activities || [];
    const selectedList = Array.from(selectedActivities).map((idx) => all[idx]);
    if (selectedList.length === 0) return;

    // Print the payload being sent to the backend
    const payload = {
      city: searchResults.city,
      selectedActivities: selectedList,
    };
    console.log("Sending payload to backend:", payload);
    console.log("Selected activities count:", selectedList.length);

    try {
      const token = localStorage.getItem("token");
      // Use the add-city-with-activities endpoint
      const response = await axios.post(
        `http://localhost:3000/trips/${tripId}/add-city-with-activities`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response received:", response);
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      navigate(`/build-itinerary/${tripId}`);
    } catch (error: any) {
      console.error("Failed to save selected activities:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      });

      // If this also fails, show a more helpful error message
      toast({
        title: "Save Failed",
        description: `Failed to save activities. Error: ${error.response?.status} - ${
          error.response?.statusText || error.message
        }`,
        variant: "destructive",
      });
    }
  };

  const totalActivities = searchResults?.activities?.length || 0;
  const totalPages = Math.ceil(totalActivities / activitiesPerPage);
  const startIndex = (currentPage - 1) * activitiesPerPage;
  const endIndex = startIndex + activitiesPerPage;
  const currentActivities = (searchResults?.activities || []).slice(
    startIndex,
    endIndex
  );

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (searchQuery) {
      const debounceTimer = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, selectedCategories]);

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#d3d3ff]">
          Activity Search Page
        </h1>

        <div className="bg-[#d3d3ff] rounded-lg border shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              GlobalTrotter
            </h2>
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-gray-700" />
                <Input
                  type="text"
                  placeholder="Search for a city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
              {searchTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {searchTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer text-[#d3d3ff] hover:bg-black text-white"
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Category Filters */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">
                Filter by Categories:
              </h3>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((category) => (
                  <Badge
                    key={category}
                    variant={
                      selectedCategories.has(category) ? "default" : "secondary"
                    }
                    className={`cursor-pointer transition-colors ${
                      selectedCategories.has(category)
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "hover:bg-black"
                    }`}
                    onClick={() => toggleCategory(category)}
                  >
                    {category.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
              {selectedCategories.size > 0 && (
                <div className="text-xs text-gray-600">
                  Selected: {Array.from(selectedCategories).join(", ")}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Sort button removed */}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Results</h3>

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto text-white" />
              <p className="mt-2 text-white">
                Searching for activities in {searchQuery}...
              </p>
            </div>
          )}

          {!isLoading && totalActivities > 0 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-[#d3d3ff] mb-2">
                  {searchResults?.city}
                </h2>
                <p className="text-white">Found {totalActivities} activities</p>
                {selectedCategories.size > 0 && (
                  <p className="text-sm text-gray-300">
                    Filtered by: {Array.from(selectedCategories).join(", ")}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentActivities.map((activity, idx) => {
                  const globalIndex = startIndex + idx;
                  const selected = selectedActivities.has(globalIndex);
                  return (
                    <Card
                      key={`${activity.name}-${globalIndex}`}
                      className={`border-2 cursor-pointer transition-all hover:shadow-lg ${
                        selected
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-400"
                      }`}
                      onClick={() => toggleActivity(globalIndex)}
                    >
                      <CardContent className="p-4">
                        <div className="relative mb-3">
                          <img
                            src={
                              activity.image ||
                              getPlaceholderImage(activity.name)
                            }
                            alt={activity.name}
                            className="w-full h-32 object-cover rounded-lg "
                            onError={(e) => {
                              e.currentTarget.src = getPlaceholderImage(
                                activity.name
                              );
                            }}
                          />
                          {selected && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <h4 className={`font-semibold text-lg ${
                            selected ? "text-gray-800" : "text-white"
                          }`}>
                            {activity.name}
                          </h4>
                          <p className={`text-sm ${
                            selected ? "text-gray-600" : "text-white"
                          }`}>
                            {activity.address}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(activity.category || [])
                              .slice(0, 3)
                              .map((cat, catIndex) => (
                                <Badge
                                  key={catIndex}
                                  variant="outline"
                                  className={`text-xs ${
                                    selected ? "text-gray-700 border-gray-400" : "text-white border-white"
                                  }`}
                                >
                                  {cat.split(".").pop() || cat}
                                </Badge>
                              ))}
                            {activity.category &&
                              activity.category.length > 3 && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    selected ? "text-gray-700 border-gray-400" : "text-white border-white"
                                  }`}
                                >
                                  +{activity.category.length - 3} more
                                </Badge>
                              )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className="w-8 h-8"
                      >
                        {page}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="text-center mt-6">
                <Button
                  onClick={handleAddSelected}
                  className="bg-[#d3d3ff] hover:bg-[#d3d3ff] px-8 py-3 text-lg"
                  disabled={selectedActivities.size === 0}
                >
                  {selectedActivities.size > 0
                    ? `Add ${selectedActivities.size} Selected Activities to Trip`
                    : "Select activities to add"}
                </Button>
              </div>
            </div>
          )}

          {!isLoading && searchQuery && totalActivities === 0 && (
            <div className="text-center py-8 text-gray-200">
              <p>No activities found for "{searchQuery}"</p>
              {selectedCategories.size > 0 && (
                <p className="text-sm mt-2">
                  Try adjusting your category filters
                </p>
              )}
            </div>
          )}

          {!searchQuery && !isLoading && (
            <div className="text-center py-8 text-gray-200">
              <p>Start typing a city name to search for activities</p>
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <Button
            onClick={() => navigate(`/build-itinerary/${tripId}`)}
            variant="outline"
            className="px-6 py-2"
          >
            Back to Itinerary
          </Button>
        </div>
      </div>
    </main>
  );
};

export default ActivitySearch;
