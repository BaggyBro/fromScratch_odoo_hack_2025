import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/trips/view`, {
          headers: { Authorization: `Bearer ${token} `},
        });
        if (response.data.success) {
          setTrips(response.data.trips || []);
        } else {
          setError("Failed to fetch trips");
        }
      } catch (err) {
        setError("Error fetching trips");
        console.error(err);
      }

      setLoading(false);
    };

    fetchTrips();
  }, []);

  const toDateStr = (d) => {
    try {
      const iso = new Date(d).toISOString();
      return iso.slice(0, 10);
    } catch {
      return "";
    }
  };

  const computeStatus = (start, end) => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;
    const s = start ? toDateStr(start) : null;
    const e = end ? toDateStr(end) : s;
    if (!s || !e) return undefined;
    if (todayStr < s) return "UPCOMING";
    if (todayStr > e) return "COMPLETED";
    return "ONGOING";
  };

  const enrichedTrips = (trips || []).map((t) => ({
    ...t,
    status: computeStatus(t.startDate, t.endDate),
  }));

  const ongoingTrips = enrichedTrips.filter((t) => t.status === "ONGOING");
  const upcomingTrips = enrichedTrips.filter((t) => t.status === "UPCOMING");
  const completedTrips = enrichedTrips.filter((t) => t.status === "COMPLETED");

  // Categories for grouped section (reuse existing UI)
  const categories = [
    { title: "Ongoing", items: ongoingTrips },
    { title: "Up-coming", items: upcomingTrips },
    { title: "Completed", items: completedTrips },
  ];

  const statusPillClasses = (status) => {
    switch (status) {
      case "UPCOMING":
        return "bg-blue-500/15 text-blue-700 border-blue-500/30";
      case "ONGOING":
        return "bg-green-500/15 text-green-700 border-green-500/30";
      case "COMPLETED":
        return "bg-gray-500/15 text-gray-700 border-gray-500/30";
      default:
        return "bg-black/10 text-black/70 border-black/20";
    }
  };

  const handleTripClick = (tripId) => {
    navigate(`/build-itinerary/${tripId}`);
  };

  return (
    <main className="relative min-h-screen p-6">
      <div className="absolute inset-0 bg-[url('/back-image.jpg')] bg-cover bg-center blur-sm"></div>
      <div className="relative z-10 p-[2rem] max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-[#D3D3FF]">
            Dashboard / My Trips
          </h1>
          <p className="text-sm text-white">
            Quick overview plus your trips grouped by status.
          </p>
        </header>

        {/* Removed: Overview cards (Recent Trips) */}

        {/* Trips grouped */}
        <section className="space-y-6 mb-10">
          {categories.map((cat) => (
            <Card key={cat.title} className="bg-[#D3D3FF] text-black">
              <CardHeader>
                <CardTitle>{cat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && <p className="text-black/70">Loading...</p>}
                {!loading && cat.items.length === 0 && (
                  <p className="text-black/60">No trips in this category.</p>
                )}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cat.items.map((trip) => (
                    <div
                      key={trip.id || trip.name}
                      className="group rounded-xl border border-black/10 bg-white/60 p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                      onClick={() => handleTripClick(trip.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-md bg-black/10 flex items-center justify-center shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-black/50">
                            <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v4H3V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1Zm14 10H3v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6ZM8 16a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm4 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm4 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold truncate">{trip.name}</div>
                          </div>
                          <div className="mt-1 text-xs text-black/70 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-black/50">
                              <path d="M12 6a6 6 0 1 1 0 12A6 6 0 0 1 12 6Zm-.75 3.5a.75.75 0 0 1 1.5 0V12h2a.75.75 0 0 1 0 1.5h-2.75A.75.75 0 0 1 11.25 12V9.5Z" />
                            </svg>
                            {trip.startDate && trip.endDate
                              ? `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`
                              : trip.createdAt
                              ? `Created at: ${new Date(trip.createdAt).toLocaleDateString()}`
                              : "Dates unavailable"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Removed: Previous Trips section */}
      </div>
    </main>
  );
};

export default Dashboard;