'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { db } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { Inbox, Check, BookOpen, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function InboxPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userProfile, openReader } = useAppStore();

  useEffect(() => {
    if (userProfile) {
      loadRecommendations();
    }
  }, [userProfile]);

  const loadRecommendations = async () => {
    if (!userProfile) return;
    try {
      const recs = await db.social.getRecommendations(userProfile.id);
      setRecommendations(recs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await db.social.markRecommendationRead(id);
      setRecommendations(prev => 
        prev.map(r => r.id === id ? { ...r, status: 'read' } : r)
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-5 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Inbox className="w-8 h-8 text-forest" />
          <h1 className="font-serif text-3xl text-ink">Inbox</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-forest border-t-transparent animate-spin" />
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-20 bg-beige/30 rounded-3xl border border-beige">
            <Inbox className="w-12 h-12 text-ink-light mx-auto mb-4" />
            <h2 className="text-xl font-serif text-ink mb-2">No recommendations yet</h2>
            <p className="text-ink-light">When friends recommend books to you, they'll appear here.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {recommendations.map((rec) => (
              <div 
                key={rec.id} 
                className={`p-5 rounded-2xl border transition-all ${
                  rec.status === 'pending' ? 'bg-white border-forest/30 shadow-sm' : 'bg-beige/30 border-beige opacity-75'
                }`}
              >
                <div className="flex gap-4">
                  <div className="w-16 h-24 bg-beige rounded shrink-0 overflow-hidden shadow-sm">
                    {rec.book.coverUrl ? (
                      <img src={rec.book.coverUrl} alt={rec.book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-forest flex items-center justify-center p-2">
                        <span className="font-serif text-cream text-center text-[10px] leading-tight">{rec.book.title}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1 text-sm text-ink-light">
                          <Link href={`/profile/${rec.recommender.username}`} className="font-medium text-ink hover:underline">
                            @{rec.recommender.username}
                          </Link>
                          <span>recommended a book</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(rec.createdAt, { addSuffix: true })}
                          </span>
                        </div>
                        <h3 className="font-serif text-lg font-bold text-ink leading-tight">{rec.book.title}</h3>
                        <p className="text-sm text-ink-light">{rec.book.author}</p>
                      </div>
                      
                      {rec.status === 'pending' && (
                        <button 
                          onClick={() => handleMarkRead(rec.id)}
                          className="p-2 text-ink-light hover:text-forest bg-beige/50 hover:bg-forest/10 rounded-full transition-colors shrink-0"
                          title="Mark as read"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    {rec.message && (
                      <div className="mt-3 p-3 bg-beige/40 rounded-xl text-sm text-ink italic border-l-2 border-forest">
                        "{rec.message}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
