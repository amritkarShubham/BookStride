'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { createClient } from '@/lib/supabase/client';
import { db } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import type { Profile, Book } from '@/lib/types';
import { Edit2, BookOpen } from 'lucide-react';
import { EditProfileModal } from '@/components/profile/edit-profile-modal';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();

  const { setUserProfile, userProfile } = useAppStore();

  const loadProfile = async () => {
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push('/');
        return;
      }
      
      const p = await db.profiles.get(userData.user.id);
      if (p) {
        setProfile(p);
        setUserProfile(p);
      }
      
      const allBooks = await db.books.getAll();
      setBooks(allBooks);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (isLoading) return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-forest border-t-transparent animate-spin" />
      </main>
    </>
  );

  if (!profile) return (
    <>
      <Navbar />
      <main className="max-w-xl mx-auto px-5 py-20 text-center">
        <h1 className="text-2xl font-serif text-ink mb-4">Profile Not Found</h1>
        <p className="text-ink-light mb-8">It looks like your profile hasn't been generated yet. If you are an existing user, please run the database migration.</p>
        <button onClick={() => router.push('/')} className="px-6 py-2 bg-forest text-cream rounded-xl">Go Home</button>
      </main>
    </>
  );

  const currentRead = books.find(b => b.status === 'reading');
  const favBooks = books.filter(b => profile.favoriteBooks.includes(b.id as string)).slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-5 py-12">
        <div className="bg-cream rounded-3xl p-8 border border-beige shadow-sm">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-forest text-cream flex items-center justify-center text-3xl font-serif overflow-hidden shrink-0">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (profile.displayName || profile.username).charAt(0).toUpperCase()
                )}
              </div>
              
              <div>
                <h1 className="text-3xl font-serif text-ink">{profile.displayName || profile.username}</h1>
                <p className="text-ink-light">@{profile.username}</p>
                {profile.bio && <p className="mt-3 text-ink max-w-md">{profile.bio}</p>}
              </div>
            </div>
            
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-beige text-ink text-sm font-medium hover:bg-beige-border transition-colors shrink-0"
            >
              <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
          </div>
          
          <hr className="my-8 border-beige" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Top 3 Favorites */}
            <div>
              <h2 className="text-xl font-serif text-ink mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-terracotta" /> Top 3 Favorites
              </h2>
              <div className="space-y-4">
                {favBooks.length > 0 ? (
                  favBooks.map(book => (
                    <div key={book.id} className="flex gap-4 items-center p-3 rounded-xl hover:bg-beige/50 transition-colors">
                      <div className="w-12 h-16 bg-beige rounded overflow-hidden shrink-0">
                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-forest text-cream text-xs text-center leading-tight p-1">{book.title}</div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-ink line-clamp-1">{book.title}</p>
                        <p className="text-sm text-ink-light line-clamp-1">{book.author}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-ink-light italic">No favorite books selected yet.</p>
                )}
              </div>
            </div>
            
            {/* Current Read */}
            <div>
              <h2 className="text-xl font-serif text-ink mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-forest animate-pulse" /> Currently Reading
              </h2>
              {currentRead ? (
                <div className="bg-beige/30 p-5 rounded-2xl border border-beige flex gap-5 items-start">
                  <div className="w-20 h-28 bg-beige rounded overflow-hidden shrink-0 shadow-sm">
                    {currentRead.coverUrl ? (
                      <img src={currentRead.coverUrl} alt={currentRead.title} className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center bg-forest text-cream text-xs text-center leading-tight p-1">{currentRead.title}</div>
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-medium text-ink line-clamp-1 mb-1">{currentRead.title}</p>
                    <p className="text-sm text-ink-light mb-3">{currentRead.author}</p>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-ink-light font-medium">
                        <span>{currentRead.completionPct}%</span>
                        <span>{currentRead.totalPages} p</span>
                      </div>
                      <div className="h-1.5 w-full bg-beige rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-forest rounded-full"
                          style={{ width: `${currentRead.completionPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-ink-light italic">Not currently reading anything.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {isEditModalOpen && (
        <EditProfileModal
          profile={profile}
          books={books}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={() => {
            setIsEditModalOpen(false);
            loadProfile();
          }}
        />
      )}
    </>
  );
}
