'use client';

import { useEffect } from 'react';
import {
  X,
  Home,
  Library,
  Upload,
  BookOpen,
  Settings,
  BarChart3,
  Flame,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const { isSidebarOpen, closeSidebar, openUpload, openSettings, userName, userInitials } =
    useAppStore();
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar();
    };
    if (isSidebarOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen, closeSidebar]);

  if (!isSidebarOpen) return null;

  const navItems = [
    { href: '/', icon: Home, label: 'Dashboard', active: pathname === '/' },
    { href: '/library', icon: Library, label: 'My Library', active: pathname === '/library' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm"
        onClick={closeSidebar}
      />

      {/* Drawer */}
      <aside
        className="fixed top-0 left-0 z-50 h-full w-72 bg-cream shadow-2xl flex flex-col"
        style={{
          animation: 'slide-in-left 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-beige">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-forest flex items-center justify-center">
              <div className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-cream/20 rounded-full" />
              <BookOpen className="w-4 h-4 text-cream" strokeWidth={1.6} />
            </div>
            <span className="font-serif text-lg text-ink">bookstride</span>
          </div>
          <button
            onClick={closeSidebar}
            className="p-1.5 rounded-lg hover:bg-beige transition-colors"
          >
            <X className="w-4 h-4 text-ink-light" />
          </button>
        </div>

        {/* User */}
        <div className="px-5 py-4 border-b border-beige/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forest text-cream flex items-center justify-center text-xs font-semibold tracking-wide ring-2 ring-forest/10">
              {userInitials}
            </div>
            <div>
              <p className="text-sm font-medium text-ink">{userName}</p>
              <p className="text-[10px] text-ink-light uppercase tracking-wider">Reader</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-3 mb-2 text-[10px] text-ink-light uppercase tracking-[0.2em]">
            Navigate
          </p>

          {navItems.map(({ href, icon: Icon, label, active }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active
                  ? 'bg-forest text-cream font-medium'
                  : 'text-ink hover:bg-beige/70'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.6} />
              {label}
            </Link>
          ))}

          <div className="chapter-divider my-4">Actions</div>

          <button
            onClick={() => {
              closeSidebar();
              openUpload();
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ink hover:bg-beige/70 transition-colors w-full"
          >
            <Upload className="w-[18px] h-[18px]" strokeWidth={1.6} />
            Upload a Book
          </button>

          <button
            onClick={() => {
              closeSidebar();
              // Navigate to library for stats — could be a dedicated page
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ink hover:bg-beige/70 transition-colors w-full"
          >
            <BarChart3 className="w-[18px] h-[18px]" strokeWidth={1.6} />
            Reading Stats
          </button>

          <button
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ink hover:bg-beige/70 transition-colors w-full"
            disabled
          >
            <Flame className="w-[18px] h-[18px]" strokeWidth={1.6} />
            Streaks & Goals
            <span className="ml-auto text-[9px] uppercase tracking-wider text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-full">
              Soon
            </span>
          </button>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-beige">
          <button
            onClick={() => {
              closeSidebar();
              openSettings();
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ink-light hover:bg-beige/70 hover:text-ink transition-colors w-full"
          >
            <Settings className="w-[18px] h-[18px]" strokeWidth={1.6} />
            Settings
          </button>
        </div>
      </aside>

      <style jsx>{`
        @keyframes slide-in-left {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
