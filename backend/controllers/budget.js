import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function updateActivityCost(req, res) {
  const { activityId, cost } = req.body;

  // Basic validation
  if (!activityId || typeof cost !== "number") {
    return res.status(400).json({ error: "Activity ID and cost (number) are required" });
  }

  try {
    // Check if activity exists
    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(activityId) },
    });

    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    // Update cost
    const updatedActivity = await prisma.activity.update({
      where: { id: activity.id },
      data: { cost },
    });

    res.status(200).json({
      message: "Activity cost updated successfully",
      activity: updatedActivity,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
