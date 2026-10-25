import React, { useRef } from "react";
import {
  Camera,
  Edit3,
  Calendar,
  Heart,
  MessageCircle,
  Share2,
  Grid,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { db, doc, updateDoc } from "../firebase";

export default function ProfileView({
  userPosts,
  darkMode,
  currentUser,
  setCurrentUser,
  setActiveTab,
}) {
  const fileInputRef = useRef(null);

  // Handle direct Cover Photo upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser?.uid) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;

      // Update state locally immediately
      if (setCurrentUser) {
        setCurrentUser((prev) => ({ ...prev, coverPhoto: base64Image }));
      }

      // Update Firestore database
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, { coverPhoto: base64Image });
        console.log("Cover photo successfully saved to Firestore!");
      } catch (err) {
        console.error("Error updating cover photo in Firestore:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* Profile Header Card */}
      <div
        className={`rounded-2xl shadow-sm border overflow-hidden ${
          darkMode
            ? "bg-gray-900 border-gray-800 text-white"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        {/* Cover Photo Banner */}
        <div className="h-48 sm:h-64 relative bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 overflow-hidden">
          {currentUser?.coverPhoto ? (
            <img
              src={currentUser.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600" />
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCoverUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Clickable Button to Trigger Upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-4 right-4 bg-black/70 hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 backdrop-blur-md transition-colors shadow-lg cursor-pointer z-10"
          >
            <Camera size={16} /> Edit Cover Photo
          </button>
        </div>

        {/* Profile Info Section */}
        <div className="px-4 sm:px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 sm:-mt-20 mb-4 gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              {/* Profile Avatar */}
              <div className="relative w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 shadow-xl overflow-hidden bg-emerald-600 flex items-center justify-center text-white text-3xl font-bold">
                {currentUser?.avatar &&
                typeof currentUser.avatar === "string" &&
                currentUser.avatar.startsWith("data:") ? (
                  <img
                    src={currentUser.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{currentUser?.avatar || "OE"}</span>
                )}
              </div>

              <div className="pt-2 sm:pt-0">
                <h1 className="text-xl sm:text-2xl font-bold">
                  {currentUser?.fullName || "Ogwuche Emmanuel"}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                  @{currentUser?.username || "emmycoder"}
                </p>
              </div>
            </div>

            {/* Edit Profile Settings Button */}
            <button
              onClick={() => setActiveTab && setActiveTab("account")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-md"
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          </div>

          {/* Bio & Details */}
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-xl text-center sm:text-left mb-4">
            {currentUser?.bio ||
              "Full-Stack Web Developer & UI/UX enthusiast building real-world social platforms."}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-4">
            <div className="flex items-center gap-1.5">
              <Users size={15} />
              <span className="font-semibold text-gray-900 dark:text-white">
                1.2K
              </span>{" "}
              friends
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={15} />
              <span>Joined October 2026</span>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-t border-gray-200 dark:border-gray-800 px-4 sm:px-6">
          <button className="py-3 px-4 text-xs sm:text-sm font-bold border-b-2 border-emerald-600 text-emerald-600 flex items-center gap-2">
            <Grid size={16} /> Posts ({userPosts?.length || 0})
          </button>
        </div>
      </div>

      {/* User's Posts Feed */}
      <div className="space-y-4">
        {userPosts && userPosts.length > 0 ? (
          userPosts.map((post) => (
            <div
              key={post.id}
              className={`p-4 rounded-2xl shadow-sm border ${darkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900"}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold overflow-hidden">
                  {post.avatar &&
                  typeof post.avatar === "string" &&
                  post.avatar.startsWith("data:") ? (
                    <img
                      src={post.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{post.avatar || "OE"}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">
                    {post.author}
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    {post.timestamp}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm mb-3">{post.content}</p>

              {post.image && (
                <div className="rounded-xl overflow-hidden mb-3 max-h-96 bg-gray-100 dark:bg-gray-800">
                  <img
                    src={post.image}
                    alt="Post media"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">
                <button className="flex items-center gap-1 hover:text-emerald-600">
                  <Heart size={16} /> {post.likes} Likes
                </button>
                <button className="flex items-center gap-1 hover:text-emerald-600">
                  <MessageCircle size={16} /> Comment
                </button>
                <button className="flex items-center gap-1 hover:text-emerald-600">
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>
          ))
        ) : (
          <div
            className={`text-center py-12 rounded-2xl border shadow-sm ${darkMode ? "bg-gray-900 border-gray-800 text-gray-400" : "bg-white border-gray-200 text-gray-500"}`}
          >
            <ImageIcon size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">No posts yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Share something on your feed to see it here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
