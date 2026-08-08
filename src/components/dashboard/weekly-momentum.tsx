'use client';

import { Flame } from 'lucide-react';

interface WeeklyMomentumProps {
  days: { label: string; minutes: number; words: number; isToday: boolean }[];
  totalMinutes: number;
  totalWords: number;
  streakDays: number;
}

function formatReadingTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatWordCount(words: number): string {
  if (words >= 1000) return `${(words / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return words.toString();
}

export function WeeklyMomentum({
  days,
  totalMinutes,
  totalWords,
  streakDays,
}: WeeklyMomentumProps) {
  const maxMinutes = Math.max(...days.map((d) => d.minutes), 1);

  return (
    <div
      className="card-dotted p-5 animate-fade-in-up"
      style={{ animationDelay: '160ms' }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-serif text-lg text-ink">Weekly Momentum</h3>
        {streakDays > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta">
            <Flame className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">
              {streakDays} day streak
            </span>
          </div>
        )}
      </div>

      {/* Bar Chart */}
      <div className="flex items-end gap-2 h-32 mb-4">
        {days.map((day, i) => {
          const heightPct = maxMinutes > 0 ? (day.minutes / maxMinutes) * 100 : 0;
          const isActive = day.minutes > 0;
          const isPeak =
            day.minutes === maxMinutes && day.minutes > 0;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1.5"
            >
              {/* Bar */}
              <div className="w-full relative flex items-end justify-center h-24">
                <div
                  className={`w-full max-w-[28px] rounded-t-md transition-all duration-500 ease-out ${
                    isPeak
                      ? 'bg-terracotta'
                      : day.isToday
                        ? 'bg-terracotta/70'
                        : isActive
                          ? 'bg-sage'
                          : 'bg-beige'
                  }`}
                  style={{
                    height: `${Math.max(heightPct, 4)}%`,
                    transitionDelay: `${i * 60}ms`,
                  }}
                />
              </div>
              {/* Label */}
              <span
                className={`text-[10px] tracking-wide uppercase ${
                  day.isToday
                    ? 'text-terracotta font-semibold'
                    : 'text-ink-light'
                }`}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-6 pt-3 border-t border-beige">
        <div>
          <p className="text-xs text-ink-light uppercase tracking-wider">
            Total Time
          </p>
          <p className="text-lg font-semibold text-ink mt-0.5">
            {formatReadingTime(totalMinutes)}
          </p>
        </div>
        <div className="w-px h-8 bg-beige" />
        <div>
          <p className="text-xs text-ink-light uppercase tracking-wider">
            Words Read
          </p>
          <p className="text-lg font-semibold text-ink mt-0.5">
            {formatWordCount(totalWords)} words
          </p>
        </div>
      </div>
    </div>
  );
}
