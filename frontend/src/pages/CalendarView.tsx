import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CalendarEvent {
  title: string;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getFirstDayWeekIndex(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1).getDay();
}

const monthNames = [
  "January","February","March","April","May","June","July","August","September","October","November","December"
];
const weekdayShort = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

const sampleEvents: CalendarEvent[] = [
  { title: "PARIS TRIP", start: "2024-01-09", end: "2024-01-12" },
  { title: "5ARIS 10", start: "2024-01-15", end: "2024-01-22" },
  { title: "JAPAN ADVENTURE", start: "2024-01-16", end: "2024-01-19" },
  { title: "NYC - GETAWAY", start: "2024-01-21", end: "2024-01-23" },
  { title: "NYC GETAWAY", start: "2024-01-28", end: "2024-01-28" },
];

const CalendarView = () => {
  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [monthIndex, setMonthIndex] = useState<number>(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [userTrips, setUserTrips] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadTripsFromLocalStorage = () => {
    try {
      const raw = localStorage.getItem("trips");
      const storedTrips = raw ? JSON.parse(raw) : [];
      const normalizedTrips: CalendarEvent[] = (Array.isArray(storedTrips) ? storedTrips : []).map((t: any) => ({
        title: t.title || t.name || "Untitled Trip",
        start: t.start || t.startDate,
        end: t.end || t.endDate,
      })).filter((t: CalendarEvent) => Boolean(t.start && t.end));

      setEvents([
        ...sampleEvents,
        ...normalizedTrips,
      ]);
    } catch {
      setEvents([...sampleEvents]);
    }
  };

  // Load user-specific trips from backend
  const loadUserTrips = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user.trips) {
          const userTripEvents: CalendarEvent[] = data.user.trips.map((trip: any) => ({
            title: trip.name || "Untitled Trip",
            start: trip.startDate ? trip.startDate.split('T')[0] : '',
            end: trip.endDate ? trip.endDate.split('T')[0] : '',
          })).filter((trip: CalendarEvent) => Boolean(trip.start && trip.end));

          setUserTrips(data.user.trips);
          setEvents([...sampleEvents, ...userTripEvents]);
        }
      }
    } catch (error) {
      console.error("Failed to load user trips:", error);
    }
  };

  // Compute today's date string once for highlighting
  const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  // Always load trips from localStorage and combine with sample events
  useEffect(() => {
    loadTripsFromLocalStorage();
    if (isAuthenticated) {
      loadUserTrips(); // Load user-specific trips only if authenticated
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "trips") {
        loadTripsFromLocalStorage();
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", () => {
      loadTripsFromLocalStorage();
      if (isAuthenticated) {
        loadUserTrips();
      }
    });

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", loadTripsFromLocalStorage);
    };
  }, [isAuthenticated]);

  const daysInMonth = getDaysInMonth(year, monthIndex);
  const firstWeekIndex = getFirstDayWeekIndex(year, monthIndex);

  const cells: Array<{ day?: number; dateStr?: string }> = [];
  for (let i = 0; i < firstWeekIndex; i++) cells.push({});
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(monthIndex + 1).padStart(2, "0");
    const dayStr = String(d).padStart(2, "0");
    cells.push({ day: d, dateStr: `${year}-${monthStr}-${dayStr}` });
  }

  const onPrev = () => {
    const newMonth = monthIndex - 1;
    if (newMonth < 0) {
      setMonthIndex(11);
      setYear((y) => y - 1);
    } else setMonthIndex(newMonth);
  };

  const onNext = () => {
    const newMonth = monthIndex + 1;
    if (newMonth > 11) {
      setMonthIndex(0);
      setYear((y) => y + 1);
    } else setMonthIndex(newMonth);
  };

  const onToday = () => {
    setYear(today.getFullYear());
    setMonthIndex(today.getMonth());
  };

  const isWithinEvent = (dateStr: string, event: CalendarEvent) => {
    return dateStr >= event.start && dateStr <= event.end;
  };

  const eventsForDate = (dateStr?: string) => {
    if (!dateStr) return [] as CalendarEvent[];
    return events.filter((e) => isWithinEvent(dateStr, e));
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2 text-[#d3d3ff]">My Travel Calendar</h1>
          <p className="text-[#d3d3ff]/80">View all your planned trips and adventures</p>
        </div>

        <div className="flex items-center justify-between max-w-3xl mx-auto mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-[#E6E6FA] text-white hover:bg-[#E6E6FA]/20" onClick={onPrev}>
              ←
            </Button>
            <Button variant="outline" className="border-[#E6E6FA] text-white hover:bg-[#E6E6FA]/20" onClick={onToday}>
              Today
            </Button>
            <Button variant="outline" className="border-[#E6E6FA] text-white hover:bg-[#E6E6FA]/20" onClick={onNext}>
              →
            </Button>
          </div>
          <div className="text-2xl font-semibold">{monthNames[monthIndex]} {year}</div>
          <div className="w-[92px]" />
        </div>

        <Card className="bg-black/60 border-[#E6E6FA]/50 max-w-3xl mx-auto rounded-xl shadow-lg shadow-[#B993D6]/10">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 text-center text-xs border-b border-[#E6E6FA]/40">
              {weekdayShort.map((wd, i) => (
                <div
                  key={wd}
                  className={`py-3 ${i === 0 || i === 6 ? "text-[#E6E6FA]" : "text-white/80"}`}
                >
                  {wd}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0 p-0 border-l border-white/20 border-t border-white">
              {cells.map((cell, idx) => {
                const dateEvents = eventsForDate(cell.dateStr);
                const isShaded = dateEvents.length > 0;
                const dow = idx % 7; // 0: Sun, 6: Sat
                const isWeekend = dow === 0 || dow === 6;
                const isToday = cell.dateStr === todayDateStr;

                const baseCell = "relative min-h-[100px] p-2 sm:p-3 border-r border-white/20 border-b border-white/20 transition-colors";
                const cellVisual = isToday
                  ? "ring-1 ring-[#B993D6] bg-white/[0.04]"
                  : isWeekend
                  ? "bg-white/[0.02]"
                  : "bg-black";

                const hover = "hover:bg-white/[0.06]";

                const maxChips = 3;
                const extraCount = Math.max(0, dateEvents.length - maxChips);
                const visibleEvents = dateEvents.slice(0, maxChips);

                return (
                  <div key={idx} className={`${baseCell} ${cellVisual} ${hover}`}>
                    {cell.day && (
                      <div className={`absolute top-2 right-2 text-xs ${isToday ? "bg-[#6C63FF]/20 text-[#B993D6] font-semibold px-1.5 py-0.5 rounded" : "text-white/70"}`}>
                        {cell.day}
                      </div>
                    )}
                    {isShaded && (
                      <div className="mt-5 space-y-1">
                        {visibleEvents.map((ev, i) => (
                          <div
                            key={i}
                            className="w-full truncate rounded-md bg-gradient-to-r from-[#6C63FF] to-[#B993D6] text-white text-[11px] font-medium px-1.5 py-1 shadow-sm border border-white/10 hover:shadow-md transition-shadow duration-150"
                          >
                            {ev.title}
                          </div>
                        ))}
                        {extraCount > 0 && (
                          <div className="w-full truncate rounded-md bg-white/5 text-white/70 text-[10px] px-1.5 py-0.5 border border-white/10">
                            +{extraCount} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* User Trips Section */}
        {userTrips.length > 0 && (
          <Card className="bg-black/60 border-[#E6E6FA]/50 max-w-3xl mx-auto mt-6 rounded-xl shadow-lg shadow-[#B993D6]/10">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-[#d3d3ff]">My Trips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userTrips.map((trip: any) => (
                  <div key={trip.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <h4 className="font-semibold text-white mb-2">{trip.name}</h4>
                    <p className="text-white/80 text-sm">
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </p>
                    {trip.description && (
                      <p className="text-white/60 text-sm mt-2">{trip.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
};

export default CalendarView;