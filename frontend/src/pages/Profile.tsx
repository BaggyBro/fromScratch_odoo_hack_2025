import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Trip = {
  id: string;
  name: string;
};

type User = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  city: string;
  country: string;
  email: string;
  language?: string;
  description?: string;
  profilePic?: string;
  trips: Trip[];
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshNavbar = () => {
    window.dispatchEvent(new CustomEvent('profileUpdated'));
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:3000/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        refreshNavbar();
      } else {
        setError(data.message || "Failed to load profile");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-[#d3d3ff]/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-[#d3d3ff] rounded-full animate-spin"></div>
          <div className="absolute inset-2 bg-[#d3d3ff] rounded-full animate-pulse"></div>
        </div>
        <p className="text-[#d3d3ff] text-lg font-medium">Loading Profile...</p>
      </div>
    </div>
  );
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;
  if (!user) return null;

  const preplannedTrips = user.trips.slice(0, Math.ceil(user.trips.length / 2));
  const previousTrips = user.trips.slice(Math.ceil(user.trips.length / 2));

  return (
    <div className="relative min-h-screen bg-black p-8">
      <div className="absolute inset-0 bg-[url('/back-image.jpg')] bg-cover bg-center blur-sm "></div>

      <div className="relative z-10 max-w-5xl mx-auto p-8 bg-[#D3D3FF]/60 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-black">User Profile</h1>
          <button 
            onClick={fetchProfile}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Refresh
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-10 border border-black/10 p-6 rounded-lg bg-white/20 backdrop-blur-sm">
          {user.profilePic ? (
            <img
              src={user.profilePic}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-32 h-32 rounded-full object-cover border-4 border-white/30 shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center rounded-full bg-[#d3d3ff] border-4 border-white/30 shadow-lg text-6xl">
              <span role="img" aria-label="User">👤</span>
            </div>
          )}
          <div className="flex-1 text-black">
            <h2 className="text-2xl font-semibold mb-2">
              {user.firstName} {user.lastName}
            </h2>
            <div className="space-y-1">
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Age:</strong> {user.age}
              </p>
              <p>
                <strong>Gender:</strong> {user.gender}
              </p>
              <p>
                <strong>City:</strong> {user.city}
              </p>
              <p>
                <strong>Country:</strong> {user.country}
              </p>
              {user.language && (
                <p>
                  <strong>Language:</strong> {user.language}
                </p>
              )}
              {user.description && (
                <p className="mt-4 whitespace-pre-wrap">{user.description}</p>
              )}
            </div>
            <button className="mt-6 px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">
              Edit Profile
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-semibold mb-4 text-black">
              Preplanned Trips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {preplannedTrips.length === 0 && (
                <p className="text-black/70">No preplanned trips.</p>
              )}
              {preplannedTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="border border-black/10 rounded-lg p-4 bg-white/20 backdrop-blur-sm shadow-md"
                >
                  <h4 className="font-semibold mb-2 text-black">{trip.name || "Trip"}</h4>
                  <button
                    onClick={() => navigate(`/build-itinerary/${trip.id}`)}
                    className="mt-auto bg-black text-white rounded px-3 py-1 hover:bg-gray-800 transition"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 text-black">
              Previous Trips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {previousTrips.length === 0 && (
                <p className="text-black/70">No previous trips.</p>
              )}
              {previousTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="border border-black/10 rounded-lg p-4 bg-white/20 backdrop-blur-sm shadow-md text-black"
                >
                  <h4 className="font-semibold mb-2">{trip.name || "Trip"}</h4>
                  <button
                    onClick={() => navigate(`/build-itinerary/${trip.id}`)}
                    className="mt-auto bg-black text-white rounded px-3 py-1 hover:bg-gray-800 transition"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;