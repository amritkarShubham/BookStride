'use client';

import { BookOpen, Menu, Settings, Library, Users, Search } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';

export function Navbar() {
  const { userInitials, userProfile, toggleSidebar, openSettings } = useAppStore();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-beige-border/40"
      style={{
        background: 'linear-gradient(180deg, #F5F2EBf2 0%, #F5F2EBe8 100%)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-5 py-3">
        {/* Left: Menu + Brand */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-beige/70 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-ink" strokeWidth={1.8} />
          </button>

          <Link href="/" className="flex items-center gap-3 group">
            {/* Book icon container — styled like a mini book spine */}
            <div className="relative w-10 h-10 rounded-xl bg-forest flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
              {/* Spine line */}
              <div className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-cream/20 rounded-full" />
              <BookOpen className="w-[18px] h-[18px] text-cream" strokeWidth={1.6} />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-[22px] leading-none tracking-tight text-ink">
                bookstride
              </span>
              <span className="text-[9px] tracking-[0.25em] uppercase text-ink-light/60 mt-0.5">
                track your reads
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Search + Library + Community + Settings + Avatar */}
        <div className="flex items-center gap-2">
          <Link
            href="/explore"
            className="flex items-center gap-1.5 text-sm text-ink-light hover:text-ink transition-colors px-3 py-2 rounded-lg hover:bg-beige/60"
            aria-label="Search Friends"
          >
            <Search className="w-4 h-4" strokeWidth={1.6} />
            <span className="hidden sm:inline">Explore</span>
          </Link>

          <Link
            href="/community"
            className="flex items-center gap-1.5 text-sm text-ink-light hover:text-ink transition-colors px-3 py-2 rounded-lg hover:bg-beige/60"
          >
            <Users className="w-4 h-4" strokeWidth={1.6} />
            <span className="hidden sm:inline">Community</span>
          </Link>

          <Link
            href="/library"
            className="flex items-center gap-1.5 text-sm text-ink-light hover:text-ink transition-colors px-3 py-2 rounded-lg hover:bg-beige/60"
          >
            <Library className="w-4 h-4" strokeWidth={1.6} />
            <span className="hidden sm:inline">Library</span>
          </Link>

          <button
            onClick={openSettings}
            className="p-2 rounded-lg hover:bg-beige/70 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-[18px] h-[18px] text-ink-light" strokeWidth={1.6} />
          </button>

          {/* User avatar */}
          <Link href="/profile" className="block relative group ml-2">
            <div className="w-9 h-9 rounded-full bg-forest text-cream flex items-center justify-center text-[11px] font-semibold tracking-wide shadow-sm ring-2 ring-forest/10 overflow-hidden group-hover:ring-forest/30 transition-all">
              {userProfile?.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                userInitials
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Subtle decorative bottom grain line */}
      <div
        className="h-px w-full"
        style={{
          background: 'repeating-linear-gradient(90deg, #C2BBA850 0px, #C2BBA850 4px, transparent 4px, transparent 8px)',
        }}
      />
    </nav>
  );
}
