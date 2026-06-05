/**
 * MODÈLES D'E-MAILS POUR SUPABASE (COPIER-COLLER)
 * 
 * 1. Allez dans Supabase > Authentication > Email Templates
 * 2. Choisissez le template (Confirm Signup ou Reset Password)
 * 3. Effacez tout et collez le code HTML correspondant ci-dessous.
 */

// --- CODE POUR "CONFIRM SIGNUP" ---
/*
<div style="background-color: #0A0A0A; padding: 40px; font-family: Arial, sans-serif; color: #ffffff;">
  <div style="max-width: 600px; margin: auto; border: 1px solid #8A2BE2; border-radius: 20px; padding: 40px; text-align: center; background-color: #121212;">
    <h1 style="color: #8A2BE2; font-size: 28px; font-weight: 900; margin-bottom: 10px;">eGame Bénin</h1>
    <h2 style="font-size: 20px; margin-bottom: 20px;">Prêt à dominer l'arène ?</h2>
    <p style="color: #cccccc; line-height: 1.6;">Salut ! Pour continuer ton aventure, valider ton compte et rejoindre tes tournois, clique sur le bouton ci-dessous :</p>
    
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #8A2BE2; color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 30px; box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3);">
      Vérifier mon compte
    </a>
    
    <p style="color: #555555; font-size: 11px; margin-top: 40px; text-transform: uppercase; letter-spacing: 1px;">
      L'arène des champions • eGame Bénin
    </p>
    <p style="color: #444444; font-size: 10px; margin-top: 10px;">
      Si tu n'as pas fait cette demande, tu peux ignorer cet e-mail en toute sécurité.
    </p>
  </div>
</div>
*/

// --- CODE POUR "RESET PASSWORD" ---
/*
<div style="background-color: #0A0A0A; padding: 40px; font-family: Arial, sans-serif; color: #ffffff;">
  <div style="max-width: 600px; margin: auto; border: 1px solid #8A2BE2; border-radius: 20px; padding: 40px; text-align: center; background-color: #121212;">
    <h1 style="color: #8A2BE2; font-size: 28px; font-weight: 900; margin-bottom: 10px;">eGame Bénin</h1>
    <h2 style="font-size: 20px; margin-bottom: 20px;">Récupération de compte</h2>
    <p style="color: #cccccc; line-height: 1.6;">Pas de panique champion ! Clique sur le bouton ci-dessous pour choisir un nouveau mot de passe et retourner au combat :</p>
    
    <a href="{{ .RecoveryURL }}" style="display: inline-block; background-color: #8A2BE2; color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 30px; box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3);">
      Réinitialiser mon mot de passe
    </a>
    
    <p style="color: #555555; font-size: 11px; margin-top: 40px; text-transform: uppercase; letter-spacing: 1px;">
      L'arène des champions • eGame Bénin
    </p>
    <p style="color: #444444; font-size: 10px; margin-top: 10px;">
      Si tu n'as pas fait cette demande, tu peux ignorer cet e-mail en toute sécurité.
    </p>
  </div>
</div>
*/