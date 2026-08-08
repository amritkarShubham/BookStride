'use client';

import type { Book } from '@/lib/types';

interface ShelfNotesProps {
  books: Book[];
  onBookClick: (bookId: string) => void;
}

export function ShelfNotes({ books, onBookClick }: ShelfNotesProps) {
  if (books.length === 0) return null;

  return (
    <section className="animate-fade-in-up" style={{ animationDelay: '320ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg text-ink">Shelf Notes</h3>
        <span className="text-xs text-ink-light uppercase tracking-wider">
          Recent Books
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 shelf-scroll">
        {books.map((book) => (
          <button
            key={book.id}
            onClick={() => book.id && onBookClick(book.id)}
            className="flex-shrink-0 w-[130px] group text-left"
          >
            {/* Cover */}
            <div className="book-spine w-full aspect-[2/3] rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 mb-2.5">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-forest-light flex items-center justify-center p-3">
                  <span className="font-serif text-cream text-center text-xs leading-tight">
                    {book.title}
                  </span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="progress-dual mb-1.5">
              <div
                className="progress-dual-fill"
                style={{ width: `${book.completionPct}%` }}
              />
            </div>

            {/* Title & Progress */}
            <p className="text-xs text-ink font-medium truncate leading-tight">
              {book.title}
            </p>
            <p className="text-[10px] text-ink-light mt-0.5">
              {book.completionPct === 100 ? (
                <span className="text-sage font-medium">Complete</span>
              ) : (
                `${book.completionPct}%`
              )}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
