-- 1. Table des profils utilisateurs
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  avatar_url text,
  balance decimal default 0.00,
  rank text default 'Bronze I',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Table des tournois
create table tournaments (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  game text not null,
  image_url text,
  date timestamp with time zone,
  entry_fee decimal not null,
  prize_pool text,
  participants_count int default 0,
  max_participants int,
  type text check (type in ('Online', 'Presentiel')),
  description text,
  rules text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Table des inscriptions
create table registrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  tournament_id uuid references tournaments on delete cascade,
  payment_status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, tournament_id)
);

-- Activer la sécurité (RLS)
alter table profiles enable row level security;
alter table tournaments enable row level security;
alter table registrations enable row level security;

-- Politiques de sécurité
create policy "Profiles publics visibles par tous" on profiles for select using (true);
create policy "Utilisateurs modifient leur propre profil" on profiles for update using (auth.uid() = id);
create policy "Tournois visibles par tous" on tournaments for select using (true);
create policy "Inscriptions visibles par l'utilisateur" on registrations for select using (auth.uid() = user_id);