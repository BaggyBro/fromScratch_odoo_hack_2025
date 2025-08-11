// controllers/trips.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function viewTrips(req, res) {
  const userId = req.user.userId; // From authenticate middleware

  try {
    const trips = await prisma.trip.findMany({
      where: { userId },
      include: {
        stops: {
          include: {
            city: true
          }
        },
        stopActivities: {
          include: {
            city: true,
            activity: true
          }
        },
        budgets: true,
        suggestions: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ success: true, trips });
  } catch (error) {
    console.error("View Trips Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch trips" });
  }
}


export async function getTripById(req, res) {
  const { tripId } = req.params;
  const userId = req.user.userId; // from authenticate middleware

  try {
    const trip = await prisma.trip.findFirst({
      where: {
        id: parseInt(tripId, 10),
        userId: userId
      },
      include: {
        stops: {
          include: {
            city: {
              include: { activities: true }
            }
          }
        },
        stopActivities: {
          include: {
            city: true,
            activity: true
          }
        },
        budgets: true,
        suggestions: true
      }
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found or access denied" });
    }

    res.status(200).json({ success: true, trip });
  } catch (error) {
    console.error("Get Trip Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch trip details" });
  }
}