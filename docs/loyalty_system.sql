-- Ajout des colonnes de fidélité aux profils
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mvp_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS champion_count INTEGER DEFAULT 0;

-- Ajout des colonnes pour le tirage au sort dans les tournois
ALTER TABLE public.tournaments
ADD COLUMN IF NOT EXISTS lucky_winner_name TEXT,
ADD COLUMN IF NOT EXISTS lucky_winner_avatar TEXT;

-- Suppression de la contrainte de ville par défaut si elle existe
ALTER TABLE public.profiles ALTER COLUMN city DROP DEFAULT;