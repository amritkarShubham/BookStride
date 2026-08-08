'use client';

import { Play, Upload } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface GreetingBannerProps {
  totalBooksRead: number;
  currentStreak: number;
  onStartSession: () => void;
}

export function GreetingBanner({
  totalBooksRead,
  currentStreak,
  onStartSession,
}: GreetingBannerProps) {
  const { userName, openUpload } = useAppStore();

  return (
    <section className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink leading-tight tracking-tight">
            Keep going,{' '}
            <span className="text-terracotta">{userName}</span>.
          </h1>
          <p className="mt-2 text-ink-light text-sm sm:text-base max-w-md">
            {totalBooksRead > 0
              ? `${totalBooksRead} books completed · ${currentStreak > 0 ? `${currentStreak} day streak` : 'Start a new streak today'}`
              : 'Upload your first book to begin tracking your reading journey.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openUpload}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-beige text-ink hover:bg-beige-border transition-all duration-200 text-sm font-medium shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Upload Book
          </button>
          <button
            onClick={onStartSession}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-forest text-cream hover:bg-forest-light transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <Play className="w-4 h-4 fill-current" />
            START SESSION
          </button>
        </div>
      </div>
    </section>
  );
}
