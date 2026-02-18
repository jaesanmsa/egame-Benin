-- Table pour stocker les infos détaillées des joueurs
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  full_name TEXT,
  phone TEXT,
  city TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer la sécurité
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Insertion automatique" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);