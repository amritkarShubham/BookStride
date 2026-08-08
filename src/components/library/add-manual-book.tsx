'use client';

import { useState, useCallback } from 'react';
import { Search, Plus, Loader2, X, BookOpen } from 'lucide-react';
import { searchBooks } from '@/lib/open-library';
import { db } from '@/lib/db';
import type { OpenLibrarySearchResult, Book } from '@/lib/types';

interface AddManualBookProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: () => void;
}

export function AddManualBook({ isOpen, onClose, onBookAdded }: AddManualBookProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OpenLibrarySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<OpenLibrarySearchResult | null>(null);
  const [dateRead, setDateRead] = useState('');
  const [status, setStatus] = useState<'completed' | 'reading' | 'want-to-read'>('completed');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleClose = useCallback(() => {
    setFile(null);
    setSelectedResult(null);
    setQuery('');
    setResults([]);
    onClose();
  }, [onClose]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    const res = await searchBooks(query, 8);
    setResults(res);
    setIsSearching(false);
  }, [query]);

  const handleAddBook = async () => {
    if (!selectedResult) return;
    setIsUploading(true);

    let fileBuffer: ArrayBuffer | undefined;
    let fileType: 'pdf' | 'epub' | null = null;

    if (file) {
      fileBuffer = await file.arrayBuffer();
      fileType = file.name.toLowerCase().endsWith('.epub') ? 'epub' : 'pdf';
    }

    const book: Omit<Book, 'id' | 'user_id'> = {
      title: selectedResult.title,
      author: selectedResult.author,
      coverUrl: selectedResult.coverUrl,
      totalPages: selectedResult.pageCount || 300,
      currentPage: status === 'completed' ? selectedResult.pageCount || 300 : 0,
      completionPct: status === 'completed' ? 100 : 0,
      status,
      fileType,
      fileUrl: null,
      description: '',
      genres: [],
      publishedYear: selectedResult.publishYear,
      isbn: selectedResult.isbn,
      currentChapter: status === 'completed' ? 'Complete' : '',
      addedAt: Date.now(),
      completedAt: status === 'completed'
        ? dateRead ? new Date(dateRead).getTime() : Date.now()
        : null,
    };

    try {
      await db.books.add(book, fileBuffer);
      onBookAdded();
      handleClose();
    } catch (e) {
      console.error('Failed to add book', e);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
      <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-fade-in-up max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-beige">
          <h2 className="font-serif text-xl text-ink">Add a Book</h2>
          <button onClick={handleClose} disabled={isUploading} className="p-1.5 rounded-lg hover:bg-beige transition-colors disabled:opacity-50">
            <X className="w-4 h-4 text-ink-light" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          {!selectedResult ? (
            <>
              {/* Search */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2.5 bg-beige/50 border border-beige-border rounded-xl text-ink text-sm placeholder:text-ink-light/50 focus:outline-none focus:ring-2 focus:ring-forest/30"
                    placeholder="Search by title or author..."
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-4 py-2.5 rounded-xl bg-forest text-cream text-sm font-medium hover:bg-forest-light transition-colors disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </button>
              </div>

              {/* Results */}
              <div className="space-y-2">
                {results.map((result, i) => (
                  <button
                    key={`${result.key}-${i}`}
                    onClick={() => setSelectedResult(result)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-beige/70 transition-colors text-left group"
                  >
                    <div className="w-12 h-16 rounded-md overflow-hidden flex-shrink-0 bg-forest/10">
                      {result.coverUrl ? (
                        <img src={result.coverUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-forest/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{result.title}</p>
                      <p className="text-xs text-ink-light truncate">{result.author}</p>
                      <p className="text-[10px] text-ink-light/60 mt-0.5">
                        {result.publishYear && `${result.publishYear} · `}
                        {result.pageCount ? `${result.pageCount} pages` : ''}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-ink-light opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}

                {results.length === 0 && query && !isSearching && (
                  <div className="text-center py-8">
                    <p className="text-sm text-ink-light">No results found. Try a different search.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Selected Book Review */
            <div>
              <div className="flex gap-4 mb-5">
                <div className="w-20 aspect-[2/3] rounded-lg overflow-hidden shadow-md bg-forest flex-shrink-0">
                  {selectedResult.coverUrl ? (
                    <img src={selectedResult.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-cream/50" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-lg text-ink">{selectedResult.title}</h3>
                  <p className="text-sm text-ink-light">{selectedResult.author}</p>
                  {selectedResult.pageCount > 0 && (
                    <p className="text-xs text-ink-light/60 mt-1">{selectedResult.pageCount} pages</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="text-[10px] uppercase tracking-wider text-ink-light mb-2 block">
                  Status
                </label>
                <div className="flex gap-2">
                  {(['completed', 'reading', 'want-to-read'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        status === s
                          ? 'bg-forest text-cream'
                          : 'bg-beige text-ink-light hover:bg-beige-border'
                      }`}
                    >
                      {s === 'want-to-read' ? 'Want to Read' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Read (for completed) */}
              {status === 'completed' && (
                <div className="mb-5">
                  <label className="text-[10px] uppercase tracking-wider text-ink-light mb-2 block">
                    Date Read (optional)
                  </label>
                  <input
                    type="date"
                    value={dateRead}
                    onChange={(e) => setDateRead(e.target.value)}
                    className="bg-beige/50 border border-beige-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                </div>
              )}

              {/* Attach File */}
              <div className="mb-5">
                <label className="text-[10px] uppercase tracking-wider text-ink-light mb-2 block">
                  Attach File (optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.epub"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    disabled={isUploading}
                    className="block w-full text-sm text-ink-light
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-xs file:font-medium
                      file:bg-beige file:text-ink
                      hover:file:bg-beige-border transition-colors cursor-pointer disabled:opacity-50"
                  />
                </div>
                <p className="text-[10px] text-ink-light/60 mt-1">Upload a PDF or EPUB to read in the app</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedResult(null)}
                  disabled={isUploading}
                  className="px-4 py-2.5 rounded-xl text-sm text-ink-light hover:bg-beige transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleAddBook}
                  disabled={isUploading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest text-cream text-sm font-medium hover:bg-forest-light transition-colors disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {isUploading ? 'Adding...' : 'Add to Library'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
