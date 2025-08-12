import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import CreateTrip from "./pages/CreateTrip";
import BuildItinerary from "./pages/BuildItinerary";
import ItineraryView from "./pages/ItineraryView";
import Itinerary from "./pages/Itinerary";
import CitySearch from "./pages/CitySearch";
import ActivitySearch from "./pages/ActivitySearch";
import Budget from "./pages/Budget";
import CalendarView from "./pages/CalendarView";
import UserCalendar from "./pages/UserCalendar";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AdminLogin from "./pages/auth/AdminLogin";
import AdminSignup from "./pages/auth/AdminSignup";
import Community from "./pages/Community";
import PlanItinerary from "./pages/PlanItinerary";
import axios from "axios";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/community" element={<Community />} />
          <Route path="/create-trip" element={<CreateTrip />} />
          <Route path="/mytrips" element={<Dashboard />} />
          <Route path="/plan-itinerary" element={<PlanItinerary />} />
          <Route path="/build-itinerary/:tripId" element={<BuildItinerary />} />
          <Route path="/itinerary" element={<ItineraryView />} />
          <Route path="/itinerary/:place" element={<Itinerary />} />
          <Route path="/city-search" element={<CitySearch />} />
          <Route path="/activity-search/:tripId" element={<ActivitySearch />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/calendar/:tripId" element={<UserCalendar />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-signup" element={<AdminSignup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
