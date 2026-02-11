-- On s'assure que la table est créée dans le bon schéma
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tournament_id text NOT NULL,
  tournament_name text NOT NULL,
  amount text NOT NULL,
  status text DEFAULT 'En attente',
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Activer la sécurité
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent pour éviter les erreurs
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;

-- Créer les politiques de sécurité
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Donner les droits d'accès
GRANT ALL ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;