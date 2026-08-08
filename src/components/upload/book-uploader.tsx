'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, BookOpen, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface BookUploaderProps {
  onFileSelected: (file: File) => void;
}

export function BookUploader({ onFileSelected }: BookUploaderProps) {
  const { isUploadOpen, closeUpload } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && isValidFile(file)) {
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && isValidFile(file)) {
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  if (!isUploadOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
      <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-beige">
          <h2 className="font-serif text-xl text-ink">Upload a Book</h2>
          <button
            onClick={closeUpload}
            className="p-1.5 rounded-lg hover:bg-beige transition-colors"
          >
            <X className="w-4 h-4 text-ink-light" />
          </button>
        </div>

        {/* Drop Zone */}
        <div className="p-5">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 ${
              isDragging
                ? 'border-terracotta bg-terracotta/5 scale-[1.02]'
                : 'border-beige-border hover:border-sage hover:bg-sage/5'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.epub"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="file-upload"
            />

            <div className="flex justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-terracotta/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-terracotta" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-forest" />
              </div>
            </div>

            <p className="text-ink font-medium mb-1">
              {isDragging ? 'Drop your book here' : 'Drag & drop your book'}
            </p>
            <p className="text-sm text-ink-light">
              Supports <span className="font-mono text-terracotta">.pdf</span>{' '}
              and <span className="font-mono text-forest">.epub</span> files
            </p>

            <div className="mt-4 flex items-center gap-3 justify-center">
              <div className="h-px flex-1 bg-beige" />
              <span className="text-xs text-ink-light uppercase tracking-wider">
                or
              </span>
              <div className="h-px flex-1 bg-beige" />
            </div>

            <label
              htmlFor="file-upload"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-cream text-sm font-medium cursor-pointer hover:bg-forest-light transition-colors"
            >
              <Upload className="w-4 h-4" />
              Browse Files
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function isValidFile(file: File): boolean {
  const ext = file.name.toLowerCase();
  return ext.endsWith('.pdf') || ext.endsWith('.epub');
}
