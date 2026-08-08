'use client';

import { useState } from 'react';
import { X, User, Trash2, BookOpen, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

interface SettingsModalProps {
  onDataCleared?: () => void;
}

export function SettingsModal({ onDataCleared }: SettingsModalProps) {
  const { isSettingsOpen, closeSettings, userName, setUserName, userInitials } =
    useAppStore();
  const [nameInput, setNameInput] = useState(userName);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isSettingsOpen) return null;

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
      <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-beige">
          <h2 className="font-serif text-xl text-ink">Settings</h2>
          <button
            onClick={closeSettings}
            className="p-1.5 rounded-lg hover:bg-beige transition-colors"
          >
            <X className="w-4 h-4 text-ink-light" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Profile Section */}
          <div>
            <div className="chapter-divider mb-4">Profile</div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-forest text-cream flex items-center justify-center text-lg font-semibold tracking-wide ring-2 ring-forest/10">
                {userInitials}
              </div>
              <div>
                <p className="text-sm font-medium text-ink">{userName}</p>
                <p className="text-xs text-ink-light">Your reading profile</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-wider text-ink-light block">
                Display Name
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => {
                      setNameInput(e.target.value);
                      setIsSaved(false);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="w-full pl-10 pr-4 py-2.5 bg-beige/50 border border-beige-border rounded-xl text-ink text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
                    placeholder="Enter your name..."
                  />
                </div>
                <button
                  onClick={handleSaveName}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isSaved
                      ? 'bg-sage/20 text-sage'
                      : 'bg-forest text-cream hover:bg-forest-light'
                  }`}
                >
                  {isSaved ? '✓ Saved' : 'Save'}
                </button>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div>
            <div className="chapter-divider mb-4">About</div>
            <div className="card-dotted p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-forest" strokeWidth={1.6} />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">Bookstride</p>
                  <p className="text-[10px] text-ink-light">v1.0.0 · Strava for Books</p>
                </div>
              </div>
              <p className="text-xs text-ink-light leading-relaxed">
                Track your reading speed, build streaks, and visualize your
                literary journey. Your data is synced securely to the cloud.
              </p>
            </div>
          </div>

          {/* Danger Zone */}
          <div>
            <div className="chapter-divider mb-4">Account</div>
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-terracotta hover:bg-terracotta/5 transition-colors w-full"
              >
                <Trash2 className="w-4 h-4" />
                Sign Out
              </button>
            ) : (
              <div className="bg-terracotta/5 rounded-xl p-4 border border-terracotta/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-terracotta" />
                  <p className="text-sm font-medium text-terracotta">
                    Are you sure?
                  </p>
                </div>
                <p className="text-xs text-ink-light mb-3">
                  You will need to sign back in to access your library.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm text-ink-light hover:bg-beige transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex-1 px-3 py-2 rounded-lg text-sm bg-terracotta text-cream hover:bg-terracotta-dark transition-colors font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
