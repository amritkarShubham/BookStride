'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Navbar } from '@/components/layout/navbar';
import { createClient } from '@/lib/supabase/client';
import { db } from '@/lib/db';

export default function ProfileRedirect() {
  const router = useRouter();
  const { userProfile, setUserProfile } = useAppStore();

  useEffect(() => {
    const fetchAndRedirect = async () => {
      if (userProfile?.username) {
        router.replace(`/profile/${userProfile.username}`);
        return;
      }

      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          const profile = await db.profiles.get(data.user.id);
          if (profile) {
            setUserProfile(profile);
            router.replace(`/profile/${profile.username}`);
            return;
          }
        }
      } catch (e) {
        console.error(e);
      }
      
      // If all fails, go home
      router.replace('/');
    };

    fetchAndRedirect();
  }, [userProfile, router, setUserProfile]);

  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-forest border-t-transparent animate-spin" />
      </main>
    </>
  );
}
