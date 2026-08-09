import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const query = `
-- 15. Link books to profiles (for joining in Community Feed)
alter table books 
add constraint fk_books_profiles 
foreign key (user_id) references public.profiles(id) on delete cascade;

-- 16. Link reading_sessions to profiles (for joining in Community Feed)
alter table reading_sessions
add constraint fk_sessions_profiles
foreign key (user_id) references public.profiles(id) on delete cascade;

-- 17. Create recommendations table
create table recommendations (
  id uuid default gen_random_uuid() primary key,
  recommender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  book_id uuid,
  book_title text not null,
  book_author text,
  cover_url text,
  message text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 18. Enable RLS on recommendations
alter table recommendations enable row level security;

-- 19. Recommendation Policies
create policy "Users can view recommendations they sent" on recommendations for select using (auth.uid() = recommender_id);
create policy "Users can view recommendations they received" on recommendations for select using (auth.uid() = receiver_id);
create policy "Users can send recommendations" on recommendations for insert with check (auth.uid() = recommender_id);
create policy "Receivers can update recommendations" on recommendations for update using (auth.uid() = receiver_id);
  `;

  // We can't run raw SQL using the client SDK if rpc is not set up.
  // Wait! The user's Supabase instance has a function called `exec_sql`.
  const { data, error } = await supabase.rpc('exec_sql', { sql: query });
  
  if (error) {
    console.error("Error:", error);
    process.exit(1);
  } else {
    console.log("Success:", data);
  }
}

run();
