-- Création de la table des paiements
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  tournament_id text not null,
  tournament_name text not null,
  amount text not null,
  status text default 'En attente' check (status in ('En attente', 'Réussi', 'Échoué')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activer la sécurité (RLS)
alter table public.payments enable row level security;

-- Politique : Les utilisateurs ne voient que leurs propres paiements
create policy "Les utilisateurs voient leurs propres paiements"
on public.payments for select
using ( auth.uid() = user_id );

-- Politique : Les utilisateurs peuvent insérer leurs propres paiements
create policy "Les utilisateurs peuvent créer leurs paiements"
on public.payments for insert
with check ( auth.uid() = user_id );