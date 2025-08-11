import express from 'express';

// User controllers
import { signupUser, loginUser, authenticate } from '../controllers/auth.js';
import { createTrip } from '../controllers/createTrip.js';
import { getCommunityPosts, createCommunityPost } from '../controllers/community.js';
import { searchCities } from '../controllers/search.js';
import { getTripById, planWithAI, viewTrips } from '../controllers/trips.js';
import { getProfile } from '../controllers/userProfile.js';
import { fetchCityActivities, saveSelectedCityActivities } from '../controllers/searchController.js';
import updateActivityCost from '../controllers/budget.js';
import { signupAdmin } from '../controllers/Adminauth.js';

const router = express.Router();

/* USER PROFILE ROUTE */
router.get("/profile", authenticate, getProfile);

/* USER AUTH ROUTES */
router.post("/auth/signup", signupUser);
router.post("/auth/login", loginUser);
router.post("/auth/admin/signup", signupAdmin); // Added admin signup route

/* TRIP ROUTES */
router.post("/trips/create", authenticate, createTrip);
router.get("/trips/view", authenticate, viewTrips);
router.get("/trips/:tripId", authenticate, getTripById);
router.post("/trips/planai/:tripId", authenticate, planWithAI)

/* COMMUNITY ROUTES */
router.get("/community", getCommunityPosts); // public
router.post("/community", authenticate, createCommunityPost); // protected

/* SEARCH & CITY/ACTIVITY SAVE ROUTES */
router.get("/trips/:tripId/search/cities", authenticate, searchCities);
router.post("/trips/:tripId/search/api", authenticate, fetchCityActivities);
router.post("/trips/:tripId/add-city-with-activities", authenticate, saveSelectedCityActivities);

router.post("/activity/cost", authenticate, updateActivityCost);

export default router;