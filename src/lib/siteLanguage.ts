import { useLocation } from "react-router-dom";

// Both locales render the same React pages; only text is translated.
export function useSiteLanguage(): "fr" | "en" {
  const { pathname } = useLocation();
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "fr";
}

const EN: Record<string, string> = {
  "Accueil": "Home", "Tournois": "Tournaments", "Classement": "Rankings", "Actualités": "News",
  "Connexion": "Sign in", "Créer un compte": "Create account", "Mon compte": "My account",
  "Mon profil": "My profile", "Mes inscriptions": "My registrations", "Mes points": "My points",
  "Paramètres": "Settings", "Déconnexion": "Sign out", "Compte": "Account",
  "Joue. Affronte. Gagne.": "Play. Compete. Win.",
  "Compétition": "Competition", "Voir les tournois": "Browse tournaments",
  "Rejoindre Discord": "Join Discord", "Créer un compte eGame": "Create an eGame account",
  "Tous les tournois →": "All tournaments →", "Aucun tournoi annoncé pour le moment.": "No tournaments announced at the moment.",
  "Les résultats des événements passés restent consultables dans l’historique.": "Past event results remain available in the history.",
  "Simple et accessible": "Simple and accessible", "Comment ça marche": "How it works",
  "En savoir plus →": "Learn more →", "Crée ton compte": "Create your account",
  "Inscris-toi et complète ton profil joueur.": "Sign up and complete your player profile.",
  "Choisis un tournoi": "Choose a tournament", "Consulte les tournois ouverts et leurs conditions.": "Browse open tournaments and their conditions.",
  "Confirme ton inscription": "Confirm your registration", "Choisis un moyen de paiement disponible pour le tournoi.": "Choose an available payment method.",
  "Rejoins la compétition": "Join the competition", "Suis les informations du tournoi et joue à l’heure prévue.": "Follow tournament updates and play at the scheduled time.",
  "Jeux pris en charge": "Supported games", "Jeux de la communauté": "Community games",
  "Les tournois disponibles sont annoncés séparément selon leur calendrier.": "Tournament availability is announced separately.",
  "Tournoi actif": "Active tournament", "Communauté officielle": "Official community",
  "Suivre sur TikTok": "Follow on TikTok", "Devenir partenaire": "Become a partner",
  "À propos": "About", "Contact": "Contact", "Mentions légales": "Legal notice",
  "Confidentialité & conditions": "Privacy & terms", "Informations légales et conditions": "Legal information and terms",
  "Partenaires": "Partners", "Étape": "Step",
  "Les tournois sont annoncés séparément selon leur disponibilité.": "Tournaments are announced separately based on availability.",
  "Filtrer par jeu": "Filter by game", "Tous les jeux": "All games",
  "Aucun jeu correspondant.": "No matching games.", "Actif": "Active",
  "Voir les champions": "See champions",
  "Pas encore de classement réel pour ce jeu.": "No confirmed rankings for this game yet.",
  "Le classement apparaîtra dès que des résultats confirmés seront disponibles.": "Rankings will appear as soon as confirmed results are available.",
};
export function translate(text: string, language: "fr" | "en"): string {
  return language === "en" ? EN[text] ?? text : text;
}
