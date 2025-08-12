import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const TripDetails = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrip = async () => {
      if (!tripId) return;
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/trips/${tripId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrip(res.data?.trip || res.data);
      } catch (err) {
        console.error("Error loading trip:", err);
        setError("Failed to load trip details.");
      }
      setLoading(false);
    };
    fetchTrip();
  }, [tripId]);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "");

  const getCurrencyCode = (t) => t?.currency || t?.currencyCode || t?.budget?.currency;
  const getCurrencySymbol = (t) => t?.currencySymbol || t?.budget?.currencySymbol || t?.symbol;

  const extractFirstNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value !== "string") return NaN;
    const cleaned = value.replace(/[\,\s]/g, "");
    const match = cleaned.match(/-?\d+(?:\.\d+)?/);
    return match ? parseFloat(match[0]) : NaN;
  };
  const coerceNum = (v) => {
    if (typeof v === "number") return isFinite(v) ? v : NaN;
    if (typeof v === "string") return extractFirstNumber(v);
    return NaN;
  };

  const numericKeys = [
    "total","amount","cost","price","value","estimatedCost","estimatedAmount","budget","estimatedBudget"
  ];

  const sumFromObject = (obj) => {
    if (!obj || typeof obj !== "object") return 0;
    let sum = 0;
    for (const key of numericKeys) {
      if (obj[key] !== undefined) {
        const n = coerceNum(obj[key]);
        if (!isNaN(n)) sum += n;
      }
    }
    // Common nested containers
    const nestedArrays = [
      obj.items,
      obj.sections,
      obj.activities,
      obj.days,
      obj.entries,
      obj.expenses,
      obj.costs,
      obj.list,
    ].filter(Array.isArray);
    for (const arr of nestedArrays) {
      for (const it of arr) sum += sumFromObject(it);
    }
    return sum;
  };

  const computeTripTotal = (t) => {
    if (!t) return null;
    let total = 0;

    // Top-level arrays/sections
    const arrays = [
      t.itinerary,
      t.sections,
      t.expenses,
      t.costs,
      t.budgetSections,
      t?.budget?.sections,
    ].filter(Array.isArray);
    for (const arr of arrays) {
      for (const item of arr) total += sumFromObject(item);
    }

    // Common category keys that may be arrays/objects or numeric
    const keys = [
      "accommodation","hotels","lodging","transport","flights","localTransport","food","meals","activities","sightseeing","tickets","misc","other","shopping"
    ];
    for (const key of keys) {
      const val = t?.budget?.[key] ?? t?.[key];
      if (Array.isArray(val)) {
        for (const item of val) total += sumFromObject(item);
      } else if (val && typeof val === "object") {
        total += sumFromObject(val);
      } else {
        const n = coerceNum(val);
        if (!isNaN(n)) total += n;
      }
    }

    // Fallback: sum numeric-like fields directly on trip if sections were empty
    if (total === 0) {
      for (const key of numericKeys) {
        const n = coerceNum(t[key]);
        if (!isNaN(n)) total += n;
      }
    }

    return total > 0 ? total : null;
  };

  const formatTripAmount = (t) => {
    const raw = computeTripTotal(t);
    if (raw === null) return "";
    const currency = getCurrencyCode(t);
    if (currency) {
      try {
        return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(raw);
      } catch {}
    }
    const symbol = getCurrencySymbol(t);
    const formatted = new Intl.NumberFormat().format(raw);
    return symbol ? `${symbol}${formatted}` : formatted;
  };

  const amountDisplay = formatTripAmount(trip);

  const handleDeleteItem = async (item, idx) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`/trips/${tripId}/itinerary/delete`, {
        itemId: item?.id,
        index: idx,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrip((prev) => ({
        ...prev,
        itinerary: (prev?.itinerary || []).filter((_, i) => i !== idx),
      }));
    } catch (err) {
      console.error("Failed to delete activity:", err);
      setError("Failed to delete activity.");
    }
  };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#D3D3FF]">Trip Details</h1>
          <Button variant="outline" onClick={() => navigate(-1)} className="border-[#E6E6FA]/40 hover:bg-[#E6E6FA]/10">
            Back
          </Button>
        </div>

        {loading && <p className="text-white/80">Loading...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && !error && trip && (
          <Card className="bg-[#D3D3FF] text-black">
            <CardHeader>
              <CardTitle>
                {amountDisplay ? (
                  <span>{amountDisplay} · {trip.name}</span>
                ) : (
                  <span>{trip.name}</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-sm text-black/80">
                <div>Start: {formatDate(trip.startDate)}</div>
                <div>End: {formatDate(trip.endDate)}</div>
              </div>

              {/* Itinerary outline if available */}
              {Array.isArray(trip.itinerary) && trip.itinerary.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="font-semibold text-base">Itinerary</h2>
                  <div className="space-y-2">
                    {trip.itinerary.map((item, idx) => (
                      <div key={idx} className="rounded border border-black/10 bg-white/60 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium">
                              {item.title || item.activity || `Item ${idx + 1}`}
                            </div>
                            {item.date && (
                              <div className="text-xs text-black/70">{formatDate(item.date)}</div>
                            )}
                            {item.notes && (
                              <div className="text-xs text-black/70 mt-1 whitespace-pre-wrap">{item.notes}</div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteItem(item, idx)}
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-black/70">No itinerary items found.</div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
};

export default TripDetails; 