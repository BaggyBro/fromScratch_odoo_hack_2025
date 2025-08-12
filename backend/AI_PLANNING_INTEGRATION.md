# AI Planning Integration Guide

## Overview

The AI planning feature allows users to generate complete trip itineraries using natural language prompts. The system uses Google's Generative AI (Gemini) to create personalized travel plans based on user preferences, past trips, and profile information.

## Backend Implementation

### Endpoint
```
POST /trips/planai/:tripId
```

### Request Format
```json
{
  "userPrompt": "I want to visit spiritual places, do yoga and meditation, explore local culture, and try adventure activities like rafting. Budget-friendly options preferred."
}
```

### Response Format
The response matches the exact structure used by the build-itinerary page:

```json
{
  "success": true,
  "trip": {
    "id": 123,
    "userId": 15,
    "name": "Himalayan Solitude Retreat",
    "startDate": "2024-03-15T12:00:00.000Z",
    "endDate": "2024-03-19T12:00:00.000Z",
    "description": "A peaceful journey through the serene landscapes of the Himalayas...",
    "coverPhoto": null,
    "status": "UPCOMING",
    "createdAt": "2025-01-11T20:11:33.253Z",
    "updatedAt": "2025-01-11T20:11:33.253Z",
    "stops": [
      {
        "tripId": 123,
        "cityId": 456,
        "stopIndex": 1,
        "city": {
          "id": 456,
          "name": "Rishikesh",
          "state": "Uttarakhand",
          "country": "India",
          "costIndex": 1,
          "popularityScore": 8,
          "landmark_img": "https://maps.googleapis.com/maps/api/streetview?...",
          "activities": [...]
        }
      }
    ],
    "stopActivities": [
      {
        "tripId": 123,
        "cityId": 456,
        "activityId": 789,
        "date": null,
        "time": null,
        "notes": null,
        "city": {...},
        "activity": {
          "id": 789,
          "cityId": 456,
          "name": "Yoga and Meditation Retreat",
          "type": "leisure",
          "cost": 75,
          "durationMinutes": 240,
          "description": "Participate in a rejuvenating yoga session...",
          "imageUrl": "https://maps.googleapis.com/maps/api/streetview?..."
        }
      }
    ],
    "budgets": [],
    "suggestions": []
  },
  "tripId": 123
}
```

## Frontend Integration

### API Function
The frontend already has the `aiPlanTrip` function in `src/lib/api.ts`:

```typescript
aiPlanTrip: async (tripId: string, prompt: string) => {
  const response = await api.post(`/trips/planai/${tripId}`, { userPrompt: prompt });
  return response.data;
}
```

### Usage in CreateTrip.tsx
The AI planning is integrated into the trip creation flow:

1. User creates a basic trip
2. System prompts for AI planning
3. User provides natural language description
4. AI generates complete itinerary
5. User is redirected to build-itinerary page

## Environment Variables

Set up the following environment variables in your `.env` file:

```env
# Google API Key (used for both Gemini AI and Google Maps)
GOOGLE_KEY=your_google_api_key_here

# Geoapify API Key (for city coordinates)
GEOAPIFY_KEY=your_geoapify_api_key_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here
```

## How It Works

### 1. Trip Validation
- Validates that the trip exists and belongs to the authenticated user
- Ensures the trip ID is valid

### 2. User Context Gathering
- Retrieves user profile (name, age, gender, location)
- Fetches recent past trips for context
- Uses existing trip details as base

### 3. AI Prompt Generation
The system creates a comprehensive prompt including:
- User profile information
- Past trip history
- Current trip details
- User's specific request

### 4. AI Response Processing
- Sends prompt to Google Gemini AI
- Parses and validates JSON response
- Cleans markdown formatting if present

### 5. Database Update
- Updates existing trip with AI-generated details
- Clears existing stops and activities
- Creates new cities and activities
- Links everything together

### 6. Response Formatting
- Returns complete trip object with all relationships
- Matches the exact format expected by build-itinerary page

## Error Handling

The system handles various error scenarios:

- **Invalid trip ID**: Returns 404 with appropriate message
- **Missing user prompt**: Returns 400 validation error
- **AI parsing errors**: Returns 500 with debug info in development
- **Database errors**: Returns 500 with generic error message

## Testing

Use the provided test script:

```bash
# 1. Set up environment variables
export GOOGLE_KEY="your_key"
export GEOAPIFY_KEY="your_key"

# 2. Start the backend server
npm start

# 3. Run the test (after getting a valid JWT token)
node test-ai-endpoint.js
```

## Key Features

1. **Natural Language Processing**: Users can describe their preferences in plain English
2. **Personalized Planning**: AI considers user profile and past trips
3. **Real-time Generation**: Complete itineraries generated instantly
4. **Seamless Integration**: Works with existing trip management system
5. **Error Recovery**: Graceful handling of AI failures
6. **Data Consistency**: Maintains referential integrity in database

## Security Considerations

- All endpoints require authentication
- Trip ownership is validated
- API keys are stored as environment variables
- User data is protected through JWT tokens

## Performance Notes

- AI responses are cached in memory during processing
- Database transactions ensure data consistency
- Image URLs are generated on-demand
- Coordinates are fetched only when needed

## Future Enhancements

1. **Response Caching**: Cache AI responses for similar prompts
2. **Batch Processing**: Handle multiple AI requests simultaneously
3. **Custom Models**: Train custom models for specific travel niches
4. **Real-time Updates**: WebSocket integration for live planning
5. **Multi-language Support**: Support for multiple languages in prompts 