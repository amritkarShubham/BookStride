// ─────────────────────────────────────────────────────
// Bookstride — Session Manager (Dexie + Store bridge)
// ─────────────────────────────────────────────────────

import { db } from './db';
import type { ReadingSession, DailyLog } from './types';
import { WpmEngine } from './wpm-engine';

function getTodayDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Create and persist a completed reading session.
 */
export async function saveSession(
  bookId: number,
  wpmEngine: WpmEngine,
  startedAt: number
): Promise<ReadingSession> {
  wpmEngine.endCurrentPage(); // finalize last page

  const session: ReadingSession = {
    bookId,
    startedAt,
    endedAt: Date.now(),
    durationSeconds: Math.round(wpmEngine.getTotalDurationSeconds()),
    wordsRead: wpmEngine.getTotalWordsRead(),
    avgWpm: wpmEngine.getAverageWpm(),
    pagesRead: wpmEngine.getPagesRead(),
  };

  const id = await db.sessions.add(session);
  session.id = id;

  // Update daily log
  await updateDailyLog(session);

  return session;
}

/**
 * Update or create the daily log entry for today.
 */
async function updateDailyLog(session: ReadingSession): Promise<void> {
  const today = getTodayDateStr();
  const existing = await db.dailyLogs.where('date').equals(today).first();

  if (existing) {
    await db.dailyLogs.update(existing.id!, {
      totalSeconds: existing.totalSeconds + session.durationSeconds,
      totalWords: existing.totalWords + session.wordsRead,
      sessionsCount: existing.sessionsCount + 1,
    });
  } else {
    const log: DailyLog = {
      date: today,
      totalSeconds: session.durationSeconds,
      totalWords: session.wordsRead,
      booksRead: 0,
      sessionsCount: 1,
    };
    await db.dailyLogs.add(log);
  }
}

/**
 * Update book progress after a reading session.
 */
export async function updateBookProgress(
  bookId: number,
  currentPage: number,
  totalPages: number
): Promise<void> {
  const pct = totalPages > 0
    ? Math.min(100, parseFloat(((currentPage / totalPages) * 100).toFixed(1)))
    : 0;

  await db.books.update(bookId, {
    currentPage,
    completionPct: pct,
    status: pct >= 100 ? 'completed' : 'reading',
    ...(pct >= 100 ? { completedAt: Date.now() } : {}),
  });
}

/**
 * Get weekly stats for the momentum chart.
 */
export async function getWeeklyStats(): Promise<{
  days: { label: string; minutes: number; words: number; isToday: boolean }[];
  totalMinutes: number;
  totalWords: number;
  streakDays: number;
}> {
  const today = new Date();
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days: { label: string; minutes: number; words: number; isToday: boolean }[] = [];

  // Get start of current week (Monday)
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust so Monday = 0
  startOfWeek.setDate(today.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  let totalMinutes = 0;
  let totalWords = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const isToday = dateStr === today.toISOString().slice(0, 10);

    const log = await db.dailyLogs.where('date').equals(dateStr).first();
    const minutes = log ? Math.round(log.totalSeconds / 60) : 0;
    const words = log ? log.totalWords : 0;

    days.push({
      label: dayLabels[(i + 1) % 7], // Mon, Tue, ...
      minutes,
      words,
      isToday,
    });

    totalMinutes += minutes;
    totalWords += words;
  }

  // Calculate streak
  const streakDays = await calculateStreak();

  return { days, totalMinutes, totalWords, streakDays };
}

/**
 * Calculate the current reading streak (consecutive days with activity).
 */
async function calculateStreak(): Promise<number> {
  const logs = await db.dailyLogs.orderBy('date').reverse().toArray();
  if (logs.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    const log = logs.find((l) => l.date === dateStr);
    if (log && log.totalSeconds > 0) {
      streak++;
    } else if (i > 0) {
      // Allow today to have no activity yet
      break;
    }
  }

  return streak;
}

/**
 * Get the user's best WPM record.
 */
export async function getBestWpm(): Promise<number> {
  const sessions = await db.sessions.toArray();
  if (sessions.length === 0) return 0;
  return Math.max(...sessions.map((s) => s.avgWpm));
}
