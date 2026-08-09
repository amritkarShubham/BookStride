'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { createClient } from '@/lib/supabase/client';
import { db } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function CommunityPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          router.push('/');
          return;
        }

        const feedEvents = await db.social.getFeedEvents(userData.user.id);
        setEvents(feedEvents);
      } catch (e) {
        console.error('Failed to load feed', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeed();
  }, [router]);

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-5 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-ink mb-2">Community</h1>
          <p className="text-ink-light">See what the readers you follow are up to.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-forest border-t-transparent animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="bg-cream rounded-3xl p-12 border border-beige shadow-sm text-center">
            <h2 className="text-xl font-serif text-ink mb-3">It's quiet here...</h2>
            <p className="text-ink-light mb-6">
              You aren't following anyone yet, or the people you follow haven't added any books recently.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id} className="bg-cream rounded-3xl p-6 border border-beige shadow-sm flex gap-5 items-start">
                {/* Avatar */}
                <Link href={`/profile/${event.user.username}`} className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-forest text-cream flex items-center justify-center text-lg font-serif overflow-hidden shadow-sm hover:ring-2 ring-forest/30 transition-all">
                    {event.user.avatarUrl ? (
                      <img src={event.user.avatarUrl} alt={event.user.username} className="w-full h-full object-cover" />
                    ) : (
                      (event.user.displayName || event.user.username).charAt(0).toUpperCase()
                    )}
                  </div>
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 mb-3">
                    <Link href={`/profile/${event.user.username}`} className="font-medium text-ink hover:underline">
                      {event.user.displayName || event.user.username}
                    </Link>
                    <span className="text-ink-light text-sm">
                      {event.type === 'started_book' ? 'started reading' : 'finished reading'}
                    </span>
                    <span className="text-ink-light text-xs sm:ml-auto">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Book Card inside event */}
                  <div className="bg-beige/30 p-4 rounded-xl border border-beige flex gap-4">
                    <div className="w-14 h-20 bg-beige rounded overflow-hidden shrink-0 shadow-sm">
                      {event.book.coverUrl ? (
                        <img src={event.book.coverUrl} alt={event.book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-forest text-cream text-[10px] text-center leading-tight p-1">
                          {event.book.title}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="font-medium text-ink line-clamp-1">{event.book.title}</p>
                      <p className="text-sm text-ink-light line-clamp-1">{event.book.author}</p>
                    </div>
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
