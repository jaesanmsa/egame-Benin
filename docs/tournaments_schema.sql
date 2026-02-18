-- Mise à jour de la table existante ou création
CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  game TEXT NOT NULL,
  image_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  entry_fee INTEGER DEFAULT 0,
  prize_pool TEXT,
  max_participants INTEGER DEFAULT 40,
  type TEXT DEFAULT 'Online',
  rules TEXT[],
  access_code TEXT -- LE CODE DU TOURNOI (ID Salle / MDP)
);

-- Ajout de la colonne validation_code à la table payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS validation_code TEXT;