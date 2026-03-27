-- Autoriser tout le monde à voir les profils (pseudo et avatar uniquement)
-- Cela permet d'afficher la liste des participants
DROP POLICY IF EXISTS "profiles_public_read_policy" ON public.profiles;
CREATE POLICY "profiles_public_read_policy" ON public.profiles
FOR SELECT USING (true);

-- Autoriser les utilisateurs connectés à voir TOUS les paiements réussis
-- (Indispensable pour compter les participants et afficher la liste)
DROP POLICY IF EXISTS "Users can see all successful payments" ON public.payments;
CREATE POLICY "Users can see all successful payments" ON public.payments
FOR SELECT TO authenticated USING (status = 'Réussi' OR auth.uid() = user_id);