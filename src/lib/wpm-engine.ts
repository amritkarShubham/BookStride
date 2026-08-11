// ─────────────────────────────────────────────────────
// Bookstride — Real-Time WPM Calculation Engine
// ─────────────────────────────────────────────────────

const MIN_PAGE_SECONDS = 2;   // Ignore < 2s (rapid scanning)
const MAX_PAGE_SECONDS = 300; // Ignore > 5min (AFK)

export interface PageReading {
  pageNum: number;
  wordCount: number;
  startTime: number;
  endTime: number;
}

export class WpmEngine {
  private readings: PageReading[] = [];
  private currentPageStart: number | null = null;
  private currentPageWords: number = 0;
  private currentPageNum: number = 0;

  /**
   * Call when a user lands on a new page.
   */
  startPage(pageNum: number, wordCount: number): void {
    // Guard: don't re-start the same page (prevents double-counting from re-renders)
    if (this.currentPageNum === pageNum && this.currentPageStart !== null) {
      return;
    }

    // Record previous page reading if it exists
    if (this.currentPageStart !== null) {
      this.endCurrentPage();
    }
    this.currentPageStart = Date.now();
    this.currentPageWords = wordCount;
    this.currentPageNum = pageNum;
  }

  /**
   * End the current page reading session.
   */
  endCurrentPage(): void {
    if (this.currentPageStart === null) return;

    const endTime = Date.now();
    const durationSeconds = (endTime - this.currentPageStart) / 1000;

    // Anti-idle: only count valid reading durations
    if (durationSeconds >= MIN_PAGE_SECONDS && durationSeconds <= MAX_PAGE_SECONDS) {
      this.readings.push({
        pageNum: this.currentPageNum,
        wordCount: this.currentPageWords,
        startTime: this.currentPageStart,
        endTime,
      });
    }

    this.currentPageStart = null;
  }

  /**
   * Calculate average WPM across all valid page readings.
   */
  getAverageWpm(): number {
    if (this.readings.length === 0) return 0;

    let totalWords = 0;
    let totalSeconds = 0;

    for (const r of this.readings) {
      totalWords += r.wordCount;
      totalSeconds += (r.endTime - r.startTime) / 1000;
    }

    if (totalSeconds === 0) return 0;
    return Math.round((totalWords / totalSeconds) * 60);
  }

  /**
   * Get live WPM for the current page (call during active reading).
   */
  getLiveWpm(): number {
    if (this.currentPageStart === null || this.currentPageWords === 0) return 0;

    const elapsed = (Date.now() - this.currentPageStart) / 1000;
    if (elapsed < MIN_PAGE_SECONDS) return 0;

    return Math.round((this.currentPageWords / elapsed) * 60);
  }

  /**
   * Get total words read across all valid readings.
   */
  getTotalWordsRead(): number {
    return this.readings.reduce((sum, r) => sum + r.wordCount, 0);
  }

  /**
   * Get total reading duration in seconds.
   */
  getTotalDurationSeconds(): number {
    return this.readings.reduce(
      (sum, r) => sum + (r.endTime - r.startTime) / 1000,
      0
    );
  }

  /**
   * Get the number of pages read.
   */
  getPagesRead(): number {
    return this.readings.length;
  }

  /**
   * Reset the engine for a new session.
   */
  reset(): void {
    this.readings = [];
    this.currentPageStart = null;
    this.currentPageWords = 0;
    this.currentPageNum = 0;
  }
}
