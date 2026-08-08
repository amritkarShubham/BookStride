'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { X, Pause, Play, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { db } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { WpmEngine } from '@/lib/wpm-engine';
import { saveSession, updateBookProgress } from '@/lib/session-manager';
import type { Book } from '@/lib/types';
import dynamic from 'next/dynamic';

const PdfViewer = dynamic(
  () => import('./pdf-viewer').then((m) => ({ default: m.PdfViewer })),
  { ssr: false }
);
const EpubViewer = dynamic(
  () => import('./epub-viewer').then((m) => ({ default: m.EpubViewer })),
  { ssr: false }
);

interface ReaderModalProps {
  bookId: string;
  onClose: () => void;
}

function formatTimer(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function ReaderModal({ bookId, onClose }: ReaderModalProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentWpm, setCurrentWpm] = useState(0);
  const [progress, setProgress] = useState(0);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  const wpmEngineRef = useRef(new WpmEngine());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef(Date.now());

  const { startSession, endSession, updateSessionTime } = useAppStore();

  // Load book data
  useEffect(() => {
    db.books.getById(bookId).then((b) => {
      if (b) {
        setBook(b);
        setProgress(b.completionPct);
        startSession(bookId);

        if (b.fileUrl) {
          // If the bucket is private, we need a signed URL. We can extract the path from the public URL.
          try {
            const pathMatch = b.fileUrl.match(/\/books\/(.+)$/);
            const path = pathMatch ? pathMatch[1] : b.fileUrl;
            
            const supabase = createClient();
            supabase.storage.from('books').createSignedUrl(path, 3600).then(({ data }) => {
              if (data?.signedUrl) {
                setSignedUrl(data.signedUrl);
              } else {
                setSignedUrl(b.fileUrl!); // fallback
              }
            });
          } catch (e) {
            setSignedUrl(b.fileUrl!);
          }
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!isPaused) {
        setElapsed((prev) => {
          const next = prev + 1;
          updateSessionTime(next);
          return next;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, updateSessionTime]);

  // Handle page change from PDF/ePub viewer
  const handlePageChange = useCallback(
    (pageOrLocation: number | string, totalOrProgress: number, wordCount: number) => {
      const engine = wpmEngineRef.current;
      const pageNum = typeof pageOrLocation === 'number' ? pageOrLocation : 0;

      engine.startPage(pageNum, wordCount);
      setCurrentWpm(engine.getAverageWpm() || engine.getLiveWpm());

      if (book) {
        const newProgress = typeof pageOrLocation === 'number'
          ? parseFloat(((pageOrLocation / totalOrProgress) * 100).toFixed(1))
          : totalOrProgress;
        setProgress(newProgress);
      }
    },
    [book]
  );

  // Handle close — save session
  const handleClose = async () => {
    try {
      const engine = wpmEngineRef.current;
      engine.endCurrentPage();

      if (book?.id) {
        await saveSession(book.id, engine, sessionStartRef.current);

        // Update book progress
        const totalPages = book.totalPages || 0;
        let currentPage = Math.round((progress / 100) * totalPages);
        if (isNaN(currentPage)) currentPage = book.currentPage || 0;
        
        await updateBookProgress(book.id, currentPage, totalPages, progress);
      }
    } catch (error) {
      console.error('Error saving reading session:', error);
    } finally {
      endSession();
      onClose();
    }
  };

  if (!book) {
    return (
      <div className="fixed inset-0 z-50 bg-cream flex items-center justify-center">
        <div className="text-ink-light">Loading book...</div>
      </div>
    );
  }

  const hasFile = book.fileUrl && book.fileType;

  // Don't render viewers until we have the signed URL (if there is a file)
  if (hasFile && !signedUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-cream flex items-center justify-center">
        <div className="text-ink-light">Preparing document...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-cream flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-forest text-cream shadow-lg">
        <div className="flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-cream/70" />
          <div>
            <p className="text-sm font-medium truncate max-w-[200px]">
              {book.title}
            </p>
            <p className="text-xs text-cream/60">{book.author}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* WPM Display */}
          <div className="text-right">
            <p className="font-mono text-lg tabular-nums">{currentWpm || '—'}</p>
            <p className="text-[9px] uppercase tracking-wider text-cream/50">
              WPM
            </p>
          </div>

          {/* Timer */}
          <div className="text-right">
            <p className="font-mono text-lg tabular-nums">
              {formatTimer(elapsed)}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-cream/50">
              Time
            </p>
          </div>

          {/* Progress */}
          <div className="text-right">
            <p className="font-mono text-lg tabular-nums">
              {progress.toFixed(1)}%
            </p>
            <p className="text-[9px] uppercase tracking-wider text-cream/50">
              Progress
            </p>
          </div>

          {/* Controls */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-lg bg-cream/10 hover:bg-cream/20 transition-colors"
          >
            {isPaused ? (
              <Play className="w-4 h-4 fill-current" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg bg-cream/10 hover:bg-terracotta/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-beige">
        <div
          className="h-full bg-gradient-to-r from-sage to-terracotta transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Paused Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-10 bg-ink/30 backdrop-blur-sm flex items-center justify-center"
          style={{ top: '56px' }}
        >
          <div className="bg-cream rounded-2xl p-8 text-center shadow-2xl animate-fade-in-up">
            <Pause className="w-8 h-8 text-terracotta mx-auto mb-3" />
            <p className="font-serif text-xl text-ink mb-1">Session Paused</p>
            <p className="text-sm text-ink-light mb-4">
              {formatTimer(elapsed)} elapsed · {currentWpm || 0} avg WPM
            </p>
            <button
              onClick={() => setIsPaused(false)}
              className="px-6 py-2.5 rounded-xl bg-forest text-cream font-medium text-sm hover:bg-forest-light transition-colors"
            >
              Resume Reading
            </button>
          </div>
        </div>
      )}

      {/* Reader Content */}
      <div className="flex-1 overflow-hidden">
        {hasFile && signedUrl ? (
          book.fileType === 'pdf' ? (
            <PdfViewer
              fileUrl={signedUrl}
              currentPage={book.currentPage}
              onPageChange={handlePageChange}
            />
          ) : (
            <EpubViewer
              fileUrl={signedUrl}
              onPageChange={handlePageChange}
            />
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-sm">
              <BookOpen className="w-12 h-12 text-beige-border mx-auto mb-4" />
              <p className="font-serif text-xl text-ink mb-2">No File Attached</p>
              <p className="text-sm text-ink-light">
                This book was added manually. Upload a PDF or ePub to start
                reading with WPM tracking.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
