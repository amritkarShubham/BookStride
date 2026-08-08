'use client';

import { useEffect, useState, useCallback } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { GreetingBanner } from '@/components/dashboard/greeting-banner';
import { NowReadingCard } from '@/components/dashboard/now-reading-card';
import { WeeklyMomentum } from '@/components/dashboard/weekly-momentum';
import { LittleWins } from '@/components/dashboard/little-wins';
import { ShelfNotes } from '@/components/dashboard/shelf-notes';
import { BookUploader } from '@/components/upload/book-uploader';
import { MetadataReviewModal } from '@/components/upload/metadata-review-modal';
import { ReaderModal } from '@/components/reader/reader-modal';
import { db } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { getWeeklyStats, getBestWpm } from '@/lib/session-manager';
import { extractPdfText, extractPdfMetadata } from '@/lib/pdf-extractor';
import { extractEpubMetadata, extractEpubText } from '@/lib/epub-extractor';
import { searchBookByTitleAuthor } from '@/lib/open-library';
import type { Book, BookMetadata, WeeklyStats } from '@/lib/types';

export default function Dashboard() {
  // ── State ──────────────────────────────────────────
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [bestWpm, setBestWpm] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Upload flow
  const [pendingMetadata, setPendingMetadata] = useState<BookMetadata | null>(null);
  const [isExtractingMeta, setIsExtractingMeta] = useState(false);
  const [pendingFileData, setPendingFileData] = useState<ArrayBuffer | null>(null);
  const [pendingFileType, setPendingFileType] = useState<'pdf' | 'epub' | null>(null);

  const {
    isSessionActive,
    sessionElapsedSeconds,
    isReaderOpen,
    activeBookId,
    openReader,
    closeReader,
    closeUpload,
    startSession,
  } = useAppStore();

  // ── Data Loading ───────────────────────────────────
  const loadData = useCallback(async () => {
    const allBooks = await db.books.getAll();
    setBooks(allBooks);

    // Find the currently-reading book (most recent)
    const reading = allBooks.find((b) => b.status === 'reading');
    setActiveBook(reading || null);

    // Load stats
    const stats = await getWeeklyStats();
    setWeeklyStats(stats);

    const wpm = await getBestWpm();
    setBestWpm(wpm);

    const sessions = await db.sessions.count();
    setTotalSessions(sessions);

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Upload Flow ────────────────────────────────────
  const handleFileSelected = useCallback(async (file: File) => {
    closeUpload();
    setIsExtractingMeta(true);
    setPendingMetadata({
      title: '',
      author: '',
      totalPages: 0,
      description: '',
      genres: [],
      publishedYear: null,
      coverUrl: '',
      isbn: '',
    });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const isEpub = file.name.toLowerCase().endsWith('.epub');
      const isPdf = file.name.toLowerCase().endsWith('.pdf');

      setPendingFileData(arrayBuffer);
      setPendingFileType(isEpub ? 'epub' : 'pdf');

      let extractedMeta: Partial<BookMetadata> = {};
      let textSnippet = '';

      if (isPdf) {
        // Extract PDF metadata and text
        const [meta, textResult] = await Promise.all([
          extractPdfMetadata(arrayBuffer),
          extractPdfText(arrayBuffer, 10),
        ]);
        extractedMeta = meta;
        textSnippet = textResult.text;
        if (!extractedMeta.totalPages) {
          extractedMeta.totalPages = textResult.totalPages;
        }
      } else if (isEpub) {
        // Extract ePub metadata and text
        const [meta, text] = await Promise.all([
          extractEpubMetadata(arrayBuffer),
          extractEpubText(arrayBuffer, 10),
        ]);
        extractedMeta = meta;
        textSnippet = text;
      }

      // Try AI extraction via API route
      let aiMeta: Partial<BookMetadata> = {};
      try {
        const res = await fetch('/api/extract-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            textSnippet: textSnippet.slice(0, 4000),
            pdfMetadata: extractedMeta,
          }),
        });
        const data = await res.json();
        if (data.success) {
          aiMeta = data.metadata;
        }
      } catch {
        // AI extraction failed — use local metadata
      }

      // Merge metadata (AI takes priority over raw extraction)
      const title = aiMeta.title || extractedMeta.title || file.name.replace(/\.(pdf|epub)$/i, '');
      const author = aiMeta.author || extractedMeta.author || '';

      // Search Open Library for cover
      let coverUrl = extractedMeta.coverUrl || '';
      if (!coverUrl && title) {
        const olResult = await searchBookByTitleAuthor(title, author);
        if (olResult) {
          coverUrl = olResult.coverUrl;
        }
      }

      const finalMeta: BookMetadata = {
        title,
        author,
        totalPages: aiMeta.totalPages || extractedMeta.totalPages || 0,
        description: aiMeta.description || extractedMeta.description || '',
        genres: aiMeta.genres || [],
        publishedYear: aiMeta.publishedYear || null,
        coverUrl,
        isbn: '',
      };

      setPendingMetadata(finalMeta);
    } catch (error) {
      console.error('Metadata extraction error:', error);
      setPendingMetadata({
        title: file.name.replace(/\.(pdf|epub)$/i, ''),
        author: '',
        totalPages: 0,
        description: '',
        genres: [],
        publishedYear: null,
        coverUrl: '',
        isbn: '',
      });
    } finally {
      setIsExtractingMeta(false);
    }
  }, [closeUpload]);

    const handleConfirmUpload = useCallback(
    async (metadata: BookMetadata) => {
      if (!pendingFileData) return;

      const book: Omit<Book, 'id' | 'user_id'> = {
        ...metadata,
        currentPage: 0,
        completionPct: 0,
        status: 'reading',
        fileType: pendingFileType,
        fileUrl: null,
        currentChapter: '',
        addedAt: Date.now(),
        completedAt: null,
      };

      await db.books.add(book, pendingFileData);

      // Reset upload state
      setPendingMetadata(null);
      setPendingFileData(null);
      setPendingFileType(null);

      // Reload data
      await loadData();
    },
    [pendingFileData, pendingFileType, loadData]
  );

  const handleCancelUpload = useCallback(() => {
    setPendingMetadata(null);
    setPendingFileData(null);
    setPendingFileType(null);
  }, []);

  // ── Computed Values ────────────────────────────────
  const completedBooks = books.filter((b) => b.status === 'completed').length;
  const currentStreak = weeklyStats?.streakDays || 0;

  const handleStartSession = useCallback(() => {
    if (activeBook?.id) {
      startSession(activeBook.id);
      openReader(activeBook.id);
    }
  }, [activeBook, startSession, openReader]);

  // ── Render ─────────────────────────────────────────
  if (!isLoaded) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 rounded-full border-2 border-forest border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-sm text-ink-light">Loading your library...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-5 py-8 space-y-8">
          {/* Greeting */}
          <GreetingBanner
            totalBooksRead={completedBooks}
            currentStreak={currentStreak}
            onStartSession={handleStartSession}
          />

          {/* Now Reading */}
          {activeBook && (
            <NowReadingCard
              book={activeBook}
              sessionElapsed={sessionElapsedSeconds}
              isSessionActive={isSessionActive}
              onOpenReader={() => activeBook.id && openReader(activeBook.id)}
            />
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              {weeklyStats && (
                <WeeklyMomentum
                  days={weeklyStats.days}
                  totalMinutes={weeklyStats.totalMinutes}
                  totalWords={weeklyStats.totalWords}
                  streakDays={weeklyStats.streakDays}
                />
              )}
            </div>
            <div>
              <LittleWins
                bestWpm={bestWpm}
                totalBooksCompleted={completedBooks}
                totalSessions={totalSessions}
              />
            </div>
          </div>

          {/* Shelf Notes */}
          <ShelfNotes
            books={books.slice(0, 8)}
            onBookClick={(id) => openReader(id)}
          />
        </div>
      </main>

      {/* Upload Modal */}
      <BookUploader onFileSelected={handleFileSelected} />

      {/* Metadata Review */}
      {pendingMetadata && (
        <MetadataReviewModal
          metadata={pendingMetadata}
          isOpen={true}
          isLoading={isExtractingMeta}
          onConfirm={handleConfirmUpload}
          onCancel={handleCancelUpload}
        />
      )}

      {/* Reader Modal */}
      {isReaderOpen && activeBookId && (
        <ReaderModal bookId={activeBookId} onClose={closeReader} />
      )}
    </>
  );
}
