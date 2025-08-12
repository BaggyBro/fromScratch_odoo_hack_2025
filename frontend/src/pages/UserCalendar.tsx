import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CalendarEvent {
  title: string;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  tripId: number;
}

interface Trip {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
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

const UserCalendar = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [monthIndex, setMonthIndex] = useState<number>(today.getMonth());

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view this calendar",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
  }, [navigate, toast]);

  // Fetch trip data
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/trips/${tripId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setTrip(data.trip);
            // Convert trip to calendar event
            const tripEvent: CalendarEvent = {
              title: data.trip.name,
              start: data.trip.startDate.split('T')[0], // Extract date part
              end: data.trip.endDate.split('T')[0],
              tripId: data.trip.id
            };
            setEvents([tripEvent]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch trip:", error);
        toast({
          title: "Error",
          description: "Failed to load trip data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      fetchTrip();
    }
  }, [tripId, toast]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d3d3ff] mx-auto mb-4"></div>
          <p>Loading calendar...</p>
        </div>
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Trip Not Found</h1>
          <Button onClick={() => navigate("/community")}>
            Back to Community
          </Button>
        </div>
      </main>
    );
  }

  // Compute today's date string once for highlighting
  const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

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
          <h1 className="text-3xl font-bold mb-2 text-[#d3d3ff]">Trip Calendar</h1>
          <p className="text-[#d3d3ff]/80 mb-4">{trip.name}</p>
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => navigate(`/build-itinerary/${trip.id}`)}
              variant="outline"
              className="border-[#E6E6FA] text-white hover:bg-[#E6E6FA]/20"
            >
              View Itinerary
            </Button>
            <Button 
              onClick={() => navigate("/community")}
              variant="outline"
              className="border-[#E6E6FA] text-white hover:bg-[#E6E6FA]/20"
            >
              Back to Community
            </Button>
          </div>
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

                return (
                  <div key={idx} className={`${baseCell} ${cellVisual} ${hover}`}>
                    {cell.day && (
                      <div className={`absolute top-2 right-2 text-xs ${isToday ? "bg-[#6C63FF]/20 text-[#B993D6] font-semibold px-1.5 py-0.5 rounded" : "text-white/70"}`}>
                        {cell.day}
                      </div>
                    )}
                    {isShaded && (
                      <div className="mt-5 space-y-1">
                        {dateEvents.map((ev, i) => (
                          <div
                            key={i}
                            className="w-full truncate rounded-md bg-gradient-to-r from-[#6C63FF] to-[#B993D6] text-white text-[11px] font-medium px-1.5 py-1 shadow-sm border border-white/10 hover:shadow-md transition-shadow duration-150 cursor-pointer"
                            onClick={() => navigate(`/build-itinerary/${ev.tripId}`)}
                            title={`Click to view ${ev.title}`}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Trip Details */}
        <Card className="bg-black/60 border-[#E6E6FA]/50 max-w-3xl mx-auto mt-6 rounded-xl shadow-lg shadow-[#B993D6]/10">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-[#d3d3ff]">Trip Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80">
              <div>
                <p><strong>Start Date:</strong> {new Date(trip.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(trip.endDate).toLocaleDateString()}</p>
              </div>
              {trip.description && (
                <div>
                  <p><strong>Description:</strong></p>
                  <p className="text-sm mt-1">{trip.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default UserCalendar; 