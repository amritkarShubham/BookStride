'use client';

import { useState, useRef } from 'react';
import { X, Upload, Check } from 'lucide-react';
import { db } from '@/lib/db';
import type { Profile, Book } from '@/lib/types';

interface EditProfileModalProps {
  profile: Profile;
  books: Book[];
  onClose: () => void;
  onSaved: () => void;
}

export function EditProfileModal({ profile, books, onClose, onSaved }: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [username, setUsername] = useState(profile.username || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [favBooks, setFavBooks] = useState<string[]>(profile.favoriteBooks || []);
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl);
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const toggleFavBook = (bookId: string) => {
    if (favBooks.includes(bookId)) {
      setFavBooks(favBooks.filter(id => id !== bookId));
    } else {
      if (favBooks.length >= 3) {
        setError('You can only select up to 3 favorite books.');
        return;
      }
      setFavBooks([...favBooks, bookId]);
      setError(null);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    // Simple username validation
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError('Username must be 3-20 characters long and contain only letters, numbers, and underscores.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Check if username is taken by someone else
      if (username !== profile.username) {
        const existing = await db.profiles.getByUsername(username);
        if (existing && existing.id !== profile.id) {
          setError('Username is already taken.');
          setIsSaving(false);
          return;
        }
      }

      let newAvatarUrl = profile.avatarUrl;
      
      // Upload new avatar if selected
      if (avatarFile) {
        newAvatarUrl = await db.profiles.uploadAvatar(profile.id, avatarFile);
      }

      await db.profiles.update(profile.id, {
        displayName: displayName.trim() || null,
        username: username.trim(),
        bio: bio.trim() || null,
        favoriteBooks: favBooks,
        avatarUrl: newAvatarUrl
      });

      onSaved();
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
      <div className="bg-cream w-full max-w-2xl rounded-3xl shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-beige shrink-0">
          <h2 className="text-xl font-serif text-ink">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-beige rounded-full transition-colors">
            <X className="w-5 h-5 text-ink-light" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          
          {error && (
            <div className="p-3 bg-terracotta/10 border border-terracotta/20 text-terracotta text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-forest text-cream flex items-center justify-center text-3xl font-serif overflow-hidden shrink-0 relative group">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                (displayName || username).charAt(0).toUpperCase()
              )}
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-ink/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Upload className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div>
              <p className="font-medium text-ink mb-1">Profile Picture</p>
              <p className="text-sm text-ink-light mb-3">JPG, PNG or GIF. Max 5MB.</p>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/png, image/jpeg, image/gif, image/webp"
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-beige hover:bg-beige-border text-ink text-sm font-medium rounded-xl transition-colors"
              >
                Choose Image
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How you appear to others"
                className="w-full px-4 py-2.5 bg-white border border-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a little about yourself and what you like to read..."
              rows={3}
              className="w-full px-4 py-3 bg-white border border-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-forest/20 resize-none"
            />
          </div>

          {/* Top 3 Books */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-ink">Top 3 Favorite Books</label>
              <span className="text-xs font-medium px-2 py-1 bg-beige rounded-lg text-ink-light">
                {favBooks.length} / 3 Selected
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {books.map(book => {
                const isSelected = favBooks.includes(book.id as string);
                return (
                  <button
                    key={book.id}
                    onClick={() => toggleFavBook(book.id as string)}
                    className={`relative flex items-center gap-3 p-3 text-left rounded-xl border transition-all ${
                      isSelected 
                        ? 'bg-forest/5 border-forest shadow-sm' 
                        : 'bg-white border-beige hover:border-beige-border'
                    }`}
                  >
                    <div className="w-10 h-14 bg-beige rounded shrink-0 overflow-hidden">
                      {book.coverUrl && <img src={book.coverUrl} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink text-sm line-clamp-1">{book.title}</p>
                      <p className="text-xs text-ink-light line-clamp-1">{book.author}</p>
                    </div>
                    
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-forest rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-cream" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {books.length === 0 && (
              <p className="text-sm text-ink-light italic p-4 text-center bg-beige/30 rounded-xl">
                Add some books to your library first to select your favorites!
              </p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-beige bg-beige/10 shrink-0 flex justify-end gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-ink-light font-medium hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-forest hover:bg-forest-light text-cream font-medium rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-cream/30 border-t-cream animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
