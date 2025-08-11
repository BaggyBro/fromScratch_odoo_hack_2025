// controllers/search.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function searchCities(req, res) {
  const { tripId } = req.params;
  const { q } = req.query;

  if (!q) {
    return res.json([]);
  }

  try {
    const cities = await prisma.city.findMany({
      where: {
        name: { startsWith: q, mode: "insensitive" } // 👈 sequential search
      },
      take: 10,
      include: {
        activities: true
      }
    });

    res.json({
      tripId: parseInt(tripId, 10),
      results: cities
    });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: "Search failed" });
  }
}

export async function searchActivities(req, res) {
  const { tripId } = req.params;
  const { q } = req.query;

  if (!q) {
    return res.json([]);
  }

  try {
    const activities = await prisma.activity.findMany({
      where: {
        name: { startsWith: q, mode: "insensitive" } // 👈 sequential search
      },
      take: 10,
      include: {
        city: true
      }
    });

    res.json({
      tripId: parseInt(tripId, 10),
      results: activities
    });
  } catch (error) {
    console.error("Search Activities Error:", error);
    res.status(500).json({ error: "Search activities failed" });
  }
}

export async function addCityWithActivities(req, res) {
  const { tripId } = req.params;
  const { cityId, activities } = req.body;
  const userId = req.user.userId; 

  if (!cityId || !activities || !Array.isArray(activities) || activities.length === 0) {
    return res.status(400).json({ error: "City ID and at least one activity are required" });
  }

  try {
    const trip = await prisma.trip.findFirst({
      where: { id: parseInt(tripId), userId }
    });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found or you don't have access" });
    }

    const stopActivities = await prisma.stopActivity.createMany({
      data: activities.map(activityId => ({
        tripId: parseInt(tripId),
        cityId,
        activityId
      })),
      skipDuplicates: true 
    });

    res.status(201).json({
      message: "City and activities added to trip successfully",
      added: stopActivities.count
    });
  } catch (error) {
    console.error("Add City with Activities Error:", error);
    res.status(500).json({ error: "Failed to add city and activities" });
  }
}
