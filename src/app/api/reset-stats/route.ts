import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = userData.user.id;

  // Delete all daily logs for this user
  const { error: logsError } = await supabase
    .from('daily_logs')
    .delete()
    .eq('user_id', userId);

  // Delete all reading sessions for this user
  const { error: sessionsError } = await supabase
    .from('reading_sessions')
    .delete()
    .eq('user_id', userId);

  if (logsError || sessionsError) {
    return NextResponse.json(
      { error: logsError?.message || sessionsError?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, message: 'All reading stats have been reset.' });
}
