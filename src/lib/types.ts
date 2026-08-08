// ─────────────────────────────────────────────────────
// Bookstride — Core Type Definitions
// ─────────────────────────────────────────────────────

export type BookStatus = 'reading' | 'completed' | 'want-to-read';
export type FileType = 'pdf' | 'epub';

export interface Book {
  id?: number;
  title: string;
  author: string;
  coverUrl: string;
  totalPages: number;
  currentPage: number;
  completionPct: number;
  status: BookStatus;
  fileType: FileType | null;
  /** Stored as ArrayBuffer in IndexedDB for offline access */
  fileBlob: ArrayBuffer | null;
  description: string;
  genres: string[];
  publishedYear: number | null;
  isbn: string;
  currentChapter: string;
  addedAt: number;       // timestamp
  completedAt: number | null;
}

export interface ReadingSession {
  id?: number;
  bookId: number;
  startedAt: number;     // timestamp
  endedAt: number | null;
  durationSeconds: number;
  wordsRead: number;
  avgWpm: number;
  pagesRead: number;
}

export interface DailyLog {
  id?: number;
  /** ISO date string YYYY-MM-DD */
  date: string;
  totalSeconds: number;
  totalWords: number;
  booksRead: number;
  sessionsCount: number;
}

export interface BookMetadata {
  title: string;
  author: string;
  totalPages: number;
  description: string;
  genres: string[];
  publishedYear: number | null;
  coverUrl: string;
  isbn: string;
}

export interface WeeklyStats {
  days: {
    label: string;
    minutes: number;
    words: number;
    isToday: boolean;
  }[];
  totalMinutes: number;
  totalWords: number;
  streakDays: number;
}

export interface OpenLibrarySearchResult {
  title: string;
  author: string;
  coverUrl: string;
  pageCount: number;
  isbn: string;
  publishYear: number | null;
  key: string;
}
