import express from 'express';
import { signupUser, loginUser, authenticate } from '../controllers/auth.js';
import { createTrip } from '../controllers/createTrip.js';
import { getCommunityPosts, createCommunityPost } from '../controllers/community.js';

const router = express.Router();

// Auth routes
router.post("/auth/signup", signupUser);
router.post("/auth/login", loginUser);

// Trip routes
router.post("/trips/create", authenticate, createTrip);

// Community routes
router.get("/community", getCommunityPosts);
router.post("/community", authenticate, createCommunityPost);

export default router;
