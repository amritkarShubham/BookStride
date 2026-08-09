// ─────────────────────────────────────────────────────
// Bookstride — Zustand App Store (with persist)
// ─────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile } from './types';

interface AppState {
  // User profile
  userName: string;
  userInitials: string;
  userProfile: Profile | null;

  // Active reading session
  activeBookId: string | null;
  isSessionActive: boolean;
  sessionStartTime: number | null;
  sessionElapsedSeconds: number;
  sessionWordsRead: number;

  // UI state
  isSidebarOpen: boolean;
  isReaderOpen: boolean;
  isUploadOpen: boolean;
  isSettingsOpen: boolean;

  // Actions
  setUserName: (name: string) => void;
  setUserInitials: (initials: string) => void;
  setUserProfile: (profile: Profile | null) => void;
  startSession: (bookId: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  updateSessionTime: (seconds: number) => void;
  addSessionWords: (words: number) => void;
  setActiveBookId: (id: string | null) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openReader: (bookId: string) => void;
  closeReader: () => void;
  openUpload: () => void;
  closeUpload: () => void;
  openSettings: () => void;
  closeSettings: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Defaults
      userName: 'Reader',
      userInitials: 'RE',
      userProfile: null,
      activeBookId: null,
      isSessionActive: false,
      sessionStartTime: null,
      sessionElapsedSeconds: 0,
      sessionWordsRead: 0,
      isSidebarOpen: false,
      isReaderOpen: false,
      isUploadOpen: false,
      isSettingsOpen: false,

      // Actions
      setUserName: (name) => {
        const initials = name
          .split(' ')
          .filter((w) => w.length > 0)
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'RE';
        set({ userName: name, userInitials: initials });
      },
      setUserInitials: (initials) => set({ userInitials: initials }),
      setUserProfile: (profile) => {
        if (profile) {
          const name = profile.displayName || profile.username;
          const initials = name
            .split(' ')
            .filter((w) => w.length > 0)
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'RE';
          set({ userProfile: profile, userName: name, userInitials: initials });
        } else {
          set({ userProfile: null });
        }
      },

      startSession: (bookId) =>
        set({
          activeBookId: bookId,
          isSessionActive: true,
          sessionStartTime: Date.now(),
          sessionElapsedSeconds: 0,
          sessionWordsRead: 0,
        }),
      pauseSession: () => set({ isSessionActive: false }),
      resumeSession: () =>
        set({ isSessionActive: true, sessionStartTime: Date.now() }),
      endSession: () =>
        set({
          isSessionActive: false,
          sessionStartTime: null,
          sessionElapsedSeconds: 0,
          sessionWordsRead: 0,
        }),
      updateSessionTime: (seconds) =>
        set({ sessionElapsedSeconds: seconds }),
      addSessionWords: (words) =>
        set((s) => ({ sessionWordsRead: s.sessionWordsRead + words })),

      setActiveBookId: (id) => set({ activeBookId: id }),
      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
      closeSidebar: () => set({ isSidebarOpen: false }),
      openReader: (bookId) =>
        set({ isReaderOpen: true, activeBookId: bookId }),
      closeReader: () => set({ isReaderOpen: false }),
      openUpload: () => set({ isUploadOpen: true }),
      closeUpload: () => set({ isUploadOpen: false }),
      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),
    }),
    {
      name: 'bookstride-store',
      partialize: (state) => ({
        userName: state.userName,
        userInitials: state.userInitials,
      }),
    }
  )
);
