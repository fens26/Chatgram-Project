import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
// Configure dotenv to load the .env file
dotenv.config();

// Now you can safely use process.env to access your environment variables


export const generateToken = (userId, res) => {
  try {
    console.log("Response object in generateToken:", res); // Debug log

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // MS
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV !== 'development',
    });

    return token;
  } catch (error) {
    console.error("Error generating token:", error.message);
    throw new Error("Token generation failed");
  }
};