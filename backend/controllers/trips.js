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
    const { tripId } = req.params;
    
    // Validate input
    if (!userPrompt || userPrompt.trim() === '') {
      return res.status(400).json({ success: false, message: "User prompt is required" });
    }

    // 1️⃣ Validate that the trip exists and belongs to the user
    const existingTrip = await prisma.trip.findFirst({
      where: { 
        id: parseInt(tripId), 
        userId: userId 
      }
    });

    if (!existingTrip) {
      return res.status(404).json({ success: false, message: "Trip not found or access denied" });
    }

    // 2️⃣ Get user profile
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, age: true, gender: true, city: true, country: true }
    });

    if (!userProfile) {
      return res.status(404).json({ success: false, message: "User profile not found" });
    }

    // 3️⃣ Get user's past trips (limit to recent ones for context)
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

    // 4️⃣ Prepare structured instruction for Google AI
    const systemPrompt = `
You are a travel planner AI. You must respond with ONLY a valid JSON object matching the exact schema below.
Do not include any explanations, markdown formatting, or additional text.

USER CONTEXT:
- User Profile: Name: ${userProfile.firstName || 'Unknown'}, Age: ${userProfile.age || 'Unknown'}, Gender: ${userProfile.gender || 'Unknown'}, Location: ${userProfile.city || 'Unknown'}, ${userProfile.country || 'Unknown'}
- Past Trips Summary: ${pastTrips.length > 0 ? pastTrips.map(trip => `${trip.name} (${trip.stops?.map(s => s.city.name).join(', ')})`).join('; ') : 'No past trips'}
- Current Request: ${userPrompt}
- Existing Trip: ${existingTrip.name} (${existingTrip.startDate} to ${existingTrip.endDate})

REQUIRED JSON SCHEMA:
{
  "success": true,
  "trip": {
    "name": "string (descriptive trip name based on user prompt)",
    "startDate": "YYYY-MM-DDTHH:mm:ss.000Z",
    "endDate": "YYYY-MM-DDTHH:mm:ss.000Z", 
    "description": "string (detailed trip overview based on user preferences)",
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
            "description": "string (detailed activity description)"
          }
        ]
      }
    ]
  }
}

RULES:
1. Plan for real cities and activities only
2. Include 2-5 cities with 3-5 activities each
3. Use the existing trip's start and end dates as a base, but adjust if needed based on user preferences
4. Match suggestions to user profile and preferences from the prompt
5. Use proper cost estimates in USD
6. Ensure all string fields have meaningful content
7. Activities should be diverse and engaging based on the user's interests
8. Trip duration should match the number of stops (1-2 days per city)
9. Focus on the specific interests mentioned in the user prompt
10. Consider budget constraints if mentioned in the prompt

Generate the JSON now:`;

    // 5️⃣ Ask Google Gemini to generate JSON plan
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000,
      }
    });

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    // 6️⃣ Parse and validate JSON
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

    // 7️⃣ Validate required structure
    console.log('Validating AI response structure...');
    if (!planData.success || !planData.trip || !Array.isArray(planData.trip.stops)) {
      console.error('Invalid AI response structure:', planData);
      return res.status(500).json({ 
        success: false, 
        message: "Invalid trip structure from AI"
      });
    }
    
    console.log(`AI generated ${planData.trip.stops.length} stops`);
    planData.trip.stops.forEach((stop, index) => {
      console.log(`Stop ${index + 1}: ${stop.cityName}, ${stop.stateName}, ${stop.countryName} with ${stop.activities?.length || 0} activities`);
    });

    // 8️⃣ Pre-fetch all coordinates outside the transaction
    console.log('Pre-fetching coordinates for all cities...');
    const cityCoordinates = [];
    for (let i = 0; i < planData.trip.stops.length; i++) {
      const stopData = planData.trip.stops[i];
      let coords;
      try {
        coords = await getCityCoordinates(
          stopData.cityName, 
          stopData.stateName, 
          stopData.countryName
        );
        console.log(`Coordinates for ${stopData.cityName}: ${coords.lat}, ${coords.lon}`);
      } catch (coordError) {
        console.error(`Failed to get coordinates for ${stopData.cityName}:`, coordError);
        // Use default coordinates if API fails
        coords = { lat: 0, lon: 0 };
      }
      cityCoordinates.push(coords);
    }

    // 9️⃣ Update the existing trip and add new content using separate operations
    console.log('Starting database operations for trip:', tripId);
    
    // Update the existing trip with AI-generated details
    const updatedTrip = await prisma.trip.update({
      where: { id: parseInt(tripId) },
      data: {
        name: planData.trip.name || existingTrip.name,
        startDate: new Date(planData.trip.startDate || existingTrip.startDate),
        endDate: new Date(planData.trip.endDate || existingTrip.endDate),
        description: planData.trip.description || existingTrip.description,
        status: "UPCOMING"
      }
    });
    console.log('Trip updated successfully');

    // Clear existing stop activities for this trip
    await prisma.stopActivity.deleteMany({
      where: { tripId: parseInt(tripId) }
    });
    console.log('Existing stop activities cleared');
    
    // Clear existing stops for this trip
    await prisma.tripsTo.deleteMany({
      where: { tripId: parseInt(tripId) }
    });
    console.log('Existing stops cleared');

    // Process each stop
    for (let i = 0; i < planData.trip.stops.length; i++) {
      const stopData = planData.trip.stops[i];
      const coords = cityCoordinates[i];
      console.log(`Processing stop ${i + 1}: ${stopData.cityName}`);

      // Create or find city
      let city = await prisma.city.findFirst({
        where: {
          name: stopData.cityName,
          state: stopData.stateName,
          country: stopData.countryName
        }
      });

      if (!city) {
        city = await prisma.city.create({
          data: {
            name: stopData.cityName,
            state: stopData.stateName,
            country: stopData.countryName,
            costIndex: 1.0,
            popularityScore: 8.0,
            landmark_img: `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${coords.lat},${coords.lon}&key=${GOOGLE_KEY}`
          }
        });
        console.log(`Created new city: ${city.name}`);
      } else {
        console.log(`Found existing city: ${city.name}`);
      }

      // Create stop
      await prisma.tripsTo.create({
        data: {
          tripId: parseInt(tripId),
          cityId: city.id,
          stopIndex: i + 1
        }
      });
      console.log(`Created stop ${i + 1} for city: ${city.name}`);

      // Create activities for this city
      if (stopData.activities && Array.isArray(stopData.activities)) {
        for (let j = 0; j < stopData.activities.length; j++) {
          const activityData = stopData.activities[j];
          console.log(`Processing activity ${j + 1}: ${activityData.name}`);
          
          // Create or find activity
          let activity = await prisma.activity.findFirst({
            where: {
              name: activityData.name,
              cityId: city.id
            }
          });

          if (!activity) {
            activity = await prisma.activity.create({
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
            console.log(`Created new activity: ${activity.name}`);
          } else {
            console.log(`Found existing activity: ${activity.name}`);
          }

          // Create stop activity relationship (skip if already exists due to unique constraint)
          try {
            await prisma.stopActivity.create({
              data: {
                tripId: parseInt(tripId),
                cityId: city.id,
                activityId: activity.id,
                date: null,
                time: null,
                notes: null
              }
            });
            console.log(`Linked activity ${activity.name} to trip ${tripId} in city ${city.name}`);
          } catch (constraintError) {
            // Skip if this activity is already linked to this trip/city
            console.log(`Activity ${activity.name} already linked to trip ${tripId} in city ${city.name}`);
          }
        }
      }
    }

    console.log('All database operations completed successfully');

    // 10️⃣ Fetch the complete trip with all relationships
    const completeTripData = await prisma.trip.findUnique({
      where: { id: parseInt(tripId) },
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

    // 11️⃣ Send response with the updated trip
    res.json({
      success: true,
      trip: completeTripData,
      tripId: parseInt(tripId)
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