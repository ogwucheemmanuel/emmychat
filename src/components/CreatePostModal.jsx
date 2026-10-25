import React, { useState } from "react";
import { X, Image as ImageIcon, Smile, Tag, MapPin } from "lucide-react";

export default function CreatePostModal({
  isOpen,
  onClose,
  onAddPost,
  darkMode,
}) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);

  if (!isOpen) return null;

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert local image file to Data URL for instant rendering & saving
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) return;

    onAddPost({
      content,
      image: imageUrl || null,
    });

    // Reset form & close
    setContent("");
    setImageUrl("");
    setShowImageInput(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          darkMode
            ? "bg-gray-900 border-gray-800 text-white"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-base font-bold text-center flex-1">
            Create Post
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <textarea
            rows={4}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent border-none outline-none resize-none text-sm sm:text-base placeholder-gray-400"
          />

          {/* Image Preview Area */}
          {imageUrl && (
            <div className="relative rounded-xl overflow-hidden max-h-60 border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800">
              <img
                src={imageUrl}
                alt="Upload preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-black"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Optional Image Input Bar */}
          {showImageInput && !imageUrl && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Paste image URL here..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-gray-100 dark:bg-gray-800 border-none outline-none"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>OR select a file:</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>
            </div>
          )}

          {/* Add-ons Container */}
          <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs font-semibold">Add to your post</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-green-500"
                title="Add Photo"
              >
                <ImageIcon size={20} />
              </button>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-yellow-500"
              >
                <Smile size={20} />
              </button>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-emerald-500"
              >
                <Tag size={20} />
              </button>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-red-500"
              >
                <MapPin size={20} />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!content.trim() && !imageUrl}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-md"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
