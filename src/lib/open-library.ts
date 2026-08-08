// ─────────────────────────────────────────────────────
// Bookstride — Open Library API Client
// ─────────────────────────────────────────────────────

import type { OpenLibrarySearchResult } from './types';

const BASE = 'https://openlibrary.org';

export async function searchBooks(
  query: string,
  limit = 10
): Promise<OpenLibrarySearchResult[]> {
  const url = `${BASE}/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=key,title,author_name,cover_i,number_of_pages_median,isbn,first_publish_year`;

  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.docs || []).map((doc: any) => ({
    title: doc.title || 'Unknown Title',
    author: doc.author_name?.[0] || 'Unknown Author',
    coverUrl: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
      : '',
    pageCount: doc.number_of_pages_median || 0,
    isbn: doc.isbn?.[0] || '',
    publishYear: doc.first_publish_year || null,
    key: doc.key || '',
  }));
}

export function getCoverUrl(
  coverId: number | string,
  size: 'S' | 'M' | 'L' = 'L'
): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

export async function searchBookByTitleAuthor(
  title: string,
  author: string
): Promise<OpenLibrarySearchResult | null> {
  const query = `${title} ${author}`.trim();
  const results = await searchBooks(query, 3);
  return results[0] || null;
}
