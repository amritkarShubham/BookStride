'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Plus, Search, Filter, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import type { Book, BookStatus } from '@/lib/types';
import { AddManualBook } from './add-manual-book';
import { BookDetailsModal } from './book-details-modal';

export function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filter, setFilter] = useState<BookStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDetailsBook, setSelectedDetailsBook] = useState<Book | null>(null);
  const { openReader } = useAppStore();

  const loadBooks = useCallback(async () => {
    const allBooks = await db.books.getAll();
    setBooks(allBooks);
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const handleDeleteBook = async (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to permanently delete "${book.title}"?`)) {
      if (book.id) {
        await db.books.delete(book.id);
        loadBooks();
      }
    }
  };

  const filteredBooks = books.filter((b) => {
    const matchesFilter = filter === 'all' || b.status === filter;
    const matchesSearch =
      !searchQuery ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: books.length,
    reading: books.filter((b) => b.status === 'reading').length,
    completed: books.filter((b) => b.status === 'completed').length,
    'want-to-read': books.filter((b) => b.status === 'want-to-read').length,
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-ink">Your Library</h1>
          <p className="text-sm text-ink-light mt-1">
            {books.length} {books.length === 1 ? 'book' : 'books'} in your collection
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-cream text-sm font-medium hover:bg-forest-light transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Book
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-beige/50 border border-beige-border rounded-xl text-ink text-sm placeholder:text-ink-light/50 focus:outline-none focus:ring-2 focus:ring-forest/30"
            placeholder="Search your library..."
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-ink-light mr-1" />
          {(
            [
              ['all', 'All'],
              ['reading', 'Reading'],
              ['completed', 'Done'],
              ['want-to-read', 'Want'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === key
                  ? 'bg-forest text-cream'
                  : 'bg-beige text-ink-light hover:bg-beige-border'
              }`}
            >
              {label} ({statusCounts[key]})
            </button>
          ))}
        </div>
      </div>

      {/* Book Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 stagger-children">
          {filteredBooks.map((book) => (
            <button
              key={book.id}
              onClick={() => book.id && openReader(book.id)}
              className="text-left group"
            >
                <div className="book-spine relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1.5 mb-3">
                  {/* Delete Button */}
                  <div 
                    onClick={(e) => handleDeleteBook(e, book)}
                    className="absolute top-2 right-2 z-20 p-1.5 bg-black/60 backdrop-blur-sm hover:bg-terracotta text-cream rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                    title="Delete book"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </div>
                  
                  {/* Info Button */}
                  <div 
                    onClick={(e) => { e.stopPropagation(); setSelectedDetailsBook(book); }}
                    className="absolute top-2 left-2 z-20 p-1.5 bg-black/60 backdrop-blur-sm hover:bg-forest text-cream rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                    title="Book details"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>

                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-forest flex items-center justify-center p-4">
                      <span className="font-serif text-cream text-center text-sm leading-tight">
                        {book.title}
                      </span>
                    </div>
                  )}
                </div>

              {/* Progress */}
              <div className="progress-dual mb-2">
                <div
                  className="progress-dual-fill"
                  style={{ width: `${book.completionPct}%` }}
                />
              </div>

              <h4 className="text-sm font-medium text-ink truncate leading-tight">
                {book.title}
              </h4>
              <p className="text-xs text-ink-light truncate mt-0.5">
                {book.author}
              </p>
              <p className="text-[10px] mt-1">
                {book.status === 'completed' ? (
                  <span className="text-sage font-medium">✓ Complete</span>
                ) : book.status === 'reading' ? (
                  <span className="text-terracotta font-medium">
                    {book.completionPct}% read
                  </span>
                ) : (
                  <span className="text-ink-light">Want to read</span>
                )}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-beige-border mx-auto mb-4" />
          <p className="font-serif text-xl text-ink mb-2">
            {searchQuery ? 'No books found' : 'Your library is empty'}
          </p>
          <p className="text-sm text-ink-light mb-6">
            {searchQuery
              ? 'Try a different search term.'
              : 'Add your first book to start your reading journey.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-cream text-sm font-medium hover:bg-forest-light transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Book
            </button>
          )}
        </div>
      )}

      {/* Add Manual Book Modal */}
      <AddManualBook
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onBookAdded={() => {
          setIsAddOpen(false);
          loadBooks();
        }}
      />
      
      {/* Book Details Modal */}
      {selectedDetailsBook && (
        <BookDetailsModal
          book={selectedDetailsBook}
          onClose={() => setSelectedDetailsBook(null)}
        />
      )}
    </div>
  );
}
