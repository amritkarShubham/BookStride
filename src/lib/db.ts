// ─────────────────────────────────────────────────────
// Bookstride — Dexie IndexedDB Database
// ─────────────────────────────────────────────────────

import Dexie, { type EntityTable } from 'dexie';
import type { Book, ReadingSession, DailyLog } from './types';

class BookstrideDB extends Dexie {
  books!: EntityTable<Book, 'id'>;
  sessions!: EntityTable<ReadingSession, 'id'>;
  dailyLogs!: EntityTable<DailyLog, 'id'>;

  constructor() {
    super('BookstrideDB');

    this.version(1).stores({
      books: '++id, title, author, status, addedAt',
      sessions: '++id, bookId, startedAt, endedAt',
      dailyLogs: '++id, &date',
    });
  }
}

export const db = new BookstrideDB();
