// controllers/trip.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createTrip = async (req, res) => {
  try {
    const { name, startDate, endDate, description } = req.body;

    // Get the logged-in user's ID from auth middleware
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create the trip
    const newTrip = await prisma.trip.create({
      data: {
        userId,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description
      }
    });

    // Return success + trip ID
    return res.status(201).json({
      message: "Trip created successfully",
      tripId: newTrip.id, // return trip id
      trip: newTrip
    });
  } catch (error) {
    console.error("Error creating trip:", error);
    return res.status(500).json({ error: "Failed to create trip" });
  }
};
