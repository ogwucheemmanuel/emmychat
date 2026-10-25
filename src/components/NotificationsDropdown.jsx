import React, { useState, useEffect } from 'react';
import { Bell, Heart, MessageCircle, Check, X } from 'lucide-react';
import { db, collection, query, where, onSnapshot, orderBy, updateDoc, doc } from '../firebase';

export default function NotificationsDropdown({ currentUser, darkMode, onClose }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    try {
      // Query notifications meant for the current logged-in user
      const q = query(
        collection(db, 'notifications'), 
        where('recipientId', '==', currentUser.uid || currentUser.email), 
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const liveNotifs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNotifications(liveNotifs);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [currentUser]);

  const markAsRead = async (id) => {
    try {
      const notifRef = doc(db, 'notifications', id);
      await updateDoc(notifRef, { read: true });
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  return (
    <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border overflow-hidden z-50 ${
      darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h3 className="font-bold text-sm">Notifications</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
          <X size={16} />
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                notif.read 
                  ? darkMode ? 'bg-gray-900/40 text-gray-400' : 'bg-white text-gray-600' 
                  : darkMode ? 'bg-emerald-950/20 text-white' : 'bg-emerald-50/50 text-gray-900'
              }`}
            >
              {/* Sender Avatar */}
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden flex-shrink-0">
                {notif.senderAvatar && notif.senderAvatar.startsWith('data:') ? (
                  <img src={notif.senderAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  notif.senderAvatar || notif.senderName?.[0] || 'U'
                )}
              </div>

              {/* Content */}
              <div className="flex-1 text-xs">
                <p className="font-medium leading-relaxed">{notif.text}</p>
                <span className="text-[10px] text-gray-400 mt-1 block">Just now</span>
              </div>

              {/* Unread indicator dot */}
              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0 mt-1.5" />
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-400 text-xs">
            <Bell size={28} className="mx-auto mb-2 opacity-40 text-emerald-500" />
            <p>No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}