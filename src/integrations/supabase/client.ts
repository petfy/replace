import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://riclirqvaxqlvbhfsowh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpY2xpcnF2YXhxbHZiaGZzb3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3ODI5NTIsImV4cCI6MjA1NDM1ODk1Mn0.P_BvOs4aqEI33sOI0OxofqtjiKVBn9sq_j0PF_23Kyo";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'replace_session',
      storage: {
        getItem: (key) => {
          try {
            const item = localStorage.getItem(key);
            return item;
          } catch (error) {
            console.error('Error accessing localStorage:', error);
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, value);
          } catch (error) {
            console.error('Error setting localStorage:', error);
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.error('Error removing from localStorage:', error);
          }
        },
      },
    }
  }
);