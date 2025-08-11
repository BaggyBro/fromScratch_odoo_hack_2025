import React, { useEffect, useState } from "react";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:3000";

type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    city?: string;
    country?: string;
  };
};

export default function Community() {
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

  return (
    <div className="relative min-h-screen py-10 px-2 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm scale-100"
        style={{ backgroundImage: "url('/back-image.jpg')" }}
      ></div>
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-[#d3d3ff]">Community Tab</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#d3d3ff] text-[#181825] font-semibold px-5 py-2 rounded-lg hover:bg-[#bdbde6]"
          >
            + New Post
          </button>
        </div>

        {error && (
          <div className="text-red-400 mb-4 text-center font-semibold">
            {error}
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow rounded px-3 py-2 bg-black/50 border border-white/10 text-white"
          />
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="rounded px-3 py-2 bg-black/50 border border-white/10 text-white"
          >
            <option value="All">All Cities</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
            <form
              onSubmit={handleSubmit}
              className="bg-[#d3d3ff] rounded-xl px-8 py-7 min-w-[400px] max-w-md flex flex-col gap-4"
            >
              <h3 className="text-lg font-bold mb-1 text-black">
                Create New Post
              </h3>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="border border-black/20 rounded-lg px-3 py-2 text-black"
              />
              <textarea
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
                className="border border-black/20 rounded-lg px-3 py-2 resize-none text-black"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#d3d3ff] text-[#181825] font-semibold px-5 py-1.5 rounded hover:bg-[#9999ce]"
                >
                  {loading ? "Posting..." : "Post"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-[#d3d3ff] text-gray-800 px-5 py-1.5 rounded hover:bg-gray-400/70"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center text-white/80 p-8">No posts found.</div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-[#d3d3ff] text-[#181825] rounded-2xl mb-6 p-6 shadow-lg"
              >
                <div className="font-bold mb-1 text-lg">{post.title}</div>
                <div className="mb-4 whitespace-pre-wrap">{post.content}</div>
                <div className="text-xs text-[#58587c] flex justify-between">
                  <span>
                    {post.user?.firstName} {post.user?.lastName}{" "}
                    {post.user?.city &&
                      `(${post.user.city}, ${post.user.country})`}
                  </span>
                  <span>{new Date(post.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
