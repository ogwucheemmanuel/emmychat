import React from "react";
import {
  Users,
  Store,
  Video,
  Bookmark,
  Clock,
  Calendar,
  Shield,
  ChevronDown,
  Code,
} from "lucide-react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  darkMode,
  currentUser,
}) {
  return (
    <aside
      className={`sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto px-2 space-y-2 text-xs sm:text-sm hidden lg:block w-64 ${
        darkMode ? "text-gray-200" : "text-gray-800"
      }`}
    >
      {/* Profile Shortcut */}
      <div
        onClick={() => setActiveTab("profile")}
        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
          darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200/60"
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden flex-shrink-0 shadow-xs">
          {currentUser?.avatar &&
          typeof currentUser.avatar === "string" &&
          currentUser.avatar.startsWith("data:") ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>
              {currentUser?.avatar || currentUser?.fullName?.[0] || "O"}
            </span>
          )}
        </div>
        <span className="font-bold text-xs sm:text-sm truncate">
          {currentUser?.fullName || "Ogwuche Emmanuel"}
        </span>
      </div>

      {/* Navigation Links */}
      <div className="space-y-1 pt-2 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("feed")}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors font-medium ${
            activeTab === "feed"
              ? darkMode
                ? "bg-gray-800 text-emerald-400"
                : "bg-gray-200 text-emerald-600"
              : darkMode
                ? "hover:bg-gray-800"
                : "hover:bg-gray-200/60"
          }`}
        >
          <Users size={20} className="text-emerald-500" />
          <span>Friends</span>
        </button>

        <button
          onClick={() => setActiveTab("marketplace")}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors font-medium ${
            activeTab === "marketplace"
              ? darkMode
                ? "bg-gray-800 text-emerald-400"
                : "bg-gray-200 text-emerald-600"
              : darkMode
                ? "hover:bg-gray-800"
                : "hover:bg-gray-200/60"
          }`}
        >
          <Store size={20} className="text-emerald-500" />
          <span>Marketplace</span>
        </button>

        <button
          onClick={() => setActiveTab("watch")}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors font-medium ${
            activeTab === "watch"
              ? darkMode
                ? "bg-gray-800 text-emerald-400"
                : "bg-gray-200 text-emerald-600"
              : darkMode
                ? "hover:bg-gray-800"
                : "hover:bg-gray-200/60"
          }`}
        >
          <Video size={20} className="text-emerald-500" />
          <span>Watch</span>
        </button>

        <button
          onClick={() => setActiveTab("feed")}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors font-medium ${
            darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200/60"
          }`}
        >
          <Bookmark size={20} className="text-purple-500" />
          <span>Saved</span>
        </button>

        <button
          onClick={() => setActiveTab("feed")}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors font-medium ${
            darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200/60"
          }`}
        >
          <Clock size={20} className="text-emerald-400" />
          <span>Memories</span>
        </button>

        <button
          onClick={() => setActiveTab("feed")}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors font-medium ${
            darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200/60"
          }`}
        >
          <Calendar size={20} className="text-red-500" />
          <span>Events</span>
        </button>

        <button
          onClick={() => setActiveTab("account")}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors font-medium ${
            activeTab === "account"
              ? darkMode
                ? "bg-gray-800 text-emerald-400"
                : "bg-gray-200 text-emerald-600"
              : darkMode
                ? "hover:bg-gray-800"
                : "hover:bg-gray-200/60"
          }`}
        >
          <Shield size={20} className="text-emerald-600" />
          <span>Settings & Privacy</span>
        </button>

        <button
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors font-medium ${
            darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200/60"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500">
            <ChevronDown size={16} />
          </div>
          <span>See More</span>
        </button>
      </div>

      {/* Shortcuts Section */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <h3 className="font-semibold text-gray-400 text-xs px-2">
          Your Shortcuts
        </h3>
        <div
          className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
            darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200/60"
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-xs">
            <Code size={18} />
          </div>
          <span className="font-semibold text-xs sm:text-sm truncate">
            React Developers Community
          </span>
        </div>
      </div>
    </aside>
  );
}
