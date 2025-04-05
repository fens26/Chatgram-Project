import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Get users for sidebar excluding logged-in user
export const getUsersForSidebar = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const loggedInUserId = req.user._id;

    // Add pagination (e.g., limit and skip)
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } })
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit));

    if (!filteredUsers || filteredUsers.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages between the logged-in user and another user
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    if (!userToChatId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Add pagination (e.g., limit and skip)
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    if (!messages || messages.length === 0) {
      return res.status(404).json({ error: "No messages found" });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send a new message from logged-in user to another user
export const sendMessage = async (req, res) => {
  try {
    console.log("Incoming request body:", req.body); // Log the incoming request body
    const { message, image } = req.body.message; // Expect both content and image
    const { id: receiverId } = req.params;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Message content is required and must be a non-empty string" });
    }

    // Validate if the recipient exists
    const recipient = await User.findById(receiverId);
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    // Save the message to the database
    const newMessage = new Message({
      senderId: req.user._id,
      receiverId,
      content: message,
      image: image || null,
      createdAt: new Date(),
    });

    await newMessage.save();

    // Emit the message to the recipient's socket if connected
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json({ success: true, message: "Message sent!", data: newMessage });
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};