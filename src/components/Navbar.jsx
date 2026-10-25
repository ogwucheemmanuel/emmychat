import React, { useState, useEffect } from "react";
import {
  Home,
  Video,
  ShoppingBag,
  User,
  MessageSquare,
  Bell,
  Sun,
  Moon,
  LogOut,
  Settings,
} from "lucide-react";
import NotificationsDropdown from "./NotificationsDropdown";
import { db, collection, query, where, onSnapshot } from "../firebase";
import logoImage from "../assets/logo.PNG";

export default function Navbar({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  onLogout,
  currentUser,
  onOpenChat,
}) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Real-time unread notifications listener
  useEffect(() => {
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, "notifications"),
        where("recipientId", "==", currentUser.uid || currentUser.email),
        where("read", "==", false),
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setUnreadCount(snapshot.docs.length);
        },
        (err) => {
          console.warn("Notifications count listener warning:", err);
        },
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up notification listener:", err);
    }
  }, [currentUser]);

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        darkMode
          ? "bg-gray-900/95 border-gray-800 text-white"
          : "bg-white/95 border-gray-200 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
        {/* Brand Logo & Name (Left) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            onClick={() => setActiveTab("feed")}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            {/* Custom Logo Image */}
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md shadow-emerald-600/20 ring-2 ring-emerald-600/30 group-hover:ring-emerald-600 transition-all">
              <img
                src={logoImage}
                alt="Emmychat Logo"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Emmychat Gradient Brand Text */}
            <span className="font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
              Emmychat
            </span>
          </div>
        </div>

        {/* Desktop & Tablet Navigation Bar (Center) */}
        <nav className="hidden sm:flex items-center justify-center gap-1 sm:gap-2 flex-1 max-w-md">
          <button
            onClick={() => setActiveTab("feed")}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              activeTab === "feed"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title="Feed"
          >
            <Home size={18} />
            <span className="hidden md:inline">Feed</span>
          </button>

          <button
            onClick={() => setActiveTab("watch")}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              activeTab === "watch"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title="Watch"
          >
            <Video size={18} />
            <span className="hidden md:inline">Watch</span>
          </button>

          <button
            onClick={() => setActiveTab("marketplace")}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              activeTab === "marketplace"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title="Marketplace"
          >
            <ShoppingBag size={18} />
            <span className="hidden md:inline">Market</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              activeTab === "profile"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title="Profile"
          >
            <User size={18} />
            <span className="hidden md:inline">Profile</span>
          </button>
        </nav>

        {/* Action Controls (Right) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Messenger Modal Button */}
          <button
            onClick={onOpenChat}
            className={`p-2 rounded-full transition-colors relative ${
              darkMode
                ? "hover:bg-gray-800 text-gray-300"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            title="Messenger"
          >
            <MessageSquare size={18} />
          </button>

          {/* Notifications Dropdown Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowProfileMenu(false);
              }}
              className={`p-2 rounded-full transition-colors relative ${
                darkMode
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Menu */}
            {showNotifDropdown && (
              <NotificationsDropdown
                currentUser={currentUser}
                darkMode={darkMode}
                onClose={() => setShowNotifDropdown(false)}
              />
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full transition-colors ${
              darkMode
                ? "hover:bg-gray-800 text-yellow-400"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            title="Toggle Theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Profile Avatar */}
          <div className="relative ml-0.5">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifDropdown(false);
              }}
              className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden shadow-xs ring-2 ring-emerald-600/20 hover:ring-emerald-600 transition-all"
            >
              {currentUser?.avatar &&
              typeof currentUser.avatar === "string" &&
              currentUser.avatar.startsWith("data:") ? (
                <img
                  src={currentUser.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                currentUser?.avatar || currentUser?.fullName?.[0] || "O"
              )}
            </button>

            {/* Profile Menu Dropdown */}
            {showProfileMenu && (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border p-2 z-50 ${
                  darkMode
                    ? "bg-gray-900 border-gray-800 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                  <p className="font-bold text-xs truncate">
                    {currentUser?.fullName}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {currentUser?.email}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveTab("profile");
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <User size={14} /> My Profile
                </button>

                <button
                  onClick={() => {
                    setActiveTab("account");
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Settings size={14} /> Account Settings
                </button>

                <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
