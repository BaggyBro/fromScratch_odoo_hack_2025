// controllers/trips.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getProfile(req, res) {
  const userId = req.user.userId; // from authenticate middleware

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        age: true,
        gender: true,
        city: true,
        country: true,
        email: true,
        language: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        profilePic: true,
        trips: {
          include: {
            stops: {
              include: { city: true }
            },
            stopActivities: {
              include: {
                activity: true,
                city: true
              }
            },
            budgets: true,
            suggestions: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Get Full Profile Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
}
