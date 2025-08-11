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
