// import jwt from "jsonwebtoken";
// import User from "../models/user.model.js";

// export const protectRoute = async (req, res, next) => {
//   try {
//     let token;

//     // Check for token in the Authorization header
//     if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
//       token = req.headers.authorization.split(" ")[1];
//     }

//     console.log("Token in protectRoute middleware:", token); // Debug log

//     if (!token) {
//       return res.status(401).json({ message: "Unauthorized - No Token Provided" });
//     }

//     // Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     console.log("Decoded token:", decoded); // Debug log
    
//     // if (!decoded) {
//     //   return res.status(401).json({ message: "Unauthorized - Invalid Token" });
//     // }

//     // Find the user by ID and exclude the password field
//     // const user = await User.findById(decoded.userId).select("-password");

//     // if (!user) {
//     //   return res.status(404).json({ message: "User not found" });
//     // }

//     // Attach the user object to the request
//     req.user = decoded;

//     // Proceed to the next middleware or route handler
//     next();
//   } catch (error) {
//     console.error("Error in protectRoute middleware:", error.message);
//     if (error.name === "JsonWebTokenError") {
//       return res.status(401).json({ message: "Unauthorized - Invalid Token" });
//     } 
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };





import jwt from "jsonwebtoken";

export const protectRoute = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    req.user = { _id: decoded.userId }; // Attach userId to req.user
    console.log("Authenticated user ID:", req.user._id); // Debug log
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};// auth.middleware.js
