import express from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
  updateProfile,
  verifyTokenFromCookies,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ Public Routes
router.post("/signup", signup); // Validate signup request body
router.post("/login", login); // Validate login request body
router.delete("/logout", logout); // Use DELETE for logout
router.get("/verify-token", verifyTokenFromCookies); // Verify token from cookies

// ✅ Protected Routes
router.use(protectRoute); // Apply protectRoute middleware to all routes below
router.put("/update-profile", updateProfile); // Update user profile
router.get("/check", checkAuth); // Check if user is authenticated

export default router;