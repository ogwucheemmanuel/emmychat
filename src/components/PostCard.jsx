import React, { useState } from 'react';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Bookmark, Send } from 'lucide-react';
import { db, doc, updateDoc, arrayUnion, arrayRemove } from '../firebase';

export default function PostCard({ post, darkMode, currentUser }) {
  // Check if current user has already liked this post based on array of UIDs
  const likedByUsers = post.likedBy || [];
  const [hasLiked, setHasLiked] = useState(currentUser ? likedByUsers.includes(currentUser.uid) : false);
  const [likesCount, setLikesCount] = useState(post.likes || likedByUsers.length || 0);
  
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Handle Like / Unlike in Firestore
  const handleLike = async () => {
    if (!currentUser || !post.id) return;

    const postRef = doc(db, 'posts', post.id);
    const newLikedState = !hasLiked;

    // Optimistic UI update for snappy response
    setHasLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

    try {
      if (newLikedState) {
        await updateDoc(postRef, {
          likedBy: arrayUnion(currentUser.uid),
          likes: likesCount + 1
        });
      } else {
        await updateDoc(postRef, {
          likedBy: arrayRemove(currentUser.uid),
          likes: Math.max(0, likesCount - 1)
        });
      }
    } catch (err) {
      console.error('Error updating like in Firestore:', err);
      // Revert on failure
      setHasLiked(!newLikedState);
      setLikesCount(post.likes || 0);
    }
  };

  // Handle Adding Comment in Firestore
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || !post.id) return;

    const commentData = {
      id: Date.now().toString(),
      author: currentUser.fullName,
      avatar: currentUser.avatar || 'OE',
      text: newComment.trim(),
      timestamp: new Date().toISOString()
    };

    setIsSubmittingComment(true);
    const updatedComments = [...comments, commentData];
    
        await addDoc(collection(db, 'notifications'), {
      recipientId: post.authorUid, // UID of the person who made the post
      senderName: currentUser.fullName,
      senderAvatar: currentUser.avatar || '',
      type: 'like', // 'like', 'comment', 'message'
      text: `${currentUser.fullName} liked your post.`,
      read: false,
      timestamp: serverTimestamp()
    });
    // Optimistic UI update
    setComments(updatedComments);
    setNewComment('');

    try {
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, {
        comments: updatedComments
      });
    } catch (err) {
      console.error('Error adding comment to Firestore:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className={`rounded-2xl shadow-sm border mb-4 transition-colors ${
      darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
    }`}>
      
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm overflow-hidden flex-shrink-0 shadow-xs">
            {post.avatar && typeof post.avatar === 'string' && post.avatar.startsWith('data:') ? (
              <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" />
            ) : (
              <span>{post.avatar && post.avatar.length <= 3 ? post.avatar : (post.author?.[0] || 'U')}</span>
            )}
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm">{post.author}</h4>
            <p className="text-[10px] text-gray-400">{post.timestamp || 'Just now'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          <button className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Bookmark size={16} />
          </button>
          <button className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
        {post.content}
      </div>

      {/* Post Image Attachment */}
      {post.image && (
        <div className="w-full max-h-[450px] overflow-hidden bg-black/5 dark:bg-black/40">
          <img src={post.image} alt="Post attachment" className="w-full h-full object-cover max-h-[450px]" />
        </div>
      )}

      {/* Likes & Comments Count Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between text-xs text-gray-400 border-b border-gray-100 dark:border-gray-800/60">
        <div className="flex items-center gap-1.5">
          <span className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-[9px] text-white">👍</span>
            <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[9px] text-white">❤️</span>
          </span>
          <span>{likesCount}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{comments.length} comments</span>
          <span>{post.shares || 0} shares</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-2 py-1 grid grid-cols-3 border-b border-gray-100 dark:border-gray-800/60">
        <button 
          onClick={handleLike}
          className={`py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-colors ${
            hasLiked 
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' 
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <ThumbsUp size={16} /> Like
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className="py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <MessageCircle size={16} /> Comment
        </button>

        <button className="py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Share2 size={16} /> Share
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="p-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/40 rounded-b-2xl">
          <form onSubmit={handleAddComment} className="flex items-center gap-2">
            <input 
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className={`flex-1 px-3.5 py-2 rounded-full text-xs outline-none border transition-colors ${
                darkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-emerald-500' : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'
              }`}
            />
            <button 
              type="submit"
              disabled={!newComment.trim() || isSubmittingComment}
              className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-colors shadow-xs"
            >
              <Send size={14} />
            </button>
          </form>

          <div className="space-y-2.5 pt-2">
            {comments.map((comment) => (
              <div key={comment.id} className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800 shadow-xs border border-gray-100'
              }`}>
                {/* Commenter Avatar */}
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] overflow-hidden flex-shrink-0">
                  {comment.avatar && typeof comment.avatar === 'string' && comment.avatar.startsWith('data:') ? (
                    <img src={comment.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{comment.avatar || comment.author?.[0] || 'U'}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold">{comment.author}</span>
                    <span className="text-[10px] text-gray-400">
                      {comment.timestamp ? new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}