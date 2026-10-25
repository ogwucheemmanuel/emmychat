import React, { useState, useEffect } from "react";
import { Search, MoreHorizontal, Video } from "lucide-react";
import { db, collection, onSnapshot } from "../firebase";

export default function RightSidebar({
  darkMode,
  onSelectContact,
  currentUser,
}) {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all registered users live from Firestore
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(
        collection(db, "users"),
        (snapshot) => {
          const liveUsers = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            // Exclude the currently logged-in user from their own contact list
            .filter((u) => u.uid !== currentUser?.uid);

          setUsers(liveUsers);
        },
        (error) => {
          console.warn("Error fetching contacts:", error);
        },
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up users listener:", err);
    }
  }, [currentUser]);

  // Filter contacts based on search input
  const filteredUsers = users.filter((user) =>
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <aside
      className={`sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto px-2 space-y-6 text-xs sm:text-sm hidden xl:block w-72 ${
        darkMode ? "text-gray-200" : "text-gray-800"
      }`}
    >
      {/* Sponsored Section */}
      <div
        className={`p-3 rounded-2xl border shadow-xs ${
          darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        <h3 className="font-semibold text-gray-400 text-xs mb-3">Sponsored</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-16 h-16 rounded-xl bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-600 flex-shrink-0">
              Ad
            </div>
            <div>
              <h4 className="font-bold text-xs group-hover:underline">
                Build Full-Stack Apps
              </h4>
              <p className="text-[11px] text-gray-400">
                Master React, Vite & Firebase today.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contacts List Header */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="font-semibold text-gray-400 text-xs">
            Contacts ({filteredUsers.length})
          </span>
          <div className="flex items-center gap-1 text-gray-400">
            <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
              <Video size={15} />
            </button>
            <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
              <Search size={15} />
            </button>
            <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
              <MoreHorizontal size={15} />
            </button>
          </div>
        </div>

        {/* Search Contacts Input */}
        <div
          className={`mb-3 px-2.5 py-1.5 rounded-xl border flex items-center gap-2 ${
            darkMode
              ? "bg-gray-900 border-gray-800 text-white"
              : "bg-white border-gray-200 text-gray-900"
          }`}
        >
          <Search size={14} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-xs placeholder-gray-400"
          />
        </div>

        {/* Live Users List */}
        <div className="space-y-1">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.uid}
                onClick={() =>
                  onSelectContact({
                    name: user.fullName,
                    avatar: user.avatar,
                    online: true,
                  })
                }
                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${
                  darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200/60"
                }`}
              >
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden flex-shrink-0 shadow-xs">
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
                  {/* Online indicator */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-950" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs truncate">
                    {user.fullName}
                  </h4>
                  <p className="text-[10px] text-gray-400 truncate">
                    @{user.username || user.email?.split("@")[0]}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-400 text-xs">
              <p>No other users found.</p>
              <p className="mt-0.5 text-[10px]">
                Sign up with another account to test live chat!
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
