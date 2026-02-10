import { createClient } from '@supabase/supabase-js';

// On récupère les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Si les clés sont manquantes, on utilise des placeholders pour éviter que l'app ne plante au démarrage
// L'utilisateur devra configurer ses variables d'environnement pour que l'auth fonctionne
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Attention : Les clés Supabase (VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY) ne sont pas configurées. " +
    "L'authentification et la base de données ne fonctionneront pas."
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);