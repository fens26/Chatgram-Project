// import { useEffect, useRef } from "react";
// import { useChatStore } from "../store/useChatStore";
// import { useAuthStore } from "../store/useAuthStore";
// import ChatHeader from "./ChatHeader";
// import MessageInput from "./MessageInput";
// import MessageSkeleton from "./skeletons/MessageSkeleton";
// import { formatMessageTime } from "../lib/utils";

// const ChatContainer = () => {
//   const {
//     messages = [],
//     getMessages,
//     isMessagesLoading,
//     selectedUser,
//     subscribeToMessages,
//     unsubscribeFromMessages,
//     sendMessage,
//   } = useChatStore();
  
//   const { authUser } = useAuthStore();
//   const messageEndRef = useRef(null);

//   useEffect(() => {
//     console.log("Selected User:", selectedUser); 
//     if (selectedUser?._id) {
//       getMessages(selectedUser._id);
//       subscribeToMessages();
//     }
//     return () => unsubscribeFromMessages();
//   }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

//   useEffect(() => {
//     if (messageEndRef.current) {
//       messageEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   useEffect(() => {
//     console.log("Updated Messages:", messages);
//   }, [messages]);

//   const handleSendMessage = (content) => {
//     if (!content?.text?.trim() && !content.image) {
//       console.error("Message content is required.");
//       return;
//     }
//     if (!selectedUser?._id) {
//       console.error("No user selected to send a message.");
//       return;
//     }
//     sendMessage(selectedUser._id, content);
//   };

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       <ChatHeader />

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {isMessagesLoading ? (
//           <MessageSkeleton />
//         ) : (
//           messages.length > 0 ? (
//             messages.map((message, index) => (
//               <div
//                 key={message._id || `temp-${index}`} // Handle temporary messages
//                 className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
//               >
//                 <div className="chat-image avatar">
//                   <div className="size-10 rounded-full border">
//                     <img
//                       src={
//                         message.senderId === authUser._id
//                           ? authUser.profilePic || "/avatar.png"
//                           : selectedUser?.profilePic || "/avatar.png"
//                       }
//                       alt="profile pic"
//                     />
//                   </div>
//                 </div>
//                 <div className="chat-header mb-1">
//                   <time className="text-xs opacity-50 ml-1">
//                     {formatMessageTime(message.createdAt)}
//                   </time>
//                 </div>
//                 <div className="chat-bubble flex flex-col">
//                   {message.image && (
//                     <img
//                       src={message.image}
//                       alt="Attachment"
//                       className="sm:max-w-[200px] rounded-md mb-2"
//                     />
//                   )}
//                   {/* Updated to use 'content' field */}
//                   {message.content && <p>{message.content}</p>}
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p className="text-center text-gray-500">No messages to display.</p>
//           )
//         )}
//         <div ref={messageEndRef} />
//       </div>

//       <MessageInput onSendMessage={handleSendMessage} />
//     </div>
//   );
// };

// export default ChatContainer;


import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages = [],
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    sendMessage,
  } = useChatStore();
  
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Debug: Log auth user details
  useEffect(() => {
    console.log("Auth User Data:", authUser);
  }, [authUser]);

  // When selectedUser changes, fetch messages and subscribe to new messages
  useEffect(() => {
    console.log("Selected User:", selectedUser);
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Scroll to the bottom when messages update
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    console.log("Updated Messages:", messages);
  }, [messages]);

  const handleSendMessage = (content) => {
    if (!content?.text?.trim() && !content.image) {
      console.error("Message content is required.");
      return;
    }
    if (!selectedUser?._id) {
      console.error("No user selected to send a message.");
      return;
    }
    sendMessage(selectedUser._id, content);
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isMessagesLoading ? (
          <MessageSkeleton />
        ) : (
          messages.length > 0 ? (
            messages.map((message, index) => {
              const isSentByAuthUser = message.senderId === authUser._id;
              // For own messages, use authUser.profilePic if available; 
              // for received messages, use selectedUser.profilePic if available,
              // otherwise fallback to a custom default ("/default-user.png").
              const senderProfilePic = isSentByAuthUser
                ? authUser.profilePic || "/avatar.png"
                : selectedUser?.profilePic && selectedUser.profilePic.trim() !== ""
                    ? selectedUser.profilePic
                    : "/default-user.png"; // Custom default for received messages

              console.log("Message Sender ID:", message.senderId);
              console.log("Auth User ID:", authUser._id);
              console.log("Profile Pic Used:", senderProfilePic);

              return (
                <div
                  key={message._id || `temp-${index}`}
                  className={`chat ${isSentByAuthUser ? "chat-end" : "chat-start"}`}
                >
                  <div className="chat-image avatar">
                    <div className="size-10 rounded-full border">
                      <img src={senderProfilePic} alt="profile pic" />
                    </div>
                  </div>
                  <div className="chat-header mb-1">
                    <time className="text-xs opacity-50 ml-1">
                      {formatMessageTime(message.createdAt)}
                    </time>
                  </div>
                  <div className="chat-bubble flex flex-col">
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="sm:max-w-[200px] rounded-md mb-2"
                      />
                    )}
                    {message.content && <p>{message.content}</p>}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500">No messages to display.</p>
          )
        )}
        <div ref={messageEndRef} />
      </div>

      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatContainer;
