'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EpubViewerProps {
  fileUrl: string;
  onPageChange: (location: string, progress: number, wordCount: number) => void;
}

export function EpubViewer({ fileUrl, onPageChange }: EpubViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renditionRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadEpub() {
      const ePub = (await import('epubjs')).default;
      const book = ePub(fileUrl);
      bookRef.current = book;

      if (!viewerRef.current || !mounted) return;

      const rendition = book.renderTo(viewerRef.current, {
        width: '100%',
        height: '100%',
        spread: 'none',
      });

      renditionRef.current = rendition;

      // Style the epub content to match our aesthetic
      rendition.themes.default({
        body: {
          'font-family': 'Inter, sans-serif !important',
          'color': '#1C2A24 !important',
          'background': '#FFFEF9 !important',
          'line-height': '1.8 !important',
          'padding': '20px !important',
        },
        'h1, h2, h3': {
          'font-family': '"Instrument Serif", serif !important',
          'color': '#1C2A24 !important',
        },
      });

      await rendition.display();
      setIsLoading(false);

      // Track location changes
      rendition.on('relocated', (location: { start: { cfi: string; percentage: number; displayed: { page: number; total: number } } }) => {
        if (!mounted) return;

        const progress = Math.round(location.start.percentage * 100 * 10) / 10;

        // Estimate word count from the visible content
        const iframe = viewerRef.current?.querySelector('iframe');
        let wordCount = 250; // default estimate
        if (iframe?.contentDocument) {
          const text = iframe.contentDocument.body?.innerText || '';
          wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
        }

        onPageChange(location.start.cfi, progress, wordCount);
      });
    }

    loadEpub();
    return () => {
      mounted = false;
      bookRef.current?.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl]);

  const prevPage = () => renditionRef.current?.prev();
  const nextPage = () => renditionRef.current?.next();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-ink-light text-sm">Loading ePub...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <div className="flex-1 relative">
        <div ref={viewerRef} className="w-full h-full" />

        {/* Prev / Next overlays */}
        <button
          onClick={prevPage}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-cream/80 shadow-md hover:bg-beige transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-ink" />
        </button>
        <button
          onClick={nextPage}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-cream/80 shadow-md hover:bg-beige transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-ink" />
        </button>
      </div>
    </div>
  );
}
