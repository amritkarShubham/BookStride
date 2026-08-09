'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Search, User } from 'lucide-react';
import { db } from '@/lib/db';
import type { Profile } from '@/lib/types';
import Link from 'next/link';

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsLoading(true);
        try {
          const fetchedProfiles = await db.profiles.searchProfiles(query.trim());
          setResults(fetchedProfiles);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(searchTimer);
  }, [query]);

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-5 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-ink mb-2">Explore</h1>
          <p className="text-ink-light">Find friends and discover new readers on Bookstride.</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 shadow-sm">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for usernames or display names..."
            className="w-full pl-12 pr-4 py-4 bg-cream border border-beige rounded-2xl focus:outline-none focus:ring-2 focus:ring-forest/20 text-ink placeholder:text-ink-light/50"
            autoFocus
          />
        </div>

        {/* Results */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-forest border-t-transparent animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((profile) => (
                <Link
                  key={profile.id}
                  href={`/profile/${profile.username}`}
                  className="block bg-cream rounded-2xl p-4 border border-beige hover:border-beige-border hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-forest text-cream flex items-center justify-center text-lg font-serif overflow-hidden shrink-0">
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        (profile.displayName || profile.username).charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-ink">{profile.displayName || profile.username}</p>
                      <p className="text-sm text-ink-light">@{profile.username}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : query.trim().length > 1 ? (
            <p className="text-center text-ink-light py-10 italic">No readers found matching "{query}".</p>
          ) : (
            <div className="text-center py-12 text-ink-light/50">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Type a name to start searching.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
