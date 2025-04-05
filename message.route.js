// import express from "express";
// import { protectRoute } from "../middleware/auth.middleware.js";
// import Message from "../models/message.model.js";
// import User from "../models/user.model.js";

// const router = express.Router();

// /**
//  * ✅ POST Route: Send a message to a user
//  * URL: /api/messages/send/:userId
//  */
// router.post("/send/:userId", protectRoute, async (req, res) => {
//   try {
//     const senderId = req.user._id; // Get the sender's ID from the JWT token
//     const receiverId = req.params.userId; // Get the receiver's ID from the URL parameter
//     const { message } = req.body; // Get the message content from the request body

//     // Validate message content
//     if (!message || typeof message !== "string" || message.trim().length === 0) {
//       return res.status(400).json({ message: "Message content is required and must be a non-empty string" });
//     }

//     // Validate if the recipient exists
//     const recipient = await User.findById(receiverId);
//     if (!recipient) {
//       return res.status(404).json({ message: "Recipient not found" });
//     }

//     // Create a new message document and save it to the database
//     const newMessage = new Message({
//       senderId,
//       receiverId,
//       content: message,
//     });

//     await newMessage.save();

//     res.status(201).json({ message: "Message sent successfully", data: newMessage });
//   } catch (error) {
//     console.error("Error sending message:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });


// router.post("/send/:receiverId", protectRoute, async (req, res) => {
//   try {
//       const senderId = req.user._id; // Extract from JWT
//       const receiverId = req.params.receiverId;
//       const { content, type = "text", image = null } = req.body;

//       console.log("Message Request Received:", { senderId, receiverId, content });

//       if (!content && !image) {
//           return res.status(400).json({ error: "Message content or image is required." });
//       }

//       // Ensure the receiver exists
//       const recipient = await User.findById(receiverId);
//       if (!recipient) {
//           return res.status(404).json({ message: "Recipient not found." });
//       }

//       // Create and save the message
//       const newMessage = new Message({
//           senderId,
//           receiverId,
//           content,
//           type,
//           image,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//       });

//       await newMessage.save();

//       console.log("✅ Message saved:", newMessage);

//       res.status(201).json({
//           message: "Message sent successfully",
//           data: newMessage,
//       });
//   } catch (error) {
//       console.error("❌ Error sending message:", error.message);
//       res.status(500).json({ message: "Internal Server Error" });
//   }
// });


// router.get("/:userId", protectRoute, async (req, res) => {
//   const { userId } = req.params;  // The user to fetch messages with
//   const currentUserId = req.user._id;  // Logged-in user ID from JWT token

//   console.log("Fetching messages for:", { userId, currentUserId }); // Debug log

//   try {
//     const messages = await Message.find({
//       $or: [
//         { senderId: currentUserId, receiverId: userId },
//         { senderId: userId, receiverId: currentUserId },
//       ],
//     }).sort({ createdAt: 1 }); // Sorting messages by time

//     console.log("Query result:", messages); // Debug log to check fetched messages

//     return res.status(200).json({
//       message: "Messages retrieved",
//       data: messages, // Will be an empty array if none found
//     }); // Send messages to frontend
//   } catch (error) {
//     console.error("Error fetching messages:", error.message);
//     res.status(500).json({ message: "Failed to fetch messages" });
//   }
// });

// /**
// * ✅ GET Route: Fetch all users (paginated)
// * URL: /api/messages/users
// */
// router.get("/users", protectRoute, async (req, res) => {
//   try {
//       const { page = 1, limit = 10 } = req.query;
//       const skip = (page - 1) * parseInt(limit, 10);

//       const users = await User.find().select("-password").skip(skip).limit(parseInt(limit, 10));

//       if (!users.length) {
//           return res.status(404).json({ message: "No users found" });
//       }

//       res.status(200).json({ users });
//   } catch (error) {
//       console.error("❌ Error fetching users:", error.message);
//       res.status(500).json({ message: "Internal Server Error" });
//   }
// });


// export default router;

import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

const router = express.Router();

/**
 * POST Route: Send a message (text or image or both) to a user
 * URL: /api/messages/send/:receiverId
 */
router.post("/send/:receiverId", protectRoute, async (req, res) => {
  try {
    const senderId = req.user._id; // From JWT
    const receiverId = req.params.receiverId; // From URL
    const { text, image } = req.body; // Expect both fields (text may be null)

    // Validate that at least one is provided
    if ((!text || text.trim().length === 0) && !image) {
      return res.status(400).json({ message: "Either text or image is required." });
    }

    // Validate if recipient exists
    const recipient = await User.findById(receiverId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found." });
    }

    // Determine the message type
    const msgType = image ? "image" : "text";

    // Create and save the new message
    const newMessage = new Message({
      senderId,
      receiverId,
      content: text, // This value is validated by our schema; if text is missing but image is provided, the validator passes.
      image: image || null,
      type: msgType,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newMessage.save();
    console.log("✅ Message saved:", newMessage);

    res.status(201).json({
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * GET Route: Fetch messages between current user and another user
 * URL: /api/messages/:userId
 */
router.get("/:userId", protectRoute, async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;
  console.log("Fetching messages for:", { userId, currentUserId });
  try {
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId },
      ],
    }).sort({ createdAt: 1 });
    console.log("Query result:", messages);
    res.status(200).json({ message: "Messages retrieved", data: messages });
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

/**
 * GET Route: Fetch all users (paginated)
 * URL: /api/messages/users
 */
router.get("/users", protectRoute, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * parseInt(limit, 10);
    const users = await User.find().select("-password").skip(skip).limit(parseInt(limit, 10));
    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
