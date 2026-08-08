'use client';

import { Trophy } from 'lucide-react';

interface LittleWinsProps {
  bestWpm: number;
  totalBooksCompleted: number;
  totalSessions: number;
}

export function LittleWins({
  bestWpm,
  totalBooksCompleted,
  totalSessions,
}: LittleWinsProps) {
  return (
    <div
      className="rounded-xl bg-forest p-5 text-cream animate-fade-in-up shadow-lg"
      style={{ animationDelay: '240ms' }}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-serif text-lg text-cream/90">Little Wins</h3>
        <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-gold" />
        </div>
      </div>

      {/* Hero Stat */}
      <div className="mb-5">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-4xl font-bold text-cream tracking-tight tabular-nums">
            {bestWpm || '—'}
          </span>
          <span className="text-sm text-cream/60 uppercase tracking-wider">
            WPM
          </span>
        </div>
        <p className="text-sm text-gold mt-1 font-medium">
          {bestWpm > 0 ? 'Best Pace' : 'Start reading to track pace'}
        </p>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-cream/10">
        <div>
          <p className="text-2xl font-semibold text-cream tabular-nums">
            {totalBooksCompleted}
          </p>
          <p className="text-xs text-cream/50 uppercase tracking-wider mt-0.5">
            Books Done
          </p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-cream tabular-nums">
            {totalSessions}
          </p>
          <p className="text-xs text-cream/50 uppercase tracking-wider mt-0.5">
            Sessions
          </p>
        </div>
      </div>
    </div>
  );
}
