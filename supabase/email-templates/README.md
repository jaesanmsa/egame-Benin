# E-mails d'authentification eGame Bénin

Les fichiers `confirmation.html` et `recovery.html` sont les modèles officiels à coller dans **Supabase Dashboard > Authentication > Email Templates**, respectivement **Confirm signup** et **Reset password**.

**Important :** le dépôt GitHub/Vercel ne publie pas automatiquement ces modèles dans la configuration du service Supabase Auth hébergé. L'éditeur Supabase doit enregistrer ces modèles pour qu'ils soient utilisés dans les vrais courriels.

- Sujet confirmation : **Confirme ton adresse e-mail — eGame Bénin**
- Sujet récupération : **Réinitialise ton mot de passe — eGame Bénin**
- Contact affiché : **contact@egamebenin.com**
- Domaine affiché : **www.egamebenin.com**
- Ancien slogan à ne plus afficher : **la communauté gaming numéro un au Bénin**
- Conserver intégralement le placeholder Supabase : `{{ .ConfirmationURL }}`.

Vérifier dans **Authentication > URL Configuration** que `https://www.egamebenin.com/choisir-profil` (inscription) et `https://www.egamebenin.com/reset-password` (récupération) sont autorisées, puis tester les deux parcours.

Dans **Authentication > SMTP Settings**, vérifier que le courriel expéditeur utilise le domaine vérifié dans Resend (par exemple `contact@egamebenin.com`) si cette adresse est destinée à l'envoi. Le nom d'expéditeur recommandé est `eGame Bénin`. Changer le contenu d'un modèle ne change pas automatiquement l'adresse d'expéditeur SMTP.

Ne pas modifier l'adresse utilisée pour identifier le compte administrateur existant simplement parce que l'adresse de contact publique change.
