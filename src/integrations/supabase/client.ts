import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ajbpdaxtynkazdrzyopd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqYnBkYXh0eW5rYXpkcnp5b3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NTkyODAsImV4cCI6MjA4NjMzNTI4MH0.Z_sX2Old3Z4GhS0xJFuobEZG4ZjFUJmzKC8W6bG1pJk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);