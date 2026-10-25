import React, { useState, useEffect } from "react";
import {
  Video,
  Plus,
  ThumbsUp,
  MessageCircle,
  Share2,
  Play,
  Camera,
  X,
} from "lucide-react";
import {
  db,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "../firebase";

export default function WatchView({ darkMode, currentUser }) {
  const [videos, setVideos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Fetch real-time videos from Firestore
  useEffect(() => {
    try {
      const q = query(collection(db, "videos"), orderBy("timestamp", "desc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const liveVideos = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setVideos(liveVideos);
        },
        (error) => {
          console.warn("Firestore videos listener warning:", error);
        },
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up videos listener:", err);
    }
  }, []);

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoUrl.trim() || !currentUser) return;

    setIsUploading(true);
    try {
      await addDoc(collection(db, "videos"), {
        title: videoTitle,
        url: videoUrl,
        author: currentUser.fullName,
        avatar: currentUser.avatar || "OE",
        likes: 0,
        comments: [],
        timestamp: serverTimestamp(),
      });
      setVideoTitle("");
      setVideoUrl("");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error uploading video:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Watch Header & Upload Button */}
      <div
        className={`p-4 rounded-2xl shadow-sm border flex items-center justify-between ${
          darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Video size={22} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">Watch Video Feed</h2>
            <p className="text-xs text-gray-400">
              Discover and share videos with the community
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
        >
          <Plus size={16} /> Upload Video
        </button>
      </div>

      {/* Videos Stream */}
      <div className="space-y-4">
        {videos.length > 0 ? (
          videos.map((video) => (
            <div
              key={video.id}
              className={`rounded-2xl shadow-sm border overflow-hidden ${
                darkMode
                  ? "bg-gray-900 border-gray-800 text-white"
                  : "bg-white border-gray-200 text-gray-900"
              }`}
            >
              {/* Author Info */}
              <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm overflow-hidden flex-shrink-0 shadow-xs">
                  {video.avatar &&
                  typeof video.avatar === "string" &&
                  video.avatar.startsWith("data:") ? (
                    <img
                      src={video.avatar}
                      alt={video.author}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{video.avatar || video.author?.[0] || "U"}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">
                    {video.author}
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    Shared a video • {video.timestamp ? "Recently" : "Just now"}
                  </p>
                </div>
              </div>

              {/* Video Title */}
              <div className="px-4 pb-3 text-xs sm:text-sm font-medium">
                {video.title}
              </div>

              {/* Video Player / Embed */}
              <div className="w-full bg-black aspect-video flex items-center justify-center overflow-hidden">
                {video.url.includes("youtube.com") ||
                video.url.includes("youtu.be") ? (
                  <iframe
                    src={video.url
                      .replace("watch?v=", "embed/")
                      .replace("youtu.be/", "youtube.com/embed/")}
                    title={video.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={video.url}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Actions Bar */}
              <div className="px-4 py-2.5 flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800/60">
                <span>{video.likes || 0} likes</span>
                <span>{video.comments?.length || 0} comments</span>
              </div>

              <div className="px-2 py-1 grid grid-cols-3 border-t border-gray-100 dark:border-gray-800/60">
                <button className="py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <ThumbsUp size={16} /> Like
                </button>
                <button className="py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <MessageCircle size={16} /> Comment
                </button>
                <button className="py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>
          ))
        ) : (
          <div
            className={`p-12 text-center rounded-2xl border ${
              darkMode
                ? "bg-gray-900 border-gray-800 text-gray-400"
                : "bg-white border-gray-200 text-gray-500"
            }`}
          >
            <Video
              size={40}
              className="mx-auto mb-3 opacity-40 text-emerald-500"
            />
            <p className="font-bold text-sm">No videos in the Watch feed yet</p>
            <p className="text-xs mt-1">
              Upload a YouTube link or video file to get started!
            </p>
          </div>
        )}
      </div>

      {/* Upload Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            className={`w-full max-w-md rounded-2xl shadow-2xl border p-5 ${
              darkMode
                ? "bg-gray-900 border-gray-800 text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800 mb-4">
              <h3 className="font-bold text-base">Upload a Video</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleVideoUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Video Title / Caption
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="What is this video about?"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition-colors ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white focus:border-emerald-500"
                      : "bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Video Link (YouTube URL or MP4 URL)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition-colors ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white focus:border-emerald-500"
                      : "bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500"
                  }`}
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Paste any YouTube watch link or direct video link.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md"
                >
                  {isUploading ? "Uploading..." : "Publish Video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
