// controllers/trips.js
import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const GOOGLE_KEY = process.env.GOOGLE_KEY;
const GEOAPIFY_KEY = process.env.GEOAPIFY_KEY;
const genAI = new GoogleGenerativeAI(GOOGLE_KEY);

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
    // Validate tripId is a valid integer within INT4 range
    const parsedTripId = parseInt(tripId, 10);
    if (isNaN(parsedTripId) || parsedTripId < 1 || parsedTripId > 2147483647) {
      return res.status(400).json({ success: false, message: "Invalid trip ID" });
    }

    const trip = await prisma.trip.findFirst({
      where: {
        id: parsedTripId,
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

// Helper function to get coordinates for a city
async function getCityCoordinates(cityName, state, country) {
  try {
    const query = `${cityName}, ${state}, ${country}`;
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_KEY}`
    );
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const { lat, lon } = data.features[0].properties;
      return { lat, lon };
    }
    return { lat: 0, lon: 0 }; // fallback
  } catch (error) {
    console.error("Geocoding error:", error);
    return { lat: 0, lon: 0 };
  }
}

export async function planWithAI(req, res) {
  try {
    const { userPrompt } = req.body;
    const userId = req.user.userId;
    const {tripId} = req.params;
    
    // Validate input
    if (!userPrompt || userPrompt.trim() === '') {
      return res.status(400).json({ success: false, message: "User prompt is required" });
    }

    // 1️⃣ Get user profile
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, age: true, gender: true, city: true, country: true }
    });

    if (!userProfile) {
      return res.status(404).json({ success: false, message: "User profile not found" });
    }

    // 2️⃣ Get user's past trips (limit to recent ones for context)
    const pastTrips = await prisma.trip.findMany({
      where: { userId },
      take: 5, // Limit to avoid token overflow
      include: {
        stops: { 
          include: { 
            city: { 
              select: { name: true, state: true, country: true }
            } 
          } 
        },
        stopActivities: { 
          include: { 
            city: { select: { name: true } },
            activity: { select: { name: true, type: true } }
          } 
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // 3️⃣ Prepare structured instruction for Google AI
    const systemPrompt = `
You are a travel planner AI. You must respond with ONLY a valid JSON object matching the exact schema below.
Do not include any explanations, markdown formatting, or additional text.

USER CONTEXT:
- User Profile: Name: ${userProfile.firstName || 'Unknown'}, Age: ${userProfile.age || 'Unknown'}, Gender: ${userProfile.gender || 'Unknown'}, Location: ${userProfile.city || 'Unknown'}, ${userProfile.country || 'Unknown'}
- Past Trips Summary: ${pastTrips.length > 0 ? pastTrips.map(trip => `${trip.name} (${trip.stops?.map(s => s.city.name).join(', ')})`).join('; ') : 'No past trips'}
- Current Request: ${userPrompt}

REQUIRED JSON SCHEMA:
{
  "success": true,
  "trip": {
    "name": "string (descriptive trip name)",
    "startDate": "YYYY-MM-DDTHH:mm:ss.000Z",
    "endDate": "YYYY-MM-DDTHH:mm:ss.000Z", 
    "description": "string (trip overview)",
    "status": "UPCOMING",
    "stops": [
      {
        "stopIndex": 1,
        "cityName": "string",
        "stateName": "string", 
        "countryName": "string",
        "activities": [
          {
            "name": "string",
            "type": "entertainment|catering|commercial|leisure|building|cultural|nature|sports",
            "cost": 50,
            "durationMinutes": 120,
            "description": "string"
          }
        ]
      }
    ]
  }
}

RULES:
1. Plan for real cities and activities only
2. Include 2-5 cities with 3-5 activities each
3. Set realistic dates (start date should be at least 1 week from now)
4. Match suggestions to user profile and preferences
5. Use proper cost estimates in USD
6. Ensure all string fields have meaningful content
7. Activities should be diverse and engaging
8. Trip duration should match the number of stops (1-2 days per city)

Generate the JSON now:`;

    // 4️⃣ Ask Google Gemini to generate JSON plan
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000,
      }
    });

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    // 5️⃣ Parse and validate JSON
    let planData;
    try {
      // Clean the response text (remove potential markdown formatting)
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      planData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw AI Response:", responseText);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to parse AI response",
        debug: process.env.NODE_ENV === 'development' ? responseText : undefined
      });
    }

    // 6️⃣ Validate required structure
    if (!planData.success || !planData.trip || !Array.isArray(planData.trip.stops)) {
      return res.status(500).json({ 
        success: false, 
        message: "Invalid trip structure from AI"
      });
    }

    // 7️⃣ Save the trip to database using Prisma transaction
    const savedTrip = await prisma.$transaction(async (tx) => {
      // Create the main trip
      const createdTrip = await tx.trip.create({
        data: {
          userId: userId,
          name: planData.trip.name || "AI Generated Trip",
          startDate: new Date(planData.trip.startDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
          endDate: new Date(planData.trip.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
          description: planData.trip.description || "Generated by AI travel planner",
          coverPhoto: null,
          status: "UPCOMING"
        }
      });

      // Process each stop
      for (let i = 0; i < planData.trip.stops.length; i++) {
        const stopData = planData.trip.stops[i];
        
        // Get coordinates for the city
        const coords = await getCityCoordinates(
          stopData.cityName, 
          stopData.stateName, 
          stopData.countryName
        );

        // Create or find city
        let city = await tx.city.findFirst({
          where: {
            name: stopData.cityName,
            state: stopData.stateName,
            country: stopData.countryName
          }
        });

        if (!city) {
          city = await tx.city.create({
            data: {
              name: stopData.cityName,
              state: stopData.stateName,
              country: stopData.countryName,
              costIndex: 1.0,
              popularityScore: 8.0,
              landmark_img: `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${coords.lat},${coords.lon}&key=${GOOGLE_KEY}`
            }
          });
        }

        // Create stop
        await tx.stop.create({
          data: {
            tripId: createdTrip.id,
            cityId: city.id,
            stopIndex: i + 1
          }
        });

        // Create activities for this city
        if (stopData.activities && Array.isArray(stopData.activities)) {
          for (let j = 0; j < stopData.activities.length; j++) {
            const activityData = stopData.activities[j];
            
            // Create or find activity
            let activity = await tx.activity.findFirst({
              where: {
                name: activityData.name,
                cityId: city.id
              }
            });

            if (!activity) {
              activity = await tx.activity.create({
                data: {
                  cityId: city.id,
                  name: activityData.name || `Activity ${j + 1}`,
                  type: activityData.type || "leisure",
                  cost: activityData.cost || 25,
                  durationMinutes: activityData.durationMinutes || 120,
                  description: activityData.description || "Recommended activity",
                  imageUrl: `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${coords.lat},${coords.lon}&key=${GOOGLE_KEY}`
                }
              });
            }

            // Create stop activity relationship
            await tx.stopActivity.create({
              data: {
                tripId: createdTrip.id,
                cityId: city.id,
                activityId: activity.id,
                date: null,
                time: null,
                notes: null
              }
            });
          }
        }
      }

      return createdTrip;
    });

    // 8️⃣ Fetch the complete trip with all relationships
    const completeTripData = await prisma.trip.findUnique({
      where: { id: savedTrip.id },
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

    // 9️⃣ Send response with the saved trip
    res.json({
      success: true,
      trip: completeTripData,
      tripId: savedTrip.id
    });

  } catch (error) {
    console.error("PlanWithAI Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create trip plan",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Additional endpoint to save a planned trip (if you want to separate planning from saving)
export async function saveTripPlan(req, res) {
  try {
    const { tripData } = req.body;
    const userId = req.user.userId;

    if (!tripData) {
      return res.status(400).json({ success: false, message: "Trip data is required" });
    }

    // Use the same transaction logic as above to save the trip
    // This endpoint can be used if you want to plan first, then save later
    
    res.json({ success: true, message: "Trip saved successfully" });
  } catch (error) {
    console.error("Save Trip Error:", error);
    res.status(500).json({ success: false, message: "Failed to save trip" });
  }
}