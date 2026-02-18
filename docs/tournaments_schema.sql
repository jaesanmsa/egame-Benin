-- Création de la table des tournois
CREATE TABLE tournaments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  game TEXT NOT NULL,
  image_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  entry_fee INTEGER DEFAULT 0,
  prize_pool TEXT,
  max_participants INTEGER DEFAULT 40,
  type TEXT DEFAULT 'Online', -- 'Online' ou 'Presentiel'
  rules TEXT[] -- Liste des règles
);

-- Activer la lecture publique pour que tout le monde voit les tournois
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture publique des tournois" ON tournaments FOR SELECT USING (true);