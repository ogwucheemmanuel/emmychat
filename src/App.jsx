import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import StoryCarousel from './components/StoryCarousel';
import CreatePostModal from './components/CreatePostModal';
import PostCard from './components/PostCard';
import ChatWindow from './components/ChatWindow';
import MessengerModal from './components/MessengerModal';
import ProfileView from './components/ProfileView';
import MarketplaceView from './components/MarketplaceView';
import WatchView from './components/WatchView';
import AccountSettings from './components/AccountSettings';
import Footer from './components/Footer';
import Auth from './components/Auth';
import { 
  auth, 
  db, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  signOut, 
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc 
} from './firebase';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [darkMode, setDarkMode] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [activeChatContact, setActiveChatContact] = useState(null);

  // Safely monitor authentication state & fetch user profile from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const basicUser = {
          uid: user.uid,
          email: user.email,
          fullName: user.displayName || user.email.split('@')[0],
          username: user.email.split('@')[0],
          avatar: (user.email[0] || 'O').toUpperCase(),
          coverPhoto: '',
          bio: '',
        };

        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setCurrentUser({ uid: user.uid, ...userDocSnap.data() });
          } else {
            await setDoc(userDocRef, basicUser);
            setCurrentUser(basicUser);
          }
        } catch (err) {
          console.warn("Firestore access fallback:", err);
          setCurrentUser(basicUser);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync real-time posts from Firestore database
  useEffect(() => {
    if (!currentUser) return;

    try {
      const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const livePosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp 
            ? new Date(doc.data().timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            : 'Just now'
        }));
        setPosts(livePosts);
      }, (error) => {
        console.warn("Firestore snapshot warning:", error);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up post listener:", err);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const handleAddPost = async (newPost) => {
    try {
      await addDoc(collection(db, 'posts'), {
        author: currentUser.fullName,
        authorUid: currentUser.uid,
        avatar: currentUser.avatar,
        content: newPost.content,
        image: newPost.image || null,
        likes: 0,
        likedBy: [],
        comments: [],
        shares: 0,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error('Error adding post to Firestore:', err);
    }
  };

  // Render Auth screen if user is logged out
  if (!currentUser) {
    return <Auth onLogin={setCurrentUser} darkMode={darkMode} />;
  }

  // Filter posts created by the current logged-in user for profile view
  const userPosts = posts.filter(p => p.author === currentUser.fullName);

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
      
      {/* Navigation Header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        onLogout={handleLogout}
        currentUser={currentUser}
        onOpenChat={() => setIsMessengerOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 flex justify-center gap-6 pt-2 sm:pt-4 flex-1 w-full">
        
        {/* Left Navigation Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            darkMode={darkMode} 
            currentUser={currentUser} 
          />
        </div>

        {/* Main Feed / Content View */}
        <main className="w-full max-w-2xl min-w-0 pb-24 sm:pb-10">
          {activeTab === 'feed' && (
            <>
              {/* Stories Carousel */}
              <StoryCarousel darkMode={darkMode} currentUser={currentUser} />

              {/* Create Post Card */}
              <div className={`p-3 sm:p-4 rounded-2xl shadow-sm border mb-3 sm:mb-4 ${
                darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-xs sm:text-sm overflow-hidden">
                    {currentUser.avatar && typeof currentUser.avatar === 'string' && currentUser.avatar.startsWith('data:') ? (
                      <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      currentUser.avatar || 'OE'
                    )}
                  </div>
                  <button
                    onClick={() => setIsPostModalOpen(true)}
                    className={`flex-1 text-left px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                      darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    What's on your mind, {currentUser.fullName?.split(' ')[0]}?
                  </button>
                </div>
              </div>

              {/* Real-time Posts Stream */}
              <div className="space-y-3 sm:space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} darkMode={darkMode} currentUser={currentUser} />
                ))}
              </div>
            </>
          )}

          {/* Watch View Tab */}
          {activeTab === 'watch' && <WatchView darkMode={darkMode} currentUser={currentUser} />}

          {/* Profile View Tab */}
          {activeTab === 'profile' && (
            <ProfileView 
              userPosts={userPosts} 
              darkMode={darkMode} 
              currentUser={currentUser} 
              setCurrentUser={setCurrentUser}
              setActiveTab={setActiveTab} 
            />
          )}

          {/* Marketplace View Tab */}
          {activeTab === 'marketplace' && <MarketplaceView darkMode={darkMode} />}

          {/* Account Settings Tab */}
          {activeTab === 'account' && (
            <AccountSettings 
              darkMode={darkMode} 
              setDarkMode={setDarkMode} 
              currentUser={currentUser} 
              setCurrentUser={setCurrentUser} 
            />
          )}
        </main>

        {/* Right Contacts Sidebar */}
        <div className="hidden xl:block w-72 flex-shrink-0">
          <RightSidebar 
            darkMode={darkMode} 
            currentUser={currentUser}
            onSelectContact={(contact) => setActiveChatContact(contact)} 
          />
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal 
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onAddPost={handleAddPost}
        darkMode={darkMode}
      />

      {/* Messenger Modal Inbox */}
      <MessengerModal 
        isOpen={isMessengerOpen}
        onClose={() => setIsMessengerOpen(false)}
        darkMode={darkMode}
        currentUser={currentUser}
        onSelectContact={(contact) => setActiveChatContact(contact)}
      />

      {/* Floating Chat Box */}
      {activeChatContact && (
        <ChatWindow 
          contact={activeChatContact} 
          onClose={() => setActiveChatContact(null)} 
          darkMode={darkMode} 
          currentUser={currentUser}
        />
      )}

      {/* Mobile Footer Bar */}
      <Footer activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} />
    </div>
  );
}