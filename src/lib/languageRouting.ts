// Les pages non traduites conservent leur route française : pas de redirection silencieuse à l'accueil.
const FRENCH_TO_ENGLISH: Record<string, string> = {
  "/": "/en",
  "/auth": "/en/auth",
  "/choisir-profil": "/en/choisir-profil",
  "/mes-equipes": "/en/mes-equipes",
  "/admin/team-tournaments": "/en/admin/team-tournaments",
  "/forgot-password": "/en/forgot-password",
  "/reset-password": "/en/reset-password",
  "/admin": "/en/admin",
  "/profil": "/en/profil",
  "/edit-profile": "/en/edit-profile",
  "/avatar-maker": "/en/avatar-maker",
  "/payments": "/en/payments",
  "/payment-success": "/en/payment-success",
  "/payment/moneroo/callback": "/en/payment/moneroo/callback",
  "/privacy": "/en/privacy",
  "/mentions-legales": "/en/mentions-legales",
  "/jeux": "/en/games",
  "/classement": "/en/leaderboard",
  "/news": "/en/news",
  "/about": "/en/about",
  "/contact": "/en/contact",
  "/devenir-partenaire": "/en/partners",
  "/devenir-organisateur": "/en/organizer-application",
  "/organizer": "/en/organizer",
  "/admin/organizers": "/en/admin/organizers",
};
const ENGLISH_TO_FRENCH: Record<string, string> = Object.fromEntries(
  Object.entries(FRENCH_TO_ENGLISH).map(([fr, en]) => [en, fr]),
);

export function toEnglishPath(pathname: string): string {
  const normalized = pathname.replace(/\/$/, "") || "/";
  if (normalized.startsWith("/en/") || normalized === "/en") return normalized;
  if (FRENCH_TO_ENGLISH[normalized]) return FRENCH_TO_ENGLISH[normalized];
  if (normalized.startsWith("/game/")) return `/en/game/${normalized.slice("/game/".length)}`;
  if (normalized.startsWith("/news/")) return `/en${normalized}`;
  if (normalized.startsWith("/tournament/")) return `/en${normalized}`;
  // Les parcours privés (profil, paiement, récupération...) n'ont pas encore de vraie page EN.
  // Ne jamais perdre la page courante en basculant la langue.
  return normalized;
}
export function toFrenchPath(pathname: string): string {
  const normalized = pathname.replace(/\/$/, "") || "/en";
  if (ENGLISH_TO_FRENCH[normalized]) return ENGLISH_TO_FRENCH[normalized];
  if (normalized.startsWith("/en/game/")) return `/game/${normalized.slice("/en/game/".length)}`;
  if (normalized.startsWith("/en/news/")) return normalized.slice("/en".length);
  if (normalized.startsWith("/en/tournament/")) return `/tournament/${normalized.slice("/en/tournament/".length)}`;
  return normalized.startsWith("/en/") ? normalized.slice(3) : normalized;
}
