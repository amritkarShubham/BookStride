'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface PdfViewerProps {
  fileUrl: string;
  currentPage: number;
  onPageChange: (page: number, totalPages: number, wordCount: number) => void;
}

export function PdfViewer({ fileUrl, currentPage, onPageChange }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(currentPage || 1);
  const [scale, setScale] = useState(1.2);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfDocRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load PDF document
  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

      const pdf = await pdfjs.getDocument({ url: fileUrl }).promise;
      if (cancelled) return;

      pdfDocRef.current = pdf;
      setTotalPages(pdf.numPages);
      setIsLoading(false);
    }

    loadPdf();
    return () => { cancelled = true; };
  }, [fileUrl]);

  // Render current page
  const renderPage = useCallback(async (pageNum: number) => {
    const pdf = pdfDocRef.current;
    if (!pdf || !canvasRef.current) return;

    const pdfPage = await pdf.getPage(pageNum);
    const viewport = pdfPage.getViewport({ scale });
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await pdfPage.render({ canvasContext: context, viewport }).promise;

    // Extract word count for WPM tracking
    const textContent = await pdfPage.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = textContent.items.map((item: any) => item.str || '').join(' ');
    const wordCount = text.split(/\s+/).filter((w: string) => w.length > 0).length;

    onPageChange(pageNum, pdf.numPages, wordCount);
  }, [scale, onPageChange]);

  useEffect(() => {
    if (!isLoading) {
      renderPage(page);
    }
  }, [page, isLoading, renderPage]);

  const goToPage = (p: number) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-ink-light text-sm">Loading PDF...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-cream/80 border-b border-beige">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded-lg hover:bg-beige disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-ink tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg hover:bg-beige disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
            className="p-1.5 rounded-lg hover:bg-beige transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-ink-light w-12 text-center tabular-nums">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(3, s + 0.2))}
            className="p-1.5 rounded-lg hover:bg-beige transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto flex justify-center p-4 bg-beige/30">
        <canvas
          ref={canvasRef}
          className="shadow-lg rounded-sm max-w-full"
          style={{ maxHeight: '100%', objectFit: 'contain' }}
        />
      </div>
    </div>
  );
}
