
// import { create } from "zustand";
// import toast from "react-hot-toast";
// import { axiosInstance } from "../lib/axios"; // Assuming axiosInstance is properly set
// import { io } from "socket.io-client";

// let socket;

// export const useChatStore = create((set, get) => ({
//   messages: [], // Initialize messages as an empty array
//   users: [], // List of users
//   selectedUser: null, // Currently selected user
//   isUsersLoading: false, // Loading state for fetching users
//   isMessagesLoading: false, // Loading state for fetching messages
//   authUser: JSON.parse(localStorage.getItem("authUser")) || null,

//   // Fetch users
//   getUsers: async () => {
//     set({ isUsersLoading: true });
//     try {
//       const token = localStorage.getItem("authToken");
//       if (!token) {
//         toast.error("No token found! Please log in.");
//         set({ isUsersLoading: false });
//         return;
//       }

//       const res = await axiosInstance.get("/users", {
//         headers: {
//           Authorization: `Bearer ${token}`, // Pass token in Authorization header
//         },
//       });

//       console.log("Users fetched successfully:", res.data);
//       set({ users: res.data.users });
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || "Failed to fetch users.";
//       console.error("Error fetching users:", errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       set({ isUsersLoading: false });
//     }
//   },

//   //Fetch messages for a selected user
//   getMessages: async (userId) => {
//     set({ isMessagesLoading: true });
//     try {
//       const token = localStorage.getItem("authToken");
//       if (!token) {
//         toast.error("No token found! Please log in.");
//         set({ isMessagesLoading: false });
//         return;
//       }

//       const res = await axiosInstance.get(`/messages/${userId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`, // Add the token to the Authorization header
//         },
//         withCredentials: true,
//       });

//       console.log("Messages fetched successfully:", res.data.data);
//       set({ messages: res.data.data });
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || "Failed to fetch messages.";
//       console.error("Error fetching messages:", errorMessage);
//       if (error.response?.status === 404) {
//         console.log("No messages found for this user.");
//         set({ messages: [] }); // Set messages to an empty array
//       } else {
//         toast.error(errorMessage);
//       }
//     } finally {
//       set({ isMessagesLoading: false });
//     }
//   },



  

//   sendMessage: async (receiverId, content) => {
//     try {
//       const token = localStorage.getItem("authToken");
//       console.log("Token in sendMessage:", token);
//       console.log("Sending message to:", receiverId, "Content:", content);
  
//       if (!token) {
//         toast.error("No token found! Please log in.");
//         return;
//       }
//       if ((!content || typeof content.text !== "string" || content.text.trim() === "") && !content.image) {
//         toast.error("Message content or image is required.");
//         return;
//       }
      
//       // Ensure the payload structure matches the server expectation
//       const messagePayload = { message: content.text, image: content.image || null };

//       const res = await axiosInstance.post(
//         `/messages/send/${receiverId}`,
//         messagePayload , // Ensure this matches server expectation
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           withCredentials: true,
//         }
//       );
//       console.log("Message sent successfully:", res.data);
//       toast.success("Message sent!");
  
//       // Update the messages state with the newly sent message
//       set((state) => ({
//         messages: [...state.messages, res.data],
//       }));
//     } catch (error) {
//       console.error("Error in sendMessage:", error);
//       const errorMessage = error.response?.data?.message || "Failed to send message.";
      
//       console.error("Detailed Error Response:", error.response);
//       toast.error(errorMessage);
//     }
//   },
  

  


  
  
  
  
  


  

//   // // Subscribe to new messages
//   subscribeToMessages: () => {
//     const token = localStorage.getItem("authToken");
//     const { selectedUser } = get();

//     if (!token) {
//       console.error("No token found! Cannot subscribe to messages.");
//       return;
//     }

//     if (!selectedUser) {
//       console.error("No selected user! Cannot subscribe to messages.");
//       return;
//     }

//     if (!socket) {
//       socket = io("http://localhost:5001", {
//         auth: { token },
//       });
//     }

//     socket.on("newMessage", (newMessage) => {
//       const isMessageFromSelectedUser =
//         newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id;

//       if (isMessageFromSelectedUser) {
//         console.log("New message received:", newMessage);
//         set((state) => ({ messages: [...state.messages, newMessage] }));
//       }
//     });

//     console.log("Subscribed to messages");
//   },

//   // Unsubscribe from messages
//   unsubscribeFromMessages: () => {
//     if (socket) {
//       socket.off("newMessage");
//       console.log("Unsubscribed from messages");
//     }
//   },

//   // Set the selected user
//   setSelectedUser: (selectedUser) => set({ selectedUser }),
// }));

import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios"; // Assuming axiosInstance is properly set
import { io } from "socket.io-client";

let socket;

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  authUser: JSON.parse(localStorage.getItem("authUser")) || null,

  // Fetch users
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("No token found! Please log in.");
        set({ isUsersLoading: false });
        return;
      }
      const res = await axiosInstance.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Users fetched successfully:", res.data);
      set({ users: res.data.users });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch users.";
      console.error("Error fetching users:", errorMessage);
      toast.error(errorMessage);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Fetch messages for a selected user
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("No token found! Please log in.");
        set({ isMessagesLoading: false });
        return;
      }
      const res = await axiosInstance.get(`/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      console.log("Messages fetched successfully:", res.data.data);
      set({ messages: res.data.data });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch messages.";
      console.error("Error fetching messages:", errorMessage);
      if (error.response?.status === 404) {
        console.log("No messages found for this user.");
        set({ messages: [] });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Send message (supports image as base64)
  sendMessage: async (receiverId, content) => {
    try {
      const token = localStorage.getItem("authToken");
      console.log("Token in sendMessage:", token);
      console.log("Sending message to:", receiverId, "Content:", content);

      if (!token) {
        toast.error("No token found! Please log in.");
        return;
      }
      // Allow content to be null; backend will convert it to an empty string if image exists.
      // (No extra processing here)
      const messagePayload = { text: content.text, image: content.image || null };

      const res = await axiosInstance.post(
        `/messages/send/${receiverId}`,
        messagePayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("Message sent successfully:", res.data);
      toast.success("Message sent!");

      // Append the new message to the state
      set((state) => ({
        messages: [...state.messages, res.data.data],
      }));
    } catch (error) {
      console.error("Error in sendMessage:", error);
      const errorMessage = error.response?.data?.message || "Failed to send message.";
      console.error("Detailed Error Response:", error.response);
      toast.error(errorMessage);
    }
  },

  // Subscribe to new messages via socket
  subscribeToMessages: () => {
    const token = localStorage.getItem("authToken");
    const { selectedUser } = get();
    if (!token) {
      console.error("No token found! Cannot subscribe to messages.");
      return;
    }
    if (!selectedUser) {
      console.error("No selected user! Cannot subscribe to messages.");
      return;
    }
    if (!socket) {
      socket = io("http://localhost:5001", {
        auth: { token },
      });
    }
    socket.on("newMessage", (newMessage) => {
      const isMessageFromSelectedUser =
        newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id;
      if (isMessageFromSelectedUser) {
        console.log("New message received:", newMessage);
        set((state) => ({ messages: [...state.messages, newMessage] }));
      }
    });
    console.log("Subscribed to messages");
  },

  // Unsubscribe from messages
  unsubscribeFromMessages: () => {
    if (socket) {
      socket.off("newMessage");
      console.log("Unsubscribed from messages");
    }
  },

  // Set the selected user
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));

export default useChatStore;