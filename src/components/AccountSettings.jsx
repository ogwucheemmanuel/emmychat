import React, { useState } from "react";
import {
  Camera,
  Save,
  User,
  Mail,
  Shield,
  Moon,
  Sun,
  CheckCircle,
} from "lucide-react";
import { db, doc, updateDoc } from "../firebase";

export default function AccountSettings({
  darkMode,
  setDarkMode,
  currentUser,
  setCurrentUser,
}) {
  const [fullName, setFullName] = useState(currentUser?.fullName || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [avatar, setAvatar] = useState(currentUser?.avatar || "");
  const [coverPhoto, setCoverPhoto] = useState(currentUser?.coverPhoto || "");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Helper function to compress images before converting to base64 to prevent Firestore 1MB limits
  const compressImage = (file, maxWidth, maxHeight, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressedBase64 = await compressImage(file, 300, 300, 0.7);
      setAvatar(compressedBase64);
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressedBase64 = await compressImage(file, 1000, 400, 0.7);
      setCoverPhoto(compressedBase64);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentUser?.uid) return;

    setIsSaving(true);
    setErrorMsg("");
    setSuccessMessage("");

    const updatedData = {
      fullName,
      bio,
      avatar,
      coverPhoto,
    };

    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, updatedData);

      if (setCurrentUser) {
        setCurrentUser((prev) => ({ ...prev, ...updatedData }));
      }

      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setErrorMsg(
        err.message ||
          "Failed to save profile. Image might still be too large.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`max-w-2xl mx-auto p-4 sm:p-6 rounded-2xl shadow-sm border transition-colors ${
        darkMode
          ? "bg-gray-900 border-gray-800 text-white"
          : "bg-white border-gray-200 text-gray-900"
      }`}
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold">Account Settings</h2>
          <p className="text-xs text-gray-400">
            Manage your profile details and preferences
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-2 text-xs font-semibold">
          <CheckCircle size={16} /> {successMessage}
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Cover Photo & Avatar Customization */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Profile Imagery
          </label>

          {/* Cover Photo Preview */}
          <div className="h-36 sm:h-48 relative rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 overflow-hidden border border-gray-200 dark:border-gray-800">
            {coverPhoto ? (
              <img
                src={coverPhoto}
                alt="Cover Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/60 text-xs">
                No Cover Photo
              </div>
            )}
            <label className="absolute bottom-3 right-3 bg-black/70 hover:bg-black text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer backdrop-blur-md transition-colors">
              <Camera size={14} /> Change Cover
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Avatar Upload */}
          <div className="flex items-center gap-4 pt-2">
            <div className="relative w-20 h-20 rounded-full border-2 border-emerald-600 overflow-hidden bg-emerald-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
              {avatar &&
              typeof avatar === "string" &&
              avatar.startsWith("data:") ? (
                <img
                  src={avatar}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{avatar || fullName?.[0] || "O"}</span>
              )}
            </div>
            <div>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm">
                <Camera size={14} /> Change Avatar
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-gray-400 mt-1">
                Images are automatically compressed for fast loading.
              </p>
            </div>
          </div>
        </div>

        {/* Text Fields */}
        <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-800">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Personal Information
          </label>

          <div>
            <label className="block text-xs font-semibold mb-1 flex items-center gap-1.5">
              <User size={14} className="text-gray-400" /> Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition-colors ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-white focus:border-emerald-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500"
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 flex items-center gap-1.5">
              <Mail size={14} className="text-gray-400" /> Email (Read-Only)
            </label>
            <input
              type="email"
              disabled
              value={currentUser?.email || ""}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm opacity-60 cursor-not-allowed ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-gray-100 border-gray-200 text-gray-600"
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Bio</label>
            <textarea
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short bio about yourself..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition-colors resize-none ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-white focus:border-emerald-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500"
              }`}
            />
          </div>
        </div>

        {/* Appearance Preference */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
            Appearance
          </label>
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
              {darkMode ? (
                <Moon size={16} className="text-yellow-400" />
              ) : (
                <Sun size={16} className="text-orange-500" />
              )}
              <span>Dark Mode</span>
            </div>
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                darkMode
                  ? "bg-emerald-600 justify-end"
                  : "bg-gray-300 justify-start"
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors shadow-md cursor-pointer"
          >
            <Save size={16} /> {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
