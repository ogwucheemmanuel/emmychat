import React from "react";
import { Home, Tv, Store, Users, User, ShieldCheck, Heart } from "lucide-react";
import logoImage from "../assets/logo.PNG";

export default function Footer({ activeTab, setActiveTab, darkMode }) {
  const mobileNavTabs = [
    { id: "feed", icon: Home, label: "Home" },
    { id: "watch", icon: Tv, label: "Watch" },
    { id: "marketplace", icon: Store, label: "Marketplace" },
    { id: "groups", icon: Users, label: "Groups" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <>
      {/* 1. Desktop & Tablet Footer */}
      <footer
        className={`mt-12 border-t text-xs transition-colors hidden sm:block ${
          darkMode
            ? "bg-gray-900 border-gray-800 text-gray-400"
            : "bg-white border-gray-200 text-gray-500"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-6">
            {/* Column 1: Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md shadow-emerald-600/20 ring-2 ring-emerald-600/30 group-hover:ring-emerald-600 transition-all">
                  <img
                    src={logoImage}
                    alt="Emmychat Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  EmmyChat
                </span>
              </div>
              <p className="leading-relaxed">
                Connect, share, and discover with communities around the world
                in real-time.
              </p>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-2.5">
                Features
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab("feed")}
                    className="hover:underline"
                  >
                    News Feed
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("watch")}
                    className="hover:underline"
                  >
                    Watch Videos
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("marketplace")}
                    className="hover:underline"
                  >
                    Marketplace
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("groups")}
                    className="hover:underline"
                  >
                    Groups & Communities
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Resources & Community */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-2.5">
                Community
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:underline">
                    Developer API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Help & Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Safety Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Creator Hub
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-2.5">
                Legal & Policy
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:underline">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Cookie Settings
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Ad Choices
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-800 my-4" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-[11px]">
            <p>© 2026 EmmyChat, Inc. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Built with{" "}
              <Heart size={12} className="text-red-500 fill-red-500" /> for
              Emmycoder Developers
            </p>
          </div>
        </div>
      </footer>

      {/* 2. Mobile Sticky Bottom Navigation Bar */}
      <nav
        className={`fixed bottom-0 inset-x-0 z-40 sm:hidden border-t flex items-center justify-around h-14 backdrop-blur-md transition-colors ${
          darkMode
            ? "bg-gray-900/95 border-gray-800 text-gray-400"
            : "bg-white/95 border-gray-200 text-gray-600"
        }`}
      >
        {mobileNavTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? "text-emerald-600 dark:text-blue-400"
                  : "hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium mt-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
