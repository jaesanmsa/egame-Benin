/**
 * Modèles d'e-mails transactionnels pour eGame Bénin
 * Optimisés pour Gmail, Outlook et Mobile (Table-based layout)
 */

const BRAND_COLOR = "#8b5cf6";
const LOGO_URL = "https://ajbpdaxtynkazdrzyopd.supabase.co/storage/v1/object/public/assets/logo-email.png";

const baseTemplate = (content: string, buttonText: string, buttonUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>eGame Bénin</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 0; background-color: #1a1a1a;">
              <img src="${LOGO_URL}" alt="eGame Bénin" width="80" style="display: block;">
              <h1 style="color: #ffffff; margin-top: 20px; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">eGame <span style="color: ${BRAND_COLOR};">Bénin</span></h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px; text-align: center;">
              <p style="font-size: 18px; line-height: 1.6; color: #333333; margin-bottom: 30px;">
                ${content}
              </p>
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${buttonUrl}" style="background-color: ${BRAND_COLOR}; color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9f9f9; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="font-size: 12px; color: #999999; margin: 0;">
                © 2026 eGame Bénin. Tous droits réservés.<br>
                L'arène des champions du Bénin.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const signupEmail = baseTemplate(
  "Bienvenue dans l'arène ! Merci de confirmer ton compte pour commencer à encaisser tes victoires.",
  "Vérifier mon compte",
  "{{ .ConfirmationURL }}"
);

export const forgotPasswordEmail = baseTemplate(
  "Tu as perdu l'accès à ton arène ? Réinitialise ton mot de passe ici.",
  "Réinitialiser",
  "{{ .ResetURL }}"
);