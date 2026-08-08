// ─────────────────────────────────────────────────────
// Bookstride — Confetti Celebrations
// ─────────────────────────────────────────────────────

import confetti from 'canvas-confetti';

/**
 * Celebrate finishing a book with full-screen confetti burst.
 */
export function celebrateBookComplete(): void {
  const duration = 3000;
  const end = Date.now() + duration;

  const colors = ['#C25943', '#233D34', '#C9A96E', '#92A892'];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

/**
 * Celebrate a new WPM record with a subtle burst.
 */
export function celebrateNewRecord(): void {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#C25943', '#C9A96E'],
  });
}

/**
 * Celebrate a streak milestone with star-shaped confetti.
 */
export function celebrateStreak(): void {
  confetti({
    particleCount: 60,
    spread: 100,
    origin: { y: 0.5 },
    colors: ['#C25943', '#233D34', '#92A892'],
    shapes: ['star'],
    scalar: 1.2,
  });
}
