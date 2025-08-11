// controllers/itenaryScreen.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Get itinerary details for a specific trip
 * @route GET /trips/:tripId
 * @param {number} tripId - ID of the trip
 * @returns {Object} Trip with stops, cities, and budgets
 */
export async function getTripItinerary(req, res) {
  try {
    const { tripId } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id: Number(tripId) },
      include: {
        stops: {
          include: { city: true },
          orderBy: { stopIndex: "asc" },
        },
        budgets: true,
      },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    res.json(trip);
  } catch (error) {
    console.error("Error fetching trip itinerary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Delete one itinerary item by id or index and return the removed item
 * @route POST /trips/:tripId/itinerary/delete
 * @param {number} tripId - Trip ID in params
 * @body itemId?: string | number
 * @body index?: number
 */
export async function deleteItineraryItem(req, res) {
  try {
    const { tripId } = req.params;
    const { itemId, index } = req.body || {};

    if ((itemId === undefined || itemId === null || itemId === "") && (index === undefined || index === null)) {
      return res.status(400).json({ error: "itemId or index is required" });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: Number(tripId) },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const itinerary = Array.isArray(trip.itinerary) ? trip.itinerary : [];
    if (itinerary.length === 0) {
      return res.status(404).json({ error: "No itinerary found for this trip" });
    }

    let idxToRemove = -1;
    if (itemId !== undefined && itemId !== null && itemId !== "") {
      const itemIdStr = String(itemId);
      idxToRemove = itinerary.findIndex((it, idx) => {
        const candidates = [it?.id, it?._id, it?.key, it?.activityId, String(idx)].filter((v) => v !== undefined && v !== null);
        return candidates.map(String).includes(itemIdStr);
      });
    }

    if (idxToRemove < 0 && typeof index === "number" && Number.isInteger(index)) {
      idxToRemove = index;
    }

    if (idxToRemove < 0 || idxToRemove >= itinerary.length) {
      return res.status(404).json({ error: "Itinerary item not found" });
    }

    const removed = itinerary[idxToRemove];
    const updated = [...itinerary.slice(0, idxToRemove), ...itinerary.slice(idxToRemove + 1)];

    const updatedTrip = await prisma.trip.update({
      where: { id: Number(tripId) },
      data: { itinerary: updated },
    });

    return res.json({ success: true, removed, trip: updatedTrip });
  } catch (error) {
    console.error("Error deleting itinerary item:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
