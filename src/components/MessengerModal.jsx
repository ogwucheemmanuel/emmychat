import React, { useState, useEffect } from "react";
import { X, Search, MessageSquare, Video, Edit } from "lucide-react";
import { db, collection, onSnapshot } from "../firebase";

export default function MessengerModal({
  isOpen,
  onClose,
  darkMode,
  currentUser,
  onSelectContact,
}) {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all registered users live from Firestore
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    try {
      const unsubscribe = onSnapshot(
        collection(db, "users"),
        (snapshot) => {
          const liveUsers = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            // Exclude yourself from your own contact list
            .filter((u) => u.uid !== currentUser?.uid);

          setUsers(liveUsers);
        },
        (error) => {
          console.warn("Error fetching messenger contacts:", error);
        },
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up messenger listener:", err);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const filteredUsers = users.filter((user) =>
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl border flex flex-col h-[550px] overflow-hidden transition-colors animate-in fade-in zoom-in-95 duration-200 ${
          darkMode
            ? "bg-gray-900 border-gray-800 text-white"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            darkMode
              ? "bg-gray-800/80 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Chats</h2>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors">
              <Edit size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
          <div
            className={`px-3 py-2 rounded-xl border flex items-center gap-2 ${
              darkMode
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-gray-100 border-gray-200 text-gray-900"
            }`}
          >
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search Messenger..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-xs sm:text-sm placeholder-gray-400"
            />
          </div>
        </div>

        {/* Conversations / Active Users List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <h3 className="text-xs font-semibold text-gray-400 px-3 py-1">
            Active Contacts & History
          </h3>

          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.uid}
                onClick={() => {
                  onSelectContact({
                    name: user.fullName,
                    avatar: user.avatar,
                    online: true,
                  });
                  onClose();
                }}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm overflow-hidden flex-shrink-0 shadow-xs">
                    {user.avatar &&
                    typeof user.avatar === "string" &&
                    user.avatar.startsWith("data:") ? (
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{user.avatar || user.fullName?.[0] || "U"}</span>
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">
                    {user.fullName}
                  </h4>
                  <p className="text-xs text-gray-400 truncate">
                    Click to start conversation...
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-gray-400 text-xs">
              <MessageSquare size={36} className="mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-sm">No chats found</p>
              <p className="mt-1">
                Sign up with a second account to test messaging!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
