'use client';

import { useState } from 'react';
import { X, Check, Pencil, Loader2 } from 'lucide-react';
import type { BookMetadata } from '@/lib/types';

interface MetadataReviewModalProps {
  metadata: BookMetadata;
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: (metadata: BookMetadata) => void;
  onCancel: () => void;
}

export function MetadataReviewModal({
  metadata,
  isOpen,
  isLoading,
  onConfirm,
  onCancel,
}: MetadataReviewModalProps) {
  const [editedMeta, setEditedMeta] = useState<BookMetadata>(metadata);
  const [isEditing, setIsEditing] = useState(false);

  // Sync when metadata changes (e.g., AI result arrives)
  useState(() => {
    setEditedMeta(metadata);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
      <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-xl mx-4 animate-fade-in-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-beige sticky top-0 bg-cream rounded-t-2xl">
          <h2 className="font-serif text-xl text-ink">Review Book Details</h2>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-beige transition-colors"
          >
            <X className="w-4 h-4 text-ink-light" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-terracotta animate-spin" />
            <p className="text-sm text-ink-light">Extracting book metadata...</p>
          </div>
        ) : (
          <div className="p-5">
            {/* Cover + Title */}
            <div className="flex gap-5 mb-6">
              {/* Cover Preview */}
              <div className="flex-shrink-0 w-24 aspect-[2/3] rounded-lg overflow-hidden shadow-md bg-forest">
                {editedMeta.coverUrl ? (
                  <img
                    src={editedMeta.coverUrl}
                    alt={editedMeta.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-2">
                    <span className="font-serif text-cream text-xs text-center">
                      {editedMeta.title || 'No Cover'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editedMeta.title}
                      onChange={(e) =>
                        setEditedMeta((m) => ({ ...m, title: e.target.value }))
                      }
                      className="w-full bg-beige/50 border border-beige-border rounded-lg px-3 py-2 text-ink font-serif text-lg focus:outline-none focus:ring-2 focus:ring-forest/30"
                      placeholder="Book title"
                    />
                    <input
                      type="text"
                      value={editedMeta.author}
                      onChange={(e) =>
                        setEditedMeta((m) => ({ ...m, author: e.target.value }))
                      }
                      className="w-full bg-beige/50 border border-beige-border rounded-lg px-3 py-2 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
                      placeholder="Author"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="font-serif text-2xl text-ink leading-tight">
                      {editedMeta.title || 'Unknown Title'}
                    </h3>
                    <p className="text-sm text-ink-light mt-1">
                      {editedMeta.author || 'Unknown Author'}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="card-dotted p-3">
                <p className="text-[10px] uppercase tracking-wider text-ink-light mb-1">
                  Pages
                </p>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedMeta.totalPages}
                    onChange={(e) =>
                      setEditedMeta((m) => ({
                        ...m,
                        totalPages: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-transparent text-ink font-semibold focus:outline-none"
                  />
                ) : (
                  <p className="text-ink font-semibold">
                    {editedMeta.totalPages || '—'}
                  </p>
                )}
              </div>
              <div className="card-dotted p-3">
                <p className="text-[10px] uppercase tracking-wider text-ink-light mb-1">
                  Published
                </p>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedMeta.publishedYear || ''}
                    onChange={(e) =>
                      setEditedMeta((m) => ({
                        ...m,
                        publishedYear: parseInt(e.target.value) || null,
                      }))
                    }
                    className="w-full bg-transparent text-ink font-semibold focus:outline-none"
                    placeholder="Year"
                  />
                ) : (
                  <p className="text-ink font-semibold">
                    {editedMeta.publishedYear || '—'}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            {(editedMeta.description || isEditing) && (
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-wider text-ink-light mb-2">
                  Description
                </p>
                {isEditing ? (
                  <textarea
                    value={editedMeta.description}
                    onChange={(e) =>
                      setEditedMeta((m) => ({
                        ...m,
                        description: e.target.value,
                      }))
                    }
                    className="w-full bg-beige/50 border border-beige-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest/30 min-h-[80px] resize-none"
                    placeholder="Book description..."
                  />
                ) : (
                  <p className="text-sm text-ink-light leading-relaxed">
                    {editedMeta.description}
                  </p>
                )}
              </div>
            )}

            {/* Genres */}
            {editedMeta.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {editedMeta.genres.map((genre, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-sage/20 text-xs text-forest font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-beige">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-ink-light hover:bg-beige transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                {isEditing ? 'Done Editing' : 'Edit Details'}
              </button>

              <button
                onClick={() => onConfirm(editedMeta)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest text-cream text-sm font-medium hover:bg-forest-light transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" />
                Add to Library
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
