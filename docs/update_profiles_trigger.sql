-- Mise à jour de la fonction de création de profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- On utilise INSERT ... ON CONFLICT pour ne pas créer de doublon si l'email existe déjà
  -- Et on n'écrase l'avatar que s'il est vide (pour garder l'avatar emoji s'il existe)
  INSERT INTO public.profiles (id, full_name, avatar_url, username)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    COALESCE(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    full_name = EXCLUDED.full_name,
    -- On ne met à jour l'avatar que si le profil actuel n'en a pas
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);
  RETURN new;
END;
$$;