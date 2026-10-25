import React, { useState, useEffect, useRef } from "react";
import { X, Send, Image as ImageIcon } from "lucide-react";
import {
  db,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "../firebase";

export default function ChatWindow({
  contact,
  onClose,
  darkMode,
  currentUser,
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);

  // Generate a unique deterministic chat room ID between current user and contact
  const chatId =
    currentUser && contact
      ? [currentUser.fullName, contact.name].sort().join("_")
      : "general_chat";

  // Fetch real-time messages from Firestore (Sorted locally in JavaScript to bypass index requirement)
  useEffect(() => {
    if (!chatId) return;

    try {
      const q = query(
        collection(db, "messages"),
        where("chatId", "==", chatId),
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const liveMessages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Sort messages locally by timestamp
          liveMessages.sort((a, b) => {
            const timeA = a.timestamp?.seconds || Date.now() / 1000;
            const timeB = b.timestamp?.seconds || Date.now() / 1000;
            return timeA - timeB;
          });

          setMessages(liveMessages);
          scrollToBottom();
        },
        (error) => {
          console.warn("Firestore chat listener error:", error);
        },
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up chat listener:", err);
    }
  }, [chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle image attachment in chat
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Send message to Firestore
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !currentUser) return;

    const messageText = newMessage;
    const imagePayload = selectedImage;

    // Clear inputs immediately for snappy UX
    setNewMessage("");
    setSelectedImage(null);

    try {
      await addDoc(collection(db, "messages"), {
        chatId: chatId,
        sender: currentUser.fullName,
        senderAvatar: currentUser.avatar || "OE",
        recipient: contact.name,
        text: messageText,
        image: imagePayload || null,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div
      className={`fixed bottom-0 right-4 sm:right-6 z-50 w-full sm:w-80 md:w-96 rounded-t-2xl shadow-2xl border flex flex-col h-[450px] transition-colors ${
        darkMode
          ? "bg-gray-900 border-gray-800 text-white"
          : "bg-white border-gray-200 text-gray-900"
      }`}
    >
      {/* Chat Header */}
      <div
        className={`p-3.5 flex items-center justify-between border-b rounded-t-2xl ${
          darkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            {/* Avatar image handler: renders <img> for Base64 or initial character as fallback */}
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden flex-shrink-0 shadow-xs">
              {contact.avatar &&
              typeof contact.avatar === "string" &&
              contact.avatar.startsWith("data:") ? (
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {contact.avatar &&
                  typeof contact.avatar === "string" &&
                  contact.avatar.length <= 3
                    ? contact.avatar
                    : contact.name?.[0] || "U"}
                </span>
              )}
            </div>
            {contact.online && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm">{contact.name}</h4>
            <p className="text-[10px] text-gray-400">
              {contact.online ? "Active now" : "Offline"}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length > 0 ? (
          messages.map((msg) => {
            const isMe = msg.sender === currentUser.fullName;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs sm:text-sm shadow-xs ${
                    isMe
                      ? "bg-emerald-600 text-white rounded-br-none"
                      : darkMode
                        ? "bg-gray-800 text-gray-100 rounded-bl-none"
                        : "bg-gray-100 text-gray-900 rounded-bl-none"
                  }`}
                >
                  {msg.text && <p>{msg.text}</p>}
                  {msg.image && (
                    <div className="mt-2 rounded-xl overflow-hidden max-h-48">
                      <img
                        src={msg.image}
                        alt="Attachment"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 px-1">
                  {msg.timestamp?.toDate
                    ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Just now"}
                </span>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 text-xs p-4">
            <p>No messages with {contact.name} yet.</p>
            <p className="mt-1">Say hello and start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected Image Preview before sending */}
      {selectedImage && (
        <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <img
              src={selectedImage}
              alt="Preview"
              className="w-10 h-10 rounded-lg object-cover"
            />
            <span className="text-xs text-gray-500">Image attached</span>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="text-gray-400 hover:text-red-500 text-xs"
          >
            Remove
          </button>
        </div>
      )}

      {/* Chat Input Footer */}
      <form
        onSubmit={handleSendMessage}
        className={`p-3 border-t flex items-center gap-2 ${
          darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        <label className="cursor-pointer text-gray-400 hover:text-emerald-600 transition-colors p-1">
          <ImageIcon size={18} />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </label>

        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message ${contact.name.split(" ")[0]}...`}
          className={`flex-1 px-3.5 py-2 rounded-full text-xs outline-none border transition-colors ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500"
              : "bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500"
          }`}
        />

        <button
          type="submit"
          disabled={!newMessage.trim() && !selectedImage}
          className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white transition-colors shadow-sm"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
