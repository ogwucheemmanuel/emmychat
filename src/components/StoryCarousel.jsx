import React, { useState, useEffect } from 'react';
import { Plus, Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { db, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from '../firebase';

export default function StoryCarousel({ darkMode, currentUser }) {
  const [groupedStories, setGroupedStories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // State for viewing a user's stories in fullscreen
  const [activeUserStories, setActiveUserStories] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  // Compress image helper to prevent 1MB Firestore limit
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

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Fetch real-time stories and group them by author
  useEffect(() => {
    try {
      const q = query(collection(db, 'stories'), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const rawStories = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Group stories by author name so a user with multiple stories only shows 1 card
        const groupedMap = {};
        rawStories.forEach(story => {
          const authorKey = story.author || 'Anonymous';
          if (!groupedMap[authorKey]) {
            groupedMap[authorKey] = {
              author: authorKey,
              avatar: story.avatar,
              stories: []
            };
          }
          groupedMap[authorKey].stories.push(story);
        });

        setGroupedStories(Object.values(groupedMap));
      }, (error) => {
        console.warn("Firestore stories listener warning:", error);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up stories listener:", err);
    }
  }, []);

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressed = await compressImage(file, 600, 800, 0.7);
      setSelectedImage(compressed);
    }
  };

  const handleUploadStory = async (e) => {
    e.preventDefault();
    if (!selectedImage || !currentUser) return;

    try {
      await addDoc(collection(db, 'stories'), {
        author: currentUser.fullName,
        avatar: currentUser.avatar || 'OE',
        image: selectedImage,
        timestamp: serverTimestamp()
      });
      setSelectedImage(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error uploading story:', err);
    }
  };

  return (
    <>
      {/* Unified Card Container for Stories */}
      <div className={`p-4 rounded-2xl shadow-sm border mb-4 ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Stories
        </h3>

        {/* Horizontal Scrolling Row */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          
          {/* Create Story Button Card */}
          <div 
            onClick={() => setIsModalOpen(true)}
            className={`flex-shrink-0 w-28 h-44 rounded-xl border flex flex-col items-center justify-between p-3 cursor-pointer transition-transform hover:scale-[1.02] ${
              darkMode ? 'bg-gray-800/60 border-gray-700 hover:bg-gray-800' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md mt-2">
              <Plus size={20} />
            </div>
            <div className="text-center">
              <p className="font-bold text-xs">Create Story</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Share a photo</p>
            </div>
          </div>

          {/* Grouped User Story Cards */}
          {groupedStories.map((group, idx) => {
            const latestStory = group.stories[0]; // Most recent story thumbnail
            const uniqueKey = latestStory?.id || `${group.author}-${idx}`;

            return (
              <div 
                key={uniqueKey}
                onClick={() => {
                  setActiveUserStories(group.stories);
                  setCurrentStoryIndex(0);
                }}
                className="flex-shrink-0 w-28 h-44 rounded-xl relative overflow-hidden cursor-pointer shadow-sm group transition-transform hover:scale-[1.02]"
              >
                {latestStory?.image ? (
                  <img src={latestStory.image} alt={group.author} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-xs">
                    {group.author}
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

                {/* Author Avatar */}
                <div className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full border-2 border-emerald-600 bg-emerald-600 text-white flex items-center justify-center text-xs font-bold overflow-hidden shadow-md">
                  {group.avatar && typeof group.avatar === 'string' && group.avatar.startsWith('data:') ? (
                    <img src={group.avatar} alt={group.author} className="w-full h-full object-cover" />
                  ) : (
                    <span>{group.avatar && group.avatar.length <= 3 ? group.avatar : (group.author?.[0] || 'U')}</span>
                  )}
                </div>

                {/* Author Name and Count */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <p className="text-white font-bold text-xs truncate drop-shadow-md">{group.author}</p>
                  {group.stories.length > 1 && (
                    <p className="text-[9px] text-emerald-300 font-medium">+{group.stories.length - 1} more</p>
                  )}
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* Create Story Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl border p-5 ${
            darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800 mb-4">
              <h3 className="font-bold text-base">Create a Story</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadStory} className="space-y-4">
              {selectedImage ? (
                <div className="relative h-64 rounded-xl overflow-hidden bg-black">
                  <img src={selectedImage} alt="Preview" className="w-full h-full object-contain" />
                  <button 
                    type="button" 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full text-xs"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                  darkMode ? 'border-gray-700 hover:border-emerald-500 bg-gray-800/40' : 'border-gray-300 hover:border-emerald-500 bg-gray-50'
                }`}>
                  <Camera size={32} className="text-emerald-500 mb-2" />
                  <span className="text-xs font-semibold">Click to upload story image</span>
                  <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                </label>
              )}

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
                  disabled={!selectedImage}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md"
                >
                  Post Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Story Viewer */}
      {activeUserStories && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-sm h-[80vh] bg-black rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl">
            
            {/* Top Bar / Progress Indicators */}
            <div className="absolute top-0 inset-x-0 p-4 flex flex-col gap-2 bg-gradient-to-b from-black/80 to-transparent z-10">
              <div className="flex items-center gap-1">
                {activeUserStories.map((story, idx) => (
                  <div key={story.id || idx} className={`h-1 flex-1 rounded-full ${idx === currentStoryIndex ? 'bg-white' : 'bg-white/40'}`} />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                    {activeUserStories[0].avatar && activeUserStories[0].avatar.startsWith('data:') ? (
                      <img src={activeUserStories[0].avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      activeUserStories[0].avatar || activeUserStories[0].author[0]
                    )}
                  </div>
                  <span className="text-white font-bold text-xs">{activeUserStories[0].author}</span>
                </div>
                <button onClick={() => setActiveUserStories(null)} className="text-white p-1.5 rounded-full bg-black/40 hover:bg-black/70">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Story Image */}
            <div className="w-full h-full flex items-center justify-center relative">
              <img src={activeUserStories[currentStoryIndex].image} alt="Story" className="w-full h-full object-contain" />

              {/* Navigation Arrows */}
              {currentStoryIndex > 0 && (
                <button 
                  onClick={() => setCurrentStoryIndex(currentStoryIndex - 1)}
                  className="absolute left-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              {currentStoryIndex < activeUserStories.length - 1 && (
                <button 
                  onClick={() => setCurrentStoryIndex(currentStoryIndex + 1)}
                  className="absolute right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}