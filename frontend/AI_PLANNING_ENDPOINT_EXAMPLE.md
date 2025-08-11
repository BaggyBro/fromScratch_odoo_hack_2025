# AI Planning Endpoint Implementation Guide

## Endpoint: POST /trips/planai/:tripId

This endpoint should accept a trip ID in the URL path and a user prompt in the request body, then return a complete trip plan in the format shown below.

### Request URL:
```
POST /trips/planai/1754943427625
```

### Request Body:
```json
{
  "userPrompt": "I want to visit spiritual places, do yoga and meditation, explore local culture, and try adventure activities like rafting. Budget-friendly options preferred."
}
```

### Expected Response Format:
```json
{
  "success": true,
  "trip": {
    "id": 1754943427625,
    "userId": 15,
    "name": "Himalayan Solitude Retreat",
    "startDate": "2024-03-15T12:00:00.000Z",
    "endDate": "2024-03-19T12:00:00.000Z",
    "description": "A peaceful solo journey through the serene landscapes of the Himalayas, focusing on nature, meditation, and cultural exploration.",
    "coverPhoto": null,
    "status": "UPCOMING",
    "createdAt": "2025-08-11T20:11:33.253Z",
    "updatedAt": "2025-08-11T20:11:33.253Z",
    "stops": [
      {
        "tripId": 1754943427625,
        "cityId": 1754943821763,
        "stopIndex": 1,
        "city": {
          "id": 1754943821763,
          "name": "Rishikesh",
          "state": "Uttarakhand",
          "country": "India",
          "costIndex": 1,
          "popularityScore": 8,
          "landmark_img": "https://maps.googleapis.com/maps/api/streetview?size=600x400&location=30.1086537,78.2916193&key=YOUR_API_KEY",
          "activities": [
            {
              "id": 1754943195257,
              "cityId": 1754943821763,
              "name": "Yoga and Meditation Retreat",
              "type": "leisure",
              "cost": 75,
              "durationMinutes": 240,
              "description": "Participate in a rejuvenating yoga and meditation session overlooking the Ganges.",
              "imageUrl": "https://maps.googleapis.com/maps/api/streetview?size=600x400&location=30.1086537,78.2916193&key=YOUR_API_KEY"
            },
            {
              "id": 1754944016411,
              "cityId": 1754943821763,
              "name": "Ganges Aarti Ceremony",
              "type": "cultural",
              "cost": 10,
              "durationMinutes": 60,
              "description": "Witness the spiritual Ganges Aarti ceremony at sunset.",
              "imageUrl": "https://maps.googleapis.com/maps/api/streetview?size=600x400&location=30.1086537,78.2916193&key=YOUR_API_KEY"
            }
          ]
        }
      }
    ]
  },
  "tripId": 1754943427625
}
```

### Backend Implementation Steps:

1. **Extract tripId from URL path** and validate it exists
2. **Parse the user prompt** to extract:
   - Trip duration
   - Destination preferences
   - Activity interests
   - Budget constraints
   - Special requirements

3. **Generate trip details**:
   - Create a meaningful trip name
   - Set start and end dates based on duration
   - Write a descriptive summary

4. **Select appropriate cities** based on:
   - Geographic proximity
   - Activity availability
   - Cost considerations
   - Popularity scores

5. **Generate activities** for each city:
   - Match user interests
   - Consider budget constraints
   - Include variety of activity types
   - Set realistic costs and durations

6. **Update the existing trip** with the AI-generated content and return the complete trip object

### Error Response:
```json
{
  "success": false,
  "message": "Unable to generate trip plan. Please try again with more specific details."
}
```

### Authentication:
- Requires Bearer token in Authorization header
- User ID should be extracted from token for trip ownership
- Trip ID should belong to the authenticated user

### Notes:
- The response should be in the exact format shown above
- All IDs should be unique and properly formatted
- Dates should be in ISO 8601 format
- Costs should be realistic for the destination
- Activity types should match your existing categories (leisure, cultural, sports, etc.)
- The tripId in the response should match the tripId from the URL path 