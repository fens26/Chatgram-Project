import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5001/api", // Backend URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Ensure cookies are sent with requests
});

// Add a request interceptor to include the token in the Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // Retrieve token from localStorage
    console.log("Token in axios interceptor:", token); // Debug log to verify token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add token to Authorization header
    }
    return config;
  },
  (error) => {
    console.error("Error in axios request interceptor:", error); // Debug log for errors
    return Promise.reject(error);
  }
);

export { axiosInstance };

axios.js
