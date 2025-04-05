import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsers } from "../controllers/user.controller.js";
import User from "../models/user.model.js"; // Import the User model

const router = express.Router();

// Route to get all users
router.get("/", protectRoute, getUsers);

// Route to update user profile
router.put("/profile", protectRoute, async (req, res) => {
  const { userId, profilePic, fullName, bio } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic, fullName, bio },
      { new: true } // Return the updated user
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;