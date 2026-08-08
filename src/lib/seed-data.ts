// ─────────────────────────────────────────────────────
// Bookstride — Seed Data for First-Boot Experience
// ─────────────────────────────────────────────────────

import { db } from './db';
import type { Book, ReadingSession, DailyLog } from './types';

/**
 * Populate the database with realistic seed data so the dashboard
 * looks complete and impressive on first boot.
 */
export async function seedDatabase(): Promise<void> {
  const existingBooks = await db.books.count();
  if (existingBooks > 0) return; // Already seeded

  // ── Books ────────────────────────────────────────

  const books: Book[] = [
    {
      title: 'The Dispossessed',
      author: 'Ursula K. Le Guin',
      coverUrl: 'https://covers.openlibrary.org/b/id/12818862-L.jpg',
      totalPages: 387,
      currentPage: 166,
      completionPct: 42.8,
      status: 'reading',
      fileType: null,
      fileBlob: null,
      description: 'A brilliant physicist tries to tear down the walls of hatred that have isolated his world of anarchists from the rest of the civilized universe.',
      genres: ['Science Fiction', 'Utopian Fiction'],
      publishedYear: 1974,
      isbn: '9780061054884',
      currentChapter: 'Chapter 7',
      addedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
      completedAt: null,
    },
    {
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      coverUrl: 'https://covers.openlibrary.org/b/id/10523456-L.jpg',
      totalPages: 443,
      currentPage: 443,
      completionPct: 100,
      status: 'completed',
      fileType: null,
      fileBlob: null,
      description: 'A brief history of humankind.',
      genres: ['Non-Fiction', 'History'],
      publishedYear: 2011,
      isbn: '9780062316097',
      currentChapter: 'Afterword',
      addedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      completedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    },
    {
      title: 'Dune',
      author: 'Frank Herbert',
      coverUrl: 'https://covers.openlibrary.org/b/id/11430541-L.jpg',
      totalPages: 688,
      currentPage: 213,
      completionPct: 31,
      status: 'reading',
      fileType: null,
      fileBlob: null,
      description: 'Set on the desert planet Arrakis, Dune is the story of Paul Atreides.',
      genres: ['Science Fiction', 'Adventure'],
      publishedYear: 1965,
      isbn: '9780441172719',
      currentChapter: 'Book Two',
      addedAt: Date.now() - 21 * 24 * 60 * 60 * 1000,
      completedAt: null,
    },
    {
      title: 'The Left Hand of Darkness',
      author: 'Ursula K. Le Guin',
      coverUrl: 'https://covers.openlibrary.org/b/id/12760191-L.jpg',
      totalPages: 304,
      currentPage: 304,
      completionPct: 100,
      status: 'completed',
      fileType: null,
      fileBlob: null,
      description: 'A lone human ambassador is sent to Winter, an alien world without war.',
      genres: ['Science Fiction', 'Feminist Fiction'],
      publishedYear: 1969,
      isbn: '9780441478125',
      currentChapter: 'Complete',
      addedAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
      completedAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    },
  ];

  const bookIds = (await db.books.bulkAdd(books, { allKeys: true })) as number[];

  // ── Reading Sessions ─────────────────────────────

  const sessions: ReadingSession[] = [
    // Sessions for The Dispossessed (bookId 1)
    {
      bookId: bookIds[0],
      startedAt: Date.now() - 2 * 60 * 60 * 1000,
      endedAt: Date.now() - 2 * 60 * 60 * 1000 + 45 * 60 * 1000,
      durationSeconds: 2700,
      wordsRead: 8100,
      avgWpm: 180,
      pagesRead: 28,
    },
    {
      bookId: bookIds[0],
      startedAt: Date.now() - 26 * 60 * 60 * 1000,
      endedAt: Date.now() - 26 * 60 * 60 * 1000 + 35 * 60 * 1000,
      durationSeconds: 2100,
      wordsRead: 6300,
      avgWpm: 180,
      pagesRead: 22,
    },
    // Sessions for Dune (bookId 3)
    {
      bookId: bookIds[2],
      startedAt: Date.now() - 50 * 60 * 60 * 1000,
      endedAt: Date.now() - 50 * 60 * 60 * 1000 + 40 * 60 * 1000,
      durationSeconds: 2400,
      wordsRead: 7680,
      avgWpm: 192,
      pagesRead: 25,
    },
    // Best session — high WPM
    {
      bookId: bookIds[1],
      startedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
      endedAt: Date.now() - 10 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000,
      durationSeconds: 1500,
      wordsRead: 7950,
      avgWpm: 318,
      pagesRead: 30,
    },
  ];

  await db.sessions.bulkAdd(sessions);

  // ── Daily Logs (last 14 days) ────────────────────

  const dailyLogs: DailyLog[] = [];
  const minutesPerDay = [32, 45, 0, 28, 55, 40, 22, 48, 35, 0, 52, 38, 42, 46];

  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const mins = minutesPerDay[13 - i];

    if (mins > 0) {
      dailyLogs.push({
        date: dateStr,
        totalSeconds: mins * 60,
        totalWords: Math.round(mins * 4.8 * 60), // ~4.8 words/sec average at ~288 WPM
        booksRead: 0,
        sessionsCount: mins > 40 ? 2 : 1,
      });
    }
  }

  await db.dailyLogs.bulkAdd(dailyLogs);
}
