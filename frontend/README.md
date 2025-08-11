# Lavender Canvas - Travel Planning App

A modern travel planning application built with React, TypeScript, and Tailwind CSS.

## Features

### Trip Management
- **Create Trips**: Plan new trips with name, dates, and description
- **Build Itinerary**: View and manage trip details after creation
- **Trip Overview**: Comprehensive display of trip information including:
  - Trip details (name, description, dates)
  - Destinations and stops
  - Planned activities
  - Budget breakdown
  - Travel suggestions

### Architecture

#### Frontend Structure
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/ui** components for consistent UI
- **React Router** for navigation
- **Axios** for API communication

#### Key Components
- `BuildItinerary`: Displays trip information fetched from backend
- `CreateTrip`: Creates new trips and redirects to itinerary builder
- `useTrip`: Custom hook for trip data management
- `tripAPI`: Centralized API service for trip operations

#### API Integration
The frontend integrates with the backend API endpoints:

- `GET /trips/:tripId` - Fetch trip details
- `POST /trips/create` - Create new trip
- `GET /trips` - Get user's trips
- `PUT /trips/:tripId` - Update trip
- `DELETE /trips/:tripId` - Delete trip

#### Data Flow
1. User creates a trip via `CreateTrip` component
2. Backend returns `tripId` in response
3. User is redirected to `/build-itinerary/:tripId`
4. `BuildItinerary` component fetches trip data using the `useTrip` hook
5. Trip information is displayed in a comprehensive layout

#### Type Safety
- Shared TypeScript interfaces in `src/types/trip.ts`
- Consistent typing across components and API calls
- Proper error handling and loading states

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and API services
├── pages/              # Page components
├── types/              # TypeScript type definitions
└── App.tsx            # Main application component
```

## Key Routes

- `/create-trip` - Create a new trip
- `/build-itinerary/:tripId` - View and manage trip itinerary
- `/my-trips` - List user's trips
- `/dashboard` - User dashboard

## Backend Integration

The application expects a backend API running on `http://localhost:3000` with the following structure:

- Authentication via JWT tokens
- Trip CRUD operations
- City and activity management
- Budget tracking
- User management

## Contributing

1. Follow TypeScript best practices
2. Use the established component patterns
3. Maintain type safety across the application
4. Follow the existing code structure and naming conventions
