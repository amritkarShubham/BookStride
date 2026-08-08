// ─────────────────────────────────────────────────────
// Bookstride — PDF Text & Metadata Extractor (Client-side)
// ─────────────────────────────────────────────────────

import type { BookMetadata } from './types';

let pdfjsLib: typeof import('pdfjs-dist') | null = null;

async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib;
  pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  return pdfjsLib;
}

/**
 * Extract text from the first N pages of a PDF ArrayBuffer.
 */
export async function extractPdfText(
  data: ArrayBuffer,
  maxPages = 3
): Promise<{ text: string; totalPages: number }> {
  const pdfjs = await getPdfjs();
  const pdf = await pdfjs.getDocument({ data }).promise;
  const totalPages = pdf.numPages;
  const pagesToRead = Math.min(maxPages, totalPages);
  const textParts: string[] = [];

  for (let i = 1; i <= pagesToRead; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str || '')
      .join(' ');
    textParts.push(pageText);
  }

  return { text: textParts.join('\n\n'), totalPages };
}

/**
 * Extract metadata from PDF document properties.
 */
export async function extractPdfMetadata(
  data: ArrayBuffer
): Promise<Partial<BookMetadata>> {
  const pdfjs = await getPdfjs();
  const pdf = await pdfjs.getDocument({ data }).promise;
  const meta = await pdf.getMetadata();
  const info = meta.info as Record<string, string | undefined>;

  return {
    title: info?.Title || '',
    author: info?.Author || '',
    totalPages: pdf.numPages,
  };
}

/**
 * Count words on a specific page of the PDF.
 */
export async function countWordsOnPage(
  data: ArrayBuffer,
  pageNum: number
): Promise<number> {
  const pdfjs = await getPdfjs();
  const pdf = await pdfjs.getDocument({ data }).promise;

  if (pageNum < 1 || pageNum > pdf.numPages) return 0;

  const page = await pdf.getPage(pageNum);
  const content = await page.getTextContent();
  const text = content.items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => item.str || '')
    .join(' ');

  return text
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}
