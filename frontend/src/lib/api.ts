import axios from 'axios';
import { CreateTripData, UpdateTripData, CreateBudgetData } from '@/types/trip';

const API_BASE_URL = 'http://localhost:3000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Trip API functions
export const tripAPI = {
  // Get trip by ID
  getTripById: async (tripId: string) => {
    console.log("API: Fetching trip with ID:", tripId);
    console.log("API: Request URL:", `${API_BASE_URL}/trips/${tripId}`);
    
    try {
      const response = await api.get(`/trips/${tripId}`);
      console.log("API: Response received:", response);
      console.log("API: Response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("API: Error in getTripById:", error);
      throw error;
    }
  },

  // Create new trip
  createTrip: async (tripData: CreateTripData) => {
    const response = await api.post('/trips/create', tripData);
    return response.data;
  },

  // AI Plan trip
  aiPlanTrip: async (tripId: string, prompt: string) => {
    const response = await api.post(`/trips/planai/${tripId}`, { userPrompt: prompt });
    return response.data;
  },

  // Get all trips for user
  getUserTrips: async () => {
    const response = await api.get('/trips/view');
    return response.data;
  },

  // Update trip
  updateTrip: async (tripId: string, tripData: UpdateTripData) => {
    const response = await api.put(`/trips/${tripId}`, tripData);
    return response.data;
  },

  // Delete trip
  deleteTrip: async (tripId: string) => {
    const response = await api.delete(`/trips/${tripId}`);
    return response.data;
  },
};

// City API functions
export const cityAPI = {
  // Search cities
  searchCities: async (query: string) => {
    const response = await api.get(`/cities/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get city activities
  getCityActivities: async (cityId: string) => {
    const response = await api.get(`/cities/${cityId}/activities`);
    return response.data;
  },
};

// Activity API functions
export const activityAPI = {
  // Search activities
  searchActivities: async (query: string) => {
    const response = await api.get(`/activities/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get activity details
  getActivityById: async (activityId: string) => {
    const response = await api.get(`/activities/${activityId}`);
    return response.data;
  },
};

// Budget API functions
export const budgetAPI = {
  // Create budget item
  createBudgetItem: async (tripId: string, budgetData: CreateBudgetData) => {
    const response = await api.post(`/trips/${tripId}/budgets`, budgetData);
    return response.data;
  },

  // Update budget item
  updateBudgetItem: async (budgetId: string, budgetData: Partial<CreateBudgetData>) => {
    const response = await api.put(`/budgets/${budgetId}`, budgetData);
    return response.data;
  },

  // Delete budget item
  deleteBudgetItem: async (budgetId: string) => {
    const response = await api.delete(`/budgets/${budgetId}`);
    return response.data;
  },
};

export default api; 