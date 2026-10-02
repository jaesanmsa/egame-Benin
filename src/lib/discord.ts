/**
 * Serveurs Discord officiels eGame Bénin — un serveur par jeu.
 * (WhatsApp a été abandonné : toute la communauté vit désormais sur Discord.)
 */
export interface DiscordServer {
  game: string;
  slug: string;
  url: string;
}

export const DISCORD_SERVERS: DiscordServer[] = [
  { game: 'Blood Strike', slug: 'blood-strike', url: 'https://discord.gg/qgjnG2mUxx' },
  { game: 'Brawl Stars', slug: 'brawl-stars', url: 'https://discord.gg/x3f763g8GX' },
  { game: 'COD Mobile', slug: 'cod-mobile', url: 'https://discord.gg/WktzAkcnK' },
  { game: 'Clash of Clans', slug: 'clash-of-clans', url: 'https://discord.gg/f2AG4HTeH3' },
  { game: 'Clash Royale', slug: 'clash-royale', url: 'https://discord.gg/4CMwKX3qGn' },
  { game: 'eFootball Mobile', slug: 'efootball-mobile', url: 'https://discord.gg/qWJxpdN2Rf' },
  { game: 'Free Fire', slug: 'free-fire', url: 'https://discord.gg/tMcg2kwSKe' },
  { game: 'Mobile Legends', slug: 'mobile-legends', url: 'https://discord.gg/JnQ7DWkzxf' },
  { game: 'PUBG Mobile', slug: 'pubg-mobile', url: 'https://discord.gg/Zyq3F7PgF7' },
];

/** Retrouve le serveur Discord d'un jeu via son slug de page (ex : "free-fire"). */
export const getDiscordBySlug = (slug?: string | null): DiscordServer | undefined =>
  DISCORD_SERVERS.find((s) => s.slug === slug);

/** Retrouve le serveur Discord d'un jeu via son nom affiché (ex : "Free Fire"). */
export const getDiscordByGame = (game?: string | null): DiscordServer | undefined => {
  if (!game) return undefined;
  const needle = game.toLowerCase().trim();
  return DISCORD_SERVERS.find((s) => needle.includes(s.game.toLowerCase()));
};
