const FRENCH_TO_ENGLISH: Record<string, string> = {
  "/": "/en",
  "/jeux": "/en/games",
  "/classement": "/en/leaderboard",
  "/news": "/en/news",
  "/about": "/en/about",
  "/contact": "/en/contact",
  "/devenir-partenaire": "/en/partners",
};

const ENGLISH_TO_FRENCH: Record<string, string> = {
  "/en": "/",
  "/en/games": "/jeux",
  "/en/leaderboard": "/classement",
  "/en/news": "/news",
  "/en/about": "/about",
  "/en/contact": "/contact",
  "/en/partners": "/devenir-partenaire",
};

export function toEnglishPath(pathname: string): string {
  const normalized = pathname.replace(/\/$/, "") || "/";
  if (FRENCH_TO_ENGLISH[normalized]) return FRENCH_TO_ENGLISH[normalized];
  if (normalized.startsWith("/game/")) return `/en/game/${normalized.slice("/game/".length)}`;
  if (normalized.startsWith("/news/")) return `/en${normalized}`;
  if (normalized.startsWith("/tournament/")) return `/en${normalized}`;
  return "/en";
}

export function toFrenchPath(pathname: string): string {
  const normalized = pathname.replace(/\/$/, "") || "/en";
  if (ENGLISH_TO_FRENCH[normalized]) return ENGLISH_TO_FRENCH[normalized];
  if (normalized.startsWith("/en/game/")) return `/game/${normalized.slice("/en/game/".length)}`;
  if (normalized.startsWith("/en/news/")) return normalized.slice("/en".length);
  if (normalized.startsWith("/en/tournament/")) return `/tournament/${normalized.slice("/en/tournament/".length)}`;
  return "/";
}
