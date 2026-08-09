'use client';

import { useState, useEffect } from 'react';
import { X, Send, Users, BookOpen } from 'lucide-react';
import { db } from '@/lib/db';
import type { Book, Profile } from '@/lib/types';
import { useAppStore } from '@/lib/store';

interface BookDetailsModalProps {
  book: Book;
  onClose: () => void;
}

export function BookDetailsModal({ book, onClose }: BookDetailsModalProps) {
  const [friendsReading, setFriendsReading] = useState<Profile[]>([]);
  const [following, setFollowing] = useState<Profile[]>([]);
  const [isRecommending, setIsRecommending] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  
  const { userProfile } = useAppStore();

  useEffect(() => {
    if (!userProfile) return;
    
    // Fetch friends reading the same book
    db.social.getFriendsReadingSameBook(userProfile.id, book.title).then(setFriendsReading);
    
    // Fetch following for recommendations
    db.social.getFollowing(userProfile.id).then(setFollowing);
  }, [userProfile, book.title]);

  const handleRecommend = async () => {
    if (!selectedFriendId || !userProfile) return;
    setIsSending(true);
    try {
      await db.social.sendRecommendation({
        recommenderId: userProfile.id,
        receiverId: selectedFriendId,
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author,
        coverUrl: book.coverUrl,
        message: message.trim(),
      });
      setSendSuccess(true);
      setTimeout(() => {
        setIsRecommending(false);
        setSendSuccess(false);
        setMessage('');
        setSelectedFriendId('');
      }, 2000);
    } catch (e) {
      console.error(e);
      alert('Failed to send recommendation');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
      <div className="bg-cream w-full max-w-md rounded-3xl shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-beige shrink-0">
          <h2 className="text-xl font-serif text-ink">Book Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-beige rounded-full transition-colors">
            <X className="w-5 h-5 text-ink-light" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="flex gap-4 mb-6">
            <div className="w-24 h-36 bg-beige rounded shadow-sm overflow-hidden shrink-0">
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-forest flex items-center justify-center p-2">
                  <span className="font-serif text-cream text-center text-xs">{book.title}</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-serif text-lg text-ink font-bold leading-tight mb-1">{book.title}</h3>
              <p className="text-sm text-ink-light mb-3">{book.author}</p>
              
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                  book.status === 'completed' ? 'bg-sage/20 text-sage' : 
                  book.status === 'reading' ? 'bg-terracotta/20 text-terracotta' : 
                  'bg-beige text-ink-light'
                }`}>
                  {book.status === 'want-to-read' ? 'Want to read' : book.status === 'reading' ? `${book.completionPct}% read` : 'Completed'}
                </span>
              </div>
            </div>
          </div>
          
          <hr className="border-beige mb-6" />
          
          {/* Reading Together */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-ink mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-forest" /> Reading Together
            </h4>
            {friendsReading.length > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {friendsReading.map(f => (
                    <div key={f.id} className="w-8 h-8 rounded-full border-2 border-cream bg-forest text-cream flex items-center justify-center text-xs font-serif overflow-hidden">
                      {f.avatarUrl ? (
                        <img src={f.avatarUrl} alt={f.username} className="w-full h-full object-cover" />
                      ) : (
                        (f.displayName || f.username).charAt(0).toUpperCase()
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-ink-light ml-2">
                  {friendsReading.map(f => `@${f.username}`).join(', ')} {friendsReading.length === 1 ? 'is' : 'are'} reading this!
                </p>
              </div>
            ) : (
              <p className="text-sm text-ink-light italic">None of your friends are currently reading this.</p>
            )}
          </div>
          
          {/* Recommend Button */}
          {!isRecommending ? (
            <button 
              onClick={() => setIsRecommending(true)}
              className="w-full py-2.5 rounded-xl border border-beige-border hover:border-forest text-ink text-sm font-medium hover:text-forest transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Recommend to a Friend
            </button>
          ) : (
            <div className="bg-beige/30 p-4 rounded-xl border border-beige">
              <h4 className="text-sm font-medium text-ink mb-3 flex items-center gap-2">
                <Send className="w-4 h-4 text-forest" /> Send Recommendation
              </h4>
              
              <div className="space-y-3">
                <select 
                  value={selectedFriendId}
                  onChange={e => setSelectedFriendId(e.target.value)}
                  className="w-full p-2.5 bg-cream border border-beige rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest/30"
                >
                  <option value="" disabled>Select a friend...</option>
                  {following.map(f => (
                    <option key={f.id} value={f.id}>@{f.username}</option>
                  ))}
                </select>
                
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Why should they read this?"
                  className="w-full p-2.5 bg-cream border border-beige rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest/30 resize-none h-20"
                />
                
                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => setIsRecommending(false)}
                    className="px-4 py-2 text-sm text-ink-light hover:text-ink transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleRecommend}
                    disabled={!selectedFriendId || isSending || sendSuccess}
                    className="px-4 py-2 bg-forest text-cream text-sm font-medium rounded-lg hover:bg-forest-light transition-colors disabled:opacity-50"
                  >
                    {sendSuccess ? 'Sent!' : isSending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
