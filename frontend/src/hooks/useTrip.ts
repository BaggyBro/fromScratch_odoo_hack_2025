import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI } from '@/lib/api';
import { Trip, UpdateTripData } from '@/types/trip';

export const useTrip = (tripId: string | undefined) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrip = async () => {
      if (!tripId) return;

      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching trip with ID:", tripId);
        const response = await tripAPI.getTripById(tripId);
        console.log("Trip API response:", response);
        
        if (response.success) {
          setTrip(response.trip);
          console.log("Trip data set:", response.trip);
        } else {
          setError("Failed to fetch trip details");
          console.error("API returned error:", response);
        }
      } catch (error: any) {
        console.error("Error fetching trip:", error);
        if (error.response?.status === 404) {
          setError("Trip not found or access denied");
        } else {
          setError("Failed to fetch trip details");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  const refetchTrip = async () => {
    if (!tripId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await tripAPI.getTripById(tripId);
      
      if (response.success) {
        setTrip(response.trip);
      } else {
        setError("Failed to fetch trip details");
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError("Trip not found or access denied");
      } else {
        setError("Failed to fetch trip details");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateTrip = async (tripData: UpdateTripData) => {
    if (!tripId) return false;
    
    try {
      const response = await tripAPI.updateTrip(tripId, tripData);
      
      if (response.success) {
        await refetchTrip();
        return true;
      } else {
        setError("Failed to update trip");
        return false;
      }
    } catch (error: any) {
      setError("Failed to update trip");
      return false;
    }
  };

  const deleteTrip = async () => {
    if (!tripId) return false;
    
    try {
      const response = await tripAPI.deleteTrip(tripId);
      
      if (response.success) {
        navigate('/my-trips');
        return true;
      } else {
        setError("Failed to delete trip");
        return false;
      }
    } catch (error: any) {
      setError("Failed to delete trip");
      return false;
    }
  };

  return {
    trip,
    loading,
    error,
    refetchTrip,
    updateTrip,
    deleteTrip,
  };
}; 