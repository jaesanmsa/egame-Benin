/**
 * [_shared/discordSupport] Utilitaires Discord pour le système de support privé.
 * Utilisé par discord-support-setup et discord-support-interactions.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Bits de permissions Discord
export const VIEW_CHANNEL = 1024;
export const SEND_MESSAGES = 2048;
export const ATTACH_FILES = 32768;
export const EMBED_LINKS = 16384;
export const MANAGE_MESSAGES = 8192;
export const READ_MESSAGE_HISTORY = 65536;

export const SUPPORT_CATEGORY_NAME = "🎫 TICKETS SUPPORT";
export const SUPPORT_PANEL_CHANNEL = "contact-support";
export const SUPPORT_ROLE_NAME = Deno.env.get("DISCORD_SUPPORT_ROLE") || "Support eGame";
export const FOUNDER_ROLE_NAME = Deno.env.get("DISCORD_FOUNDER_ROLE") || "Fondateur eGame";

export const TICKET_CATEGORIES: Record<string, string> = {
  paiement: "Paiement / inscription",
  tournoi: "Tournoi",
  compte: "Compte eGame",
  discord: "Discord",
  points: "Points / récompenses",
  autre: "Autre",
};

export const discordApi = async (
  botToken: string,
  path: string,
  method: "POST" | "PATCH" | "DELETE" | "GET",
  body?: unknown,
): Promise<any> => {
  const res = await fetch(`https://discord.com/api/v10${path}`, {
    method,
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const details = await res.text().catch(() => "");
    throw new Error(`Discord API ${method} ${path} → ${res.status} ${details}`);
  }
  return res.status === 204 ? null : res.json();
};

export interface SupportContext {
  botToken: string;
  guildId: string;
  /** Catégorie « 🎫 TICKETS SUPPORT » (créée si absente). */
  categoryId: string;
  /** Rôle Support eGame (null si introuvable). */
  supportRoleId: string | null;
  /** Rôle Fondateur eGame (null si introuvable). */
  founderRoleId: string | null;
  /** ID applicatif du bot (pour l'autorisation du bot lui-même). */
  botUserId: string | null;
}

/** Charge (ou crée) les ressources support : catégorie + rôles. */
export async function loadSupportContext(): Promise<SupportContext> {
  const botToken = Deno.env.get("DISCORD_BOT_TOKEN");
  const guildId = Deno.env.get("DISCORD_GUILD_ID");
  if (!botToken || !guildId) throw new Error("MISSING_DISCORD_SECRETS");

  // Catégorie des tickets
  const channels = await discordApi(botToken, `/guilds/${guildId}/channels`, "GET");
  let category = channels.find((c: any) => c.type === 4 && c.name === SUPPORT_CATEGORY_NAME);
  if (!category) {
    category = await discordApi(botToken, `/guilds/${guildId}/channels`, "POST", {
      name: SUPPORT_CATEGORY_NAME,
      type: 4,
      permission_overwrites: [
        { id: guildId, type: 0, deny: String(VIEW_CHANNEL) }, // @everyone : catégorie masquée
      ],
    });
  }

  // Rôles équipe
  const roles = await discordApi(botToken, `/guilds/${guildId}/roles`, "GET");
  const supportRoleId = roles.find((r: any) => r.name === SUPPORT_ROLE_NAME)?.id ?? null;
  const founderRoleId = roles.find((r: any) => r.name === FOUNDER_ROLE_NAME)?.id ?? null;

  // Identité du bot (application info) pour s'autoriser dans les salons privés.
  const app = await fetch("https://discord.com/api/v10/oauth2/applications/@me", {
    headers: { Authorization: `Bot ${botToken}` },
  }).then((r) => (r.ok ? r.json() : null)).catch(() => null);

  return {
    botToken,
    guildId,
    categoryId: category.id,
    supportRoleId,
    founderRoleId,
    botUserId: app?.id ?? null,
  };
}

/** Client Supabase service role (secrets serveur uniquement). */
export function serviceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

/** Nom de salon sûr : minuscules, alphanumérique + tirets, 25 caractères max. */
export function safeChannelName(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 25) || "joueur";
}
