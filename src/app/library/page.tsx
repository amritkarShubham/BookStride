'use client';

import { Navbar } from '@/components/layout/navbar';
import { LibraryPage } from '@/components/library/library-page';
import { ReaderModal } from '@/components/reader/reader-modal';
import { useAppStore } from '@/lib/store';

export default function Library() {
  const { isReaderOpen, activeBookId, closeReader } = useAppStore();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <LibraryPage />
      </main>

      {/* Reader Modal */}
      {isReaderOpen && activeBookId && (
        <ReaderModal bookId={activeBookId} onClose={closeReader} />
      )}
    </>
  );
}
