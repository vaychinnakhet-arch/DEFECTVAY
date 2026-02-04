import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise use the provided credentials
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://jofovmqhoqjfgftaoeng.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZm92bXFob3FqZmdmdGFvZW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxODIzMzcsImV4cCI6MjA4NTc1ODMzN30.igcFqt3j7tb-1SPCVxjgqNvzbdAOxTqtAQsWV-E2fVM';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase Credentials');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);