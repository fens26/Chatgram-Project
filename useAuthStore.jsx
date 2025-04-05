
// import { create } from "zustand";
// import { axiosInstance } from "../lib/axios.js"; // Assuming axiosInstance is properly set
// import toast from "react-hot-toast";
// import { io } from "socket.io-client";

// const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

// export const useAuthStore = create((set, get) => ({
//   // User state
//   authUser: JSON.parse(localStorage.getItem("authUser")) || null,
//   isSigningUp: false,
//   isLoggingIn: false,
//   isUpdatingProfile: false,
//   isCheckingAuth: true,
  
//   // Online status state
//   onlineUsers: [],  // Array of user IDs who are online
//   socket: null,

//   // Check if the user is authenticated
//   checkAuth: async () => {
//     const authToken = localStorage.getItem("authToken");
//     console.log("Token from localStorage:", authToken);

//     if (!authToken) {
//       set({ authUser: null, isCheckingAuth: false });
//       return;
//     }

//     try {
//       const res = await axiosInstance.get("/auth/check", {
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       });
//       console.log("authUser from backend:", res.data.data); // Expect profilePic to be included
//       set({ authUser: res.data.data });
//       // Connect to the socket after authentication
//       get().connectSocket();
//     } catch (error) {
//       console.error("Error in checkAuth:", error);
//       set({ authUser: null });
//     } finally {
//       set({ isCheckingAuth: false });
//     }
//   },

//   // Signup functionality
//   signup: async (data) => {
//     set({ isSigningUp: true });
//     try {
//       const res = await axiosInstance.post("/auth/signup", data);
//       console.log("Token from signup response:", res.data.token);
//       localStorage.setItem("authToken", res.data.token);
//       // Set authUser with full user data including profilePic
//       set({ authUser: res.data.data });
//       toast.success("Account created successfully");
//       get().connectSocket();
//     } catch (error) {
//       console.error("Signup failed:", error);
//       toast.error(error.response?.data?.message || "Signup failed.");
//     } finally {
//       set({ isSigningUp: false });
//     }
//   },

//   // Login functionality
//   login: async (data) => {
//     set({ isLoggingIn: true });
//     try {
//       const res = await axiosInstance.post("/auth/login", data);
//       console.log("Login response:", res.data);
//       localStorage.setItem("authToken", res.data.token);
//       console.log("Token saved to localStorage:", res.data.token);
//       // Set authUser with full user data including profilePic
//       set({ authUser: res.data.data });
//       toast.success("Logged in successfully");
//       get().connectSocket();
//     } catch (error) {
//       console.error("Login failed:", error);
//       toast.error(error.response?.data?.message || "Login failed. Please try again.");
//     } finally {
//       set({ isLoggingIn: false });
//     }
//   },

//   // Logout functionality
//   logout: async () => {
//     try {
//       await axiosInstance.delete("/auth/logout", { withCredentials: true });
//       get().disconnectSocket();
//       set({ authUser: null });
//       localStorage.removeItem("authToken");
//       toast.success("Logged out successfully");
//     } catch (error) {
//       console.error("Logout failed:", error);
//       toast.error("Logout failed. Please try again.");
//     }
//   },

//   // Connect to the socket server and track online users
//   connectSocket: () => {
//     const { authUser } = get();
//     console.log("Auth user in connectSocket:", authUser);
//     if (!authUser || !authUser._id) {
//       console.error("Cannot connect socket: authUser or userId is undefined");
//       return;
//     }
    
//     // Connect to the socket server with the authenticated user's ID
//     const socket = io(BASE_URL, {
//       query: { userId: authUser._id },
//       transports: ["websocket", "polling"],
//     });

//     socket.connect();
//     set({ socket });
    
//     socket.on("connect", () => {
//       console.log("Socket connected:", socket.id);
//     });
    
//     // Listen for online users update from the server
//     socket.on("getOnlineUsers", (userIds) => {
//       console.log("Online users:", userIds);
//       set({ onlineUsers: userIds });
//     });
    
//     socket.on("disconnect", () => {
//       console.log("Socket disconnected");
//     });
    
//     socket.on("connect_error", (error) => {
//       console.error("Socket connection error:", error);
//     });
//   },

//   // Disconnect from the socket server
//   disconnectSocket: () => {
//     const { socket } = get();
//     if (socket?.connected) {
//       socket.disconnect();
//       set({ socket: null });
//       console.log("Socket disconnected successfully");
//     }
//   },

