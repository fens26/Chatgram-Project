

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import userRoutes from './routes/user.route.js';

dotenv.config(); // Load environment variables from .env

const app = express();
const server = http.createServer(app);

// Track connected users
const onlineUsers = new Map(); // userId -> socket.id

// Initialize socket.io server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) throw new Error("MONGODB_URI not defined");
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

// Socket.IO connection
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (!userId) {
    console.warn("User connected without userId");
    socket.disconnect();
    return;
  }

  console.log(`🟢 User ${userId} connected with socket ID ${socket.id}`);
  onlineUsers.set(userId, socket.id);

  // Emit updated list to all users
  io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));

  socket.on("disconnect", () => {
    console.log(`🔴 User ${userId} disconnected (socket ${socket.id})`);
    onlineUsers.delete(userId);
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err);
  });
});

// Server Listen
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
