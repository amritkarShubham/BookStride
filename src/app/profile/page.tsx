'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Navbar } from '@/components/layout/navbar';

export default function ProfileRedirect() {
  const router = useRouter();
  const { userProfile } = useAppStore();

  useEffect(() => {
    if (userProfile?.username) {
      router.replace(`/profile/${userProfile.username}`);
    } else {
      router.replace('/');
    }
  }, [userProfile, router]);

  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-forest border-t-transparent animate-spin" />
      </main>
    </>
  );
}
