import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Share2, MessageCircle } from "lucide-react";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

type Trip = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
};

type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  tripId?: number;
  trip?: Trip;
  user?: {
    firstName: string;
    lastName: string;
    city?: string;
    country?: string;
  };
};

export default function Community() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("All");

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    applySearchAndFilter();
  }, [posts, searchTerm, cityFilter]);

  async function fetchPosts() {
    try {
      const res = await axios.get<Post[]>("/community");
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts");
    }
  }

  function applySearchAndFilter() {
    let filtered = [...posts];
    if (cityFilter !== "All") {
      filtered = filtered.filter(
        (post) => post.user?.city?.toLowerCase() === cityFilter.toLowerCase()
      );
    }
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredPosts(filtered);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to post.");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        "/community",
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setContent("");
      setShowModal(false);
      fetchPosts();
    } catch (err) {
      console.error("Error posting:", err);
      setError("Failed to create post");
    }
    setLoading(false);
  }

  const uniqueCities = Array.from(
    new Set(posts.map((post) => post.user?.city).filter(Boolean))
  ) as string[];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="relative min-h-screen p-4 overflow-hidden">
      {/* Blurred Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm scale-105"
        style={{ backgroundImage: "url('/back-image.jpg')" }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Foreground content */}
      <div className="relative max-w-4xl mx-auto text-white">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-[#d3d3ff]">Community</h1>
          <p className="text-[#d3d3ff]/80">Share your travel experiences and discover amazing trips from fellow travelers</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-black/50 border-[#E6E6FA]/40 text-white placeholder:text-white/60 focus:border-[#d3d3ff] focus:ring-[#d3d3ff]"
          />
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-2 bg-black/50 border border-[#E6E6FA]/40 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d3d3ff] focus:border-[#d3d3ff]"
          >
            <option value="All">All Cities</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-[#d3d3ff] hover:bg-[#bdbde6] text-black font-semibold"
          >
            Create Post
          </Button>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 mx-auto text-[#d3d3ff]/60 mb-4" />
              <p className="text-[#d3d3ff]/80 text-lg">No posts found</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="bg-[#e6e6fe]/90 backdrop-blur-sm border border-[#E6E6FA]/40 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-black mb-2">
                        {post.title}
                      </CardTitle>
                      
                      {/* Trip Information for Shared Trips */}
                      {post.trip && (
                        <div className="mb-4 p-4 bg-[#d3d3ff]/30 rounded-lg border border-[#d3d3ff]/50">
                          <div className="flex items-center space-x-2 mb-2">
                            <Share2 className="w-4 h-4 text-[#d3d3ff]" />
                            <span className="text-sm font-medium text-black">Shared Trip</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-black/70" />
                              <span className="text-sm text-black">
                                {formatDate(post.trip.startDate)} - {formatDate(post.trip.endDate)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-black/70" />
                              <span className="text-sm text-black">{post.trip.name}</span>
                            </div>
                          </div>
                          {post.trip.description && (
                            <p className="text-sm text-black/80 mt-2">{post.trip.description}</p>
                          )}
                          <Button
                            onClick={() => navigate(`/build-itinerary/${post.trip.id}`)}
                            variant="outline"
                            size="sm"
                            className="mt-3 text-white bg-black border-black hover:bg-gray-800"
                          >
                            View Itinerary
                          </Button>
                        </div>
                      )}
                      
                      <p className="text-black whitespace-pre-wrap">{post.content}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-black/70">
                    <div className="flex items-center space-x-4">
                      <span>
                        By {post.user?.firstName} {post.user?.lastName}
                      </span>
                      {post.user?.city && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          {post.user.city}, {post.user.country}
                        </span>
                      )}
                    </div>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create Post Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#e6e6fe] rounded-lg p-6 max-w-md w-full mx-4 border border-[#E6E6FA]/40">
              <h3 className="text-lg font-semibold mb-4 text-black">Create a Post</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Title
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter post title"
                    required
                    className="bg-white border-gray-300 text-black focus:ring-[#d3d3ff] focus:border-[#d3d3ff]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full p-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d3d3ff] focus:border-[#d3d3ff] text-black"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    onClick={() => setShowModal(false)}
                    variant="outline"
                    className="flex-1 border-black/30 text-black hover:bg-black/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#d3d3ff] hover:bg-[#bdbde6] text-black font-semibold"
                  >
                    {loading ? "Creating..." : "Create Post"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
