import React, { useState } from "react";

export default function PlanItinerary() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [interests, setInterests] = useState("");
  const [itinerary, setItinerary] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePlan = async () => {
    setLoading(true);
    setItinerary("");
    try {
      const res = await fetch("http://localhost:8000/plan-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, days, interests }),
      });

      const data = await res.json();
      if (data.itinerary) {
        setItinerary(data.itinerary);
      } else {
        setItinerary("Error: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      setItinerary("Failed to fetch itinerary. Is the backend running?");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Trip Planner</h1>
      <input
        placeholder="Destination"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      <input
        type="number"
        placeholder="Days"
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
      />
      <input
        placeholder="Interests"
        value={interests}
        onChange={(e) => setInterests(e.target.value)}
      />
      <button onClick={handlePlan} disabled={loading}>
        {loading ? "Planning..." : "Plan Trip"}
      </button>

      {itinerary && (
        <pre
          style={{ marginTop: "20px", background: "#f5f5f5", padding: "10px" }}
        >
          {itinerary}
        </pre>
      )}
    </div>
  );
}
