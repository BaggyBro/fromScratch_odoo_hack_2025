import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import fetch from "node-fetch";

const GEOAPIFY_KEY = process.env.GEOAPIFY_KEY;;
const GOOGLE_KEY = process.env.GOOGLE_KEY;

// 🔹 Helper: Get Google Places photo final URL (follows redirect)
async function getGooglePhotoUrl(photoReference) {
  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_KEY}`;
  const resp = await fetch(photoUrl, { redirect: "manual" });
  const finalUrl = resp.headers.get("location");
  return finalUrl || photoUrl; // fallback to API URL
}

// 🔹 Helper: Get place_id from Google Places API
async function getPlaceId(placeName) {
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
    placeName
  )}&inputtype=textquery&fields=place_id&key=${GOOGLE_KEY}`;
  const resp = await fetch(url);
  const data = await resp.json();
  if (data.candidates && data.candidates.length > 0) {
    return data.candidates[0].place_id;
  }
  return null;
}

// 🔹 Helper: Get landmark photo URL using place_id
async function getPlacePhoto(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_KEY}`;
  const resp = await fetch(url);
  const data = await resp.json();
  if (data.result && data.result.photos && data.result.photos.length > 0) {
    const photoRef = data.result.photos[0].photo_reference;
    return await getGooglePhotoUrl(photoRef);
  }
  return null;
}

// 🔹 Combined helper: Get landmark photo URL by landmark name
async function getLandmarkPhotoGoogle(landmarkName) {
  const placeId = await getPlaceId(landmarkName);
  if (!placeId) return null;
  return await getPlacePhoto(placeId);
}

// 🔹 Helper: find or create city with landmark photo
async function findOrCreateCity(cityName, state = "", country = "") {
  let city = await prisma.city.findFirst({ where: { name: cityName } });

  if (!city) {
    // Try fetching landmark photo with a more descriptive query
    let landmarkImg =
      (await getLandmarkPhotoGoogle(`${cityName} famous landmark`)) ||
      (await getLandmarkPhotoGoogle(cityName));

    // Fallback to Street View if no landmark found
    if (!landmarkImg) {
      landmarkImg = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodeURIComponent(
        cityName
      )}&key=${GOOGLE_KEY}`;
    }

    city = await prisma.city.create({
      data: {
        name: cityName,
        state,
        country,
        costIndex: 0,
        popularityScore: 0,
        landmark_img: landmarkImg || "",
      },
    });
  }
  return city;
}

// 🔹 Helper: find or create activity
async function findOrCreateActivity(cityId, activityData) {
  let activity = await prisma.activity.findFirst({
    where: { cityId, name: activityData.name },
  });
  if (!activity) {
    activity = await prisma.activity.create({
      data: {
        cityId,
        name: activityData.name,
        type: Array.isArray(activityData.category)
          ? activityData.category[0]
          : "tourism",
        cost: 0,
        durationMinutes: 60,
        description: "",
        imageUrl: activityData.image || "",
      },
    });
  }
  return activity;
}

export async function fetchCityActivities(req, res) {
  const { city, categories } = req.body; // ⬅ now accepting categories from frontend

  if (!city) {
    return res.status(400).json({ error: "City parameter is required" });
  }

  try {
    // 1️⃣ Get city coordinates
    const geoResp = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        city
      )}&apiKey=${GEOAPIFY_KEY}`
    );
    const geoData = await geoResp.json();
    if (!geoData.features?.length) {
      return res.status(404).json({ error: "City not found" });
    }

    const [lon, lat] = geoData.features[0].geometry.coordinates;
    const delta = 0.1;
    const rect = `${lon - delta},${lat + delta},${lon + delta},${lat - delta}`;

    // 2️⃣ Use frontend-provided categories or fallback
    const categoryString = Array.isArray(categories)
      ? categories.join(",")
      : categories || "tourism,entertainment,leisure,national_park,commercial.food_and_drink";

    // 3️⃣ Fetch activities with dynamic filters
    const placesResp = await fetch(
      `https://api.geoapify.com/v2/places?categories=${encodeURIComponent(categoryString)}&filter=rect:${rect}&limit=20&apiKey=${GEOAPIFY_KEY}`
    );
    const placesData = await placesResp.json();

    if (!placesData.features?.length) {
      return res.status(404).json({ error: "No activities found for this city" });
    }

    // 4️⃣ Format results
    const activities = placesData.features.map((place) => {
      const coords = place.geometry.coordinates;
      return {
        name: place.properties.name || "Unknown Location",
        category: place.properties.categories,
        address: place.properties.address_line2 || place.properties.formatted,
        coordinates: coords,
        image: `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${coords[1]},${coords[0]}&key=${GOOGLE_KEY}`,
      };
    });

    res.status(200).json({
      city: city,
      activities,
      count: activities.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}


export async function saveSelectedCityActivities(req, res) {
  const { city, state = "", country = "", selectedActivities } = req.body;
  const { tripId } = req.params;
  const userId = req.user.userId;

  if (!city || !Array.isArray(selectedActivities) || selectedActivities.length === 0) {
    return res
      .status(400)
      .json({ error: "City and selected activities are required" });
  }

  try {
    // 1️⃣ Validate trip ownership
    const trip = await prisma.trip.findFirst({
      where: { id: parseInt(tripId), userId },
    });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found or unauthorized" });
    }

    // 2️⃣ Save city
    const dbCity = await findOrCreateCity(city, state, country);

    // 3️⃣ Link city to trip
    await prisma.tripsTo.upsert({
      where: { tripId_cityId: { tripId: trip.id, cityId: dbCity.id } },
      update: {},
      create: { tripId: trip.id, cityId: dbCity.id, stopIndex: 0 },
    });

    // 4️⃣ Save ONLY the selected activities
    const savedActivities = [];
    for (const act of selectedActivities) {
      const activity = await findOrCreateActivity(dbCity.id, act);
      savedActivities.push(activity);
    }

    // 5️⃣ Link only selected activities to trip stops
    await prisma.stopActivity.createMany({
      data: savedActivities.map((activity) => ({
        tripId: trip.id,
        cityId: dbCity.id,
        activityId: activity.id,
      })),
      skipDuplicates: true,
    });

    res.status(201).json({
      message: "City and selected activities saved successfully",
      city: dbCity,
      activities: savedActivities,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