//   // Update user profile (make sure profilePic is included in the response)
//   updateProfile: async (data) => {
//     set({ isUpdatingProfile: true });
//     try {
//       const token = localStorage.getItem("authToken");
//       const res = await axiosInstance.put(
//         "/users/profile",
//         {
//           userId: get().authUser._id,
//           ...data,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       console.log("Profile updated successfully:", res.data);
//       // Update authUser with new data
//       set({ authUser: res.data });
//     } catch (error) {
//       console.error("Error updating profile:", error);
//     } finally {
//       set({ isUpdatingProfile: false });
//     }
//   },
// }));

// export default useAuthStore;


// store/useAuthStore.jsx

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth & UI states
      authUser: null,
      isSigningUp: false,
      isLoggingIn: false,
      isUpdatingProfile: false,
      isCheckingAuth: true,

      // Online user tracking
      onlineUsers: [],
      socket: null,

      // Set auth user manually
      setAuthUser: (user) => set({ authUser: user }),

      // Check if the user is authenticated
      checkAuth: async () => {
        const authToken = localStorage.getItem("authToken");
        console.log("Token from localStorage:", authToken);

        if (!authToken) {
          set({ authUser: null, isCheckingAuth: false });
          return;
        }

        try {
          const res = await axiosInstance.get("/auth/check", {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          console.log("authUser from backend:", res.data.data);
          set({ authUser: res.data.data });
          get().connectSocket();
        } catch (error) {
          console.error("Error in checkAuth:", error);
          set({ authUser: null });
        } finally {
          set({ isCheckingAuth: false });
        }
      },

      // Signup functionality
      signup: async (data) => {
        set({ isSigningUp: true });
        try {
          const res = await axiosInstance.post("/auth/signup", data);
          localStorage.setItem("authToken", res.data.token);
          set({ authUser: res.data.data });
          toast.success("Account created successfully");
          get().connectSocket();
        } catch (error) {
          console.error("Signup failed:", error);
          toast.error(error.response?.data?.message || "Signup failed.");
        } finally {
          set({ isSigningUp: false });
        }
      },

      // Login functionality
      login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post("/auth/login", data);
          localStorage.setItem("authToken", res.data.token);
          set({ authUser: res.data.data });
          toast.success("Logged in successfully");
          get().connectSocket();
        } catch (error) {
          console.error("Login failed:", error);
          toast.error(error.response?.data?.message || "Login failed. Please try again.");
        } finally {
          set({ isLoggingIn: false });
        }
      },

      // Logout functionality
      logout: async () => {
        try {
          await axiosInstance.delete("/auth/logout", { withCredentials: true });
          get().disconnectSocket();
          set({ authUser: null });
          localStorage.removeItem("authToken");
          toast.success("Logged out successfully");
        } catch (error) {
          console.error("Logout failed:", error);
          toast.error("Logout failed. Please try again.");
        }
      },

      // Connect to socket.io server
      connectSocket: () => {
        const { authUser } = get();
        if (!authUser || !authUser._id) {
          console.error("Cannot connect socket: authUser or userId is undefined");
          return;
        }

        const socket = io(BASE_URL, {
          query: { userId: authUser._id },
          transports: ["websocket", "polling"],
        });

        socket.connect();
        set({ socket });

        socket.on("connect", () => {
          console.log("Socket connected:", socket.id);
        });

        socket.on("getOnlineUsers", (userIds) => {
          console.log("Online users:", userIds);
          set({ onlineUsers: userIds });
        });

        socket.on("disconnect", () => {
          console.log("Socket disconnected");
        });

        socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
        });
      },

      // Disconnect from socket.io server
      disconnectSocket: () => {
        const { socket } = get();
        if (socket?.connected) {
          socket.disconnect();
          set({ socket: null });
          console.log("Socket disconnected successfully");
        }
      },

      // Update user profile
      // Update user profile
updateProfile: async (updatedData) => {
  set({ isUpdatingProfile: true });

  try {
    const token = localStorage.getItem("authToken");
    const userId = get().authUser?._id;

    const res = await axiosInstance.put(
      "/users/profile",
      {
        userId,
        ...updatedData,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const updatedUser = res.data;

    // ✅ Update Zustand store
    set({ authUser: updatedUser });

    // ✅ Also update localStorage to persist after refresh/login
    localStorage.setItem("authUser", JSON.stringify(updatedUser));

    toast.success("Profile updated");
  } catch (error) {
    console.error("Error updating profile:", error);
    toast.error("Failed to update profile");
  } finally {
    set({ isUpdatingProfile: false });
  }
},

}),
{
  name: "auth-storage",
  getStorage: () => localStorage,
  partialize: (state) => ({ authUser: state.authUser }), // Only persist authUser
}
)
);


export default useAuthStore;
