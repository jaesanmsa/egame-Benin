/**
 * Modèles d'e-mails personnalisés pour Supabase Auth
 * Design : Noir (#0A0A0A) et Violet (#8A2BE2)
 */

const brandColor = "#8A2BE2";
const bgColor = "#0A0A0A";

const wrapTemplate = (title: string, text: string, buttonText: string, url: string) => `
<div style="background-color: ${bgColor}; padding: 40px; font-family: Arial, sans-serif; color: #ffffff;">
  <div style="max-width: 600px; margin: auto; border: 1px solid ${brandColor}; border-radius: 20px; padding: 40px; text-align: center; background-color: #121212;">
    <h1 style="color: ${brandColor}; font-size: 28px; font-weight: 900; margin-bottom: 10px;">eGame Bénin</h1>
    <h2 style="font-size: 20px; margin-bottom: 20px;">${title}</h2>
    <p style="color: #cccccc; line-height: 1.6;">${text}</p>
    
    <a href="${url}" style="display: inline-block; background-color: ${brandColor}; color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 30px; box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3);">
      ${buttonText}
    </a>
    
    <p style="color: #555555; font-size: 11px; margin-top: 40px; text-transform: uppercase; letter-spacing: 1px;">
      L'arène des champions • eGame Bénin
    </p>
    <p style="color: #444444; font-size: 10px; margin-top: 10px;">
      Si tu n'as pas fait cette demande, tu peux ignorer cet e-mail en toute sécurité.
    </p>
  </div>
</div>
`;

export const signupEmail = wrapTemplate(
  "Prêt à dominer l'arène ?",
  "Salut ! Pour continuer ton aventure, valider ton compte et rejoindre tes tournois, clique sur le bouton ci-dessous :",
  "Vérifier mon compte",
  "{{ .ConfirmationURL }}"
);

export const forgotPasswordEmail = wrapTemplate(
  "Récupération de compte",
  "Pas de panique champion ! Clique sur le bouton ci-dessous pour choisir un nouveau mot de passe et retourner au combat :",
  "Réinitialiser mon mot de passe",
  "{{ .RecoveryURL }}"
);