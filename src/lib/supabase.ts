import { createClient } from '@supabase/supabase-js';

// On récupère les variables d'environnement ou on utilise les valeurs fournies
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ajbpdaxtynkazdrzyopd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_EbplBq_stwsxH_3NBDpLSA_LzNDLLKR';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);