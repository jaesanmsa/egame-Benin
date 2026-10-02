import { supabase } from "@/lib/supabase";

/**
 * Liaison Discord secondaire et facultative (jamais obligatoire à l'inscription).
 * Le backend (tables + Edge Functions) gère l'OAuth et la synchronisation ;
 * ce module ne fait que lire/écrire la ligne du joueur dans discord_connections.
 */
export interface DiscordConnection {
  user_id: string;
  discord_user_id: string;
  discord_username: string | null;
  discord_global_name: string | null;
  discord_avatar: string | null;
  connected_at: string;
  updated_at: string;
}

/** URL de l'avatar Discord (CDN officiel), avec fallback null si absent. */
export function discordAvatarUrl(conn: DiscordConnection | null | undefined): string | null {
  if (!conn?.discord_user_id || !conn?.discord_avatar) return null;
  return `https://cdn.discordapp.com/avatars/${conn.discord_user_id}/${conn.discord_avatar}.png?size=128`;
}

/** Nom affiché : global name en priorité, sinon username, sinon « Joueur Discord ». */
export function discordDisplayName(conn: DiscordConnection | null | undefined): string {
  if (!conn) return "Joueur Discord";
  return conn.discord_global_name || conn.discord_username || "Joueur Discord";
}

/** Charge la liaison Discord de l'utilisateur connecté (null si non lié). */
export async function fetchDiscordConnection(): Promise<DiscordConnection | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("discord_connections")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  return (data as DiscordConnection) ?? null;
}

/**
 * Démarre la liaison OAuth : l'Edge Function discord-oauth-start crée un état
 * sécurisé et renvoie l'URL d'autorisation Discord vers laquelle rediriger.
 */
export async function startDiscordConnect(redirectTo: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("discord-oauth-start", {
    body: { redirect_to: redirectTo },
  });
  if (error) throw new Error(error.message);
  const url = (data as any)?.authorization_url;
  if (!url) throw new Error("URL d'autorisation Discord introuvable.");
  return url as string;
}

/** Délie Discord : supprime UNIQUEMENT la ligne du joueur connecté. */
export async function disconnectDiscord(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from("discord_connections")
    .delete()
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
}

/** Résultat de l'activation de l'accès Discord d'un tournoi. */
export interface DiscordSyncResult {
  ok: boolean;
  errorCode?: string;
  inviteUrl?: string;
}

/**
 * Active l'accès au rôle/au salon privé du tournoi via l'Edge Function
 * discord-sync-registration. Les codes d'erreur attendus :
 * DISCORD_NOT_CONNECTED, NO_VALID_TICKET, NOT_IN_GUILD, ROLE_ASSIGN_FAILED.
 */
export async function syncDiscordRegistration(tournamentId: string): Promise<DiscordSyncResult> {
  const { data, error } = await supabase.functions.invoke("discord-sync-registration", {
    body: { tournament_id: tournamentId },
  });
  if (error) {
    const message = error.message || "";
    for (const code of ["DISCORD_NOT_CONNECTED", "NO_VALID_TICKET", "NOT_IN_GUILD", "ROLE_ASSIGN_FAILED"]) {
      if (message.includes(code)) return { ok: false, errorCode: code };
    }
    throw new Error(message);
  }
  const payload = data as any;
  if (payload?.error) {
    const code = String(payload.error);
    const invite = payload.invite_url || payload.invite || null;
    if (["DISCORD_NOT_CONNECTED", "NO_VALID_TICKET", "NOT_IN_GUILD", "ROLE_ASSIGN_FAILED"].includes(code)) {
      return { ok: false, errorCode: code, inviteUrl: invite };
    }
    throw new Error(code);
  }
  return { ok: true };
}
