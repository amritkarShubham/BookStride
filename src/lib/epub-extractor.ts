// ─────────────────────────────────────────────────────
// Bookstride — ePub Metadata Extractor (Client-side)
// ─────────────────────────────────────────────────────

import type { BookMetadata } from './types';

/**
 * Extract metadata from an ePub file ArrayBuffer using epubjs.
 */
export async function extractEpubMetadata(
  data: ArrayBuffer
): Promise<Partial<BookMetadata>> {
  const ePub = (await import('epubjs')).default;
  const book = ePub(data);
  await book.ready;

  const meta = book.packaging?.metadata;

  let coverUrl = '';
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coverHref = (book as any).cover || (book as any).packaging?.coverPath;
    if (coverHref) {
      const coverBlob = await book.archive?.getBlob(coverHref);
      if (coverBlob) {
        coverUrl = URL.createObjectURL(coverBlob);
      }
    }
  } catch {
    // Cover extraction may fail — that's okay
  }

  // Estimate total pages from spine items
  const spineLength = book.spine ? (book.spine as unknown as { length: number }).length || 0 : 0;
  const estimatedPages = Math.max(spineLength * 15, 100);

  return {
    title: meta?.title || '',
    author: meta?.creator || '',
    description: meta?.description || '',
    totalPages: estimatedPages,
    coverUrl,
  };
}

/**
 * Extract first N sections of text from an ePub for AI analysis.
 */
export async function extractEpubText(
  data: ArrayBuffer,
  maxSections = 3
): Promise<string> {
  const ePub = (await import('epubjs')).default;
  const book = ePub(data);
  await book.ready;

  const textParts: string[] = [];
  const spine = book.spine as unknown as { each: (fn: (item: { href: string }) => void) => void };
  let count = 0;

  return new Promise((resolve) => {
    spine.each((item) => {
      if (count >= maxSections) return;
      count++;

      book.archive?.getText(item.href).then((text: string) => {
        // Strip HTML tags
        const plainText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        textParts.push(plainText.slice(0, 2000));

        if (textParts.length >= maxSections) {
          resolve(textParts.join('\n\n'));
        }
      }).catch(() => {
        // Skip failed sections
      });
    });

    // Fallback timeout
    setTimeout(() => resolve(textParts.join('\n\n')), 5000);
  });
}
