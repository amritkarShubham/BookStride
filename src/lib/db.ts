import { createClient } from './supabase/client';
import type { Book, ReadingSession, DailyLog, Profile } from './types';

export const db = {
  books: {
    async getAll(): Promise<Book[]> {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('added_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(d => ({
        id: d.id,
        user_id: d.user_id,
        title: d.title,
        author: d.author,
        coverUrl: d.cover_url,
        totalPages: d.total_pages,
        currentPage: d.current_page,
        completionPct: d.completion_pct,
        status: d.status,
        fileType: d.file_type,
        fileUrl: d.file_url,
        description: d.description,
        genres: d.genres || [],
        publishedYear: d.published_year,
        isbn: d.isbn,
        currentChapter: d.current_chapter,
        addedAt: new Date(d.added_at).getTime(),
        completedAt: d.completed_at ? new Date(d.completed_at).getTime() : null,
      })) as Book[];
    },
    async getById(id: string): Promise<Book | null> {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;
      return {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        author: data.author,
        coverUrl: data.cover_url,
        totalPages: data.total_pages,
        currentPage: data.current_page,
        completionPct: data.completion_pct,
        status: data.status,
        fileType: data.file_type,
        fileUrl: data.file_url,
        description: data.description,
        genres: data.genres || [],
        publishedYear: data.published_year,
        isbn: data.isbn,
        currentChapter: data.current_chapter,
        addedAt: new Date(data.added_at).getTime(),
        completedAt: data.completed_at ? new Date(data.completed_at).getTime() : null,
      } as Book;
    },
    async add(book: Omit<Book, 'id' | 'user_id'>, fileData?: ArrayBuffer): Promise<string> {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      let fileUrl = null;
      if (fileData && book.fileType) {
        const fileName = `${userData.user.id}/${Date.now()}.${book.fileType}`;
        const { error: uploadError } = await supabase.storage
          .from('books')
          .upload(fileName, fileData, {
            contentType: book.fileType === 'pdf' ? 'application/pdf' : 'application/epub+zip',
          });
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage.from('books').getPublicUrl(fileName);
        fileUrl = publicUrlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('books')
        .insert({
          user_id: userData.user.id,
          title: book.title,
          author: book.author,
          cover_url: book.coverUrl,
          total_pages: book.totalPages,
          current_page: book.currentPage,
          completion_pct: book.completionPct,
          status: book.status,
          file_type: book.fileType,
          file_url: fileUrl,
          description: book.description,
          genres: book.genres,
          published_year: book.publishedYear,
          isbn: book.isbn,
          current_chapter: book.currentChapter,
          added_at: new Date(book.addedAt).toISOString(),
        })
        .select('id')
        .single();
      
      if (error) throw error;
      return data.id;
    },
    async update(id: string, updates: Partial<Book>): Promise<void> {
      const supabase = createClient();
      const { error } = await supabase
        .from('books')
        .update({
          current_page: updates.currentPage,
          completion_pct: updates.completionPct,
          status: updates.status,
          current_chapter: updates.currentChapter,
          completed_at: updates.completedAt ? new Date(updates.completedAt).toISOString() : null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    async delete(id: string): Promise<void> {
      const supabase = createClient();
      
      // Get book to check for attached file
      const { data: book } = await supabase.from('books').select('file_url').eq('id', id).single();
      if (book && book.file_url) {
        try {
          const pathMatch = book.file_url.match(/\/books\/(.+)$/);
          const path = pathMatch ? pathMatch[1] : null;
          if (path) {
            await supabase.storage.from('books').remove([path]);
          }
        } catch (e) {
          console.error('Failed to delete book file from storage', e);
        }
      }

      const { error } = await supabase.from('books').delete().eq('id', id);
      if (error) throw error;
    }
  },
  sessions: {
    async count(): Promise<number> {
      const supabase = createClient();
      const { count, error } = await supabase
        .from('reading_sessions')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
    async getAll(): Promise<ReadingSession[]> {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('reading_sessions')
        .select('*')
        .order('start_time', { ascending: false });
      if (error) throw error;
      // Map snake_case back to camelCase for the frontend
      return (data || []).map(d => ({
        id: d.id,
        user_id: d.user_id,
        bookId: d.book_id,
        startedAt: new Date(d.start_time).getTime(),
        endedAt: d.end_time ? new Date(d.end_time).getTime() : null,
        durationSeconds: d.duration_seconds,
        wordsRead: d.words_read,
        avgWpm: d.wpm,
        pagesRead: 0, // derived if needed
      }));
    },
    async add(session: Omit<ReadingSession, 'id' | 'user_id'>): Promise<void> {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { error } = await supabase.from('reading_sessions').insert({
        user_id: userData.user.id,
        book_id: session.bookId,
        start_time: new Date(session.startedAt).toISOString(),
        end_time: session.endedAt ? new Date(session.endedAt).toISOString() : new Date().toISOString(),
        duration_seconds: session.durationSeconds,
        words_read: session.wordsRead,
        wpm: session.avgWpm,
      });
      if (error) throw error;
    }
  },
  dailyLogs: {
    async getAll(): Promise<DailyLog[]> {
      const supabase = createClient();
      const { data, error } = await supabase.from('daily_logs').select('*');
      if (error) throw error;
      return (data || []).map(d => ({
        id: d.id,
        user_id: d.user_id,
        date: d.date_string,
        totalSeconds: d.total_seconds,
        totalWords: d.total_words,
        booksRead: 0,
        sessionsCount: 0,
      }));
    },
    async add(log: Omit<DailyLog, 'id' | 'user_id'>): Promise<void> {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { error } = await supabase.from('daily_logs').insert({
        user_id: userData.user.id,
        date_string: log.date,
        total_seconds: log.totalSeconds,
        total_words: log.totalWords,
      });
      if (error) throw error;
    },
    async update(id: string, updates: Partial<DailyLog>): Promise<void> {
      const supabase = createClient();
      const { error } = await supabase.from('daily_logs').update({
        total_seconds: updates.totalSeconds,
        total_words: updates.totalWords,
      }).eq('id', id);
      if (error) throw error;
    }
  },
  profiles: {
    async get(userId: string): Promise<Profile | null> {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;
      return {
        id: data.id,
        username: data.username,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
        bio: data.bio,
        favoriteBooks: data.favorite_books || [],
        updatedAt: new Date(data.updated_at).getTime(),
      };
    },
    async getByUsername(username: string): Promise<Profile | null> {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;
      return {
        id: data.id,
        username: data.username,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
        bio: data.bio,
        favoriteBooks: data.favorite_books || [],
        updatedAt: new Date(data.updated_at).getTime(),
      };
    },
    async searchProfiles(query: string): Promise<Profile[]> {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(20);
        
      if (error) throw error;
      return (data || []).map(d => ({
        id: d.id,
        username: d.username,
        displayName: d.display_name,
        avatarUrl: d.avatar_url,
        bio: d.bio,
        favoriteBooks: d.favorite_books || [],
        updatedAt: new Date(d.updated_at).getTime(),
      }));
    },
    async update(userId: string, updates: Partial<Profile>): Promise<void> {
      const supabase = createClient();
      
      const payload: any = {};
      if (updates.username !== undefined) payload.username = updates.username;
      if (updates.displayName !== undefined) payload.display_name = updates.displayName;
      if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
      if (updates.bio !== undefined) payload.bio = updates.bio;
      if (updates.favoriteBooks !== undefined) payload.favorite_books = updates.favoriteBooks;
      
      if (Object.keys(payload).length === 0) return;
      
      payload.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userId);
      if (error) throw error;
    },
    async uploadAvatar(userId: string, file: File): Promise<string> {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return data.publicUrl;
    }
  },
  social: {
    async followUser(followingId: string): Promise<void> {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('followers')
        .insert({
          follower_id: userData.user.id,
          following_id: followingId
        });
      if (error) throw error;
    },
    async unfollowUser(followingId: string): Promise<void> {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('followers')
        .delete()
        .match({
          follower_id: userData.user.id,
          following_id: followingId
        });
      if (error) throw error;
    },
    async getFollowers(userId: string): Promise<Profile[]> {
      const supabase = createClient();
      // Need to join followers with profiles
      const { data, error } = await supabase
        .from('followers')
        .select(`
          follower:profiles!followers_follower_id_fkey(*)
        `)
        .eq('following_id', userId);
      
      if (error) throw error;
      return (data || []).map((d: any) => ({
        id: d.follower.id,
        username: d.follower.username,
        displayName: d.follower.display_name,
        avatarUrl: d.follower.avatar_url,
        bio: d.follower.bio,
        favoriteBooks: d.follower.favorite_books || [],
        updatedAt: new Date(d.follower.updated_at).getTime(),
      }));
    },
    async getFollowing(userId: string): Promise<Profile[]> {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('followers')
        .select(`
          following:profiles!followers_following_id_fkey(*)
        `)
        .eq('follower_id', userId);
      
      if (error) throw error;
      return (data || []).map((d: any) => ({
        id: d.following.id,
        username: d.following.username,
        displayName: d.following.display_name,
        avatarUrl: d.following.avatar_url,
        bio: d.following.bio,
        favoriteBooks: d.following.favorite_books || [],
        updatedAt: new Date(d.following.updated_at).getTime(),
      }));
    },
    async isFollowing(followerId: string, followingId: string): Promise<boolean> {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('followers')
        .select('created_at')
        .match({ follower_id: followerId, following_id: followingId })
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    async getFeedEvents(userId: string): Promise<any[]> {
      const supabase = createClient();
      // 1. Get IDs of people the user is following
      const { data: following, error: followingError } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', userId);
        
      if (followingError) throw followingError;
      
      const followingIds = (following || []).map(f => f.following_id);
      
      if (followingIds.length === 0) return [];
      
      // 2. Fetch recent books from these users
      const { data: recentBooks, error: booksError } = await supabase
        .from('books')
        .select('*, profiles(username, display_name, avatar_url)')
        .in('user_id', followingIds)
        .order('addedAt', { ascending: false })
        .limit(20);
        
      if (booksError) throw booksError;
      
      // We can also fetch recent reading_sessions here if we want, but for now just books
      // Map to a common event format
      return (recentBooks || []).map(book => ({
        id: `book-${book.id}`,
        type: book.status === 'completed' ? 'completed_book' : 'started_book',
        timestamp: book.completedAt || book.addedAt,
        user: {
          username: book.profiles?.username,
          displayName: book.profiles?.display_name,
          avatarUrl: book.profiles?.avatar_url
        },
        book: {
          title: book.title,
          author: book.author,
          coverUrl: book.coverUrl,
          id: book.id
        }
      })).sort((a, b) => b.timestamp - a.timestamp);
    }
  }
};
