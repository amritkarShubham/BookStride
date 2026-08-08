'use client';

import { useEffect, useState, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import type { Book } from '@/lib/types';

interface NowReadingCardProps {
  book: Book;
  sessionElapsed: number;
  isSessionActive: boolean;
  onOpenReader: () => void;
}

function formatTimer(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function NowReadingCard({
  book,
  sessionElapsed,
  isSessionActive,
  onOpenReader,
}: NowReadingCardProps) {
  const [displayTime, setDisplayTime] = useState(sessionElapsed);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setDisplayTime(sessionElapsed);
  }, [sessionElapsed]);

  useEffect(() => {
    if (isSessionActive) {
      timerRef.current = setInterval(() => {
        setDisplayTime((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionActive]);

  return (
    <div
      className="card-dotted p-5 animate-fade-in-up cursor-pointer group hover:border-sage transition-colors duration-300"
      style={{ animationDelay: '80ms' }}
      onClick={onOpenReader}
    >
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Book Cover */}
        <div className="flex-shrink-0">
          <div className="book-spine w-[100px] sm:w-[120px] aspect-[2/3] rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-forest flex items-center justify-center p-3">
                <span className="font-serif text-cream text-center text-sm leading-tight">
                  {book.title}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Book Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] tracking-[0.2em] uppercase text-ink-light font-medium">
                Now Reading
              </span>
              <span className="text-[10px] text-beige-border">·</span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-terracotta font-medium">
                {book.currentChapter}
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink leading-tight tracking-tight">
              {book.title}
            </h2>
            <p className="text-sm text-ink-light mt-1">{book.author}</p>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-ink">
                {book.completionPct}%
              </span>
              <span className="text-xs text-ink-light">
                {book.currentPage} / {book.totalPages} pages
              </span>
            </div>
            <div className="progress-dual">
              <div
                className="progress-dual-fill"
                style={{ width: `${book.completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Timer & Details */}
        <div className="flex-shrink-0 flex flex-col items-end justify-between sm:min-w-[120px]">
          <div className="text-right">
            <div
              className={`font-mono text-3xl sm:text-4xl text-ink tracking-tight tabular-nums ${
                isSessionActive ? 'animate-pulse-soft' : ''
              }`}
            >
              {formatTimer(displayTime)}
            </div>
            {isSessionActive && (
              <div className="flex items-center gap-1.5 justify-end mt-1">
                <div className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
                <span className="text-[10px] tracking-wider uppercase text-terracotta font-medium">
                  Active
                </span>
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenReader();
            }}
            className="flex items-center gap-1 text-xs text-ink-light hover:text-terracotta transition-colors mt-3 group/btn"
          >
            <span className="tracking-wider uppercase font-medium">Details</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
