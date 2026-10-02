import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * [discord-create-tournament-space]
 * Crée et configure automatiquement l'espace Discord privé d'un tournoi :
 *  - rôle « 🏆 Participant — {titre} » ;
 *  - catégorie privée « 🏆 {titre} » (invisible à @everyone) ;
 *  - 5 salons : annonces-tournoi (lecture seule), presence-check-in,
 *    matchs-et-adversaires, preuves-de-match (images/vidéos), aide-tournoi ;
 *  - enregistre tous les IDs Discord dans tournament_discord_config.
 *
 * Idempotent : si une configuration existe déjà pour ce tournament_id,
 * aucune ressource Discord n'est recréée.
 * Réservé à l'administrateur eGame Bénin (vérification du JWT appelant).
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "egamebenin@gmail.com";

// Bits de permissions Discord
const VIEW_CHANNEL = 1024; // 0x400
const SEND_MESSAGES = 2048; // 0x800
const EMBED_LINKS = 16384; // 0x4000
const ATTACH_FILES = 32768; // 0x8000

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const discordApi = async (
  botToken: string,
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
) => {
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ===== Authentification : uniquement l'administrateur eGame Bénin =====
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "UNAUTHORIZED" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await callerClient.auth.getUser();
    if (!user || (user.email || "").toLowerCase() !== ADMIN_EMAIL) {
      console.error("[discord-create-tournament-space] Accès refusé pour", user?.email ?? "anonyme");
      return json({ error: "FORBIDDEN" }, 403);
    }

    // ===== Payload =====
    const { tournament_id } = await req.json().catch(() => ({}));
    if (!tournament_id || typeof tournament_id !== "string") {
      return json({ error: "TOURNAMENT_ID_REQUIRED" }, 400);
    }

    // Client service role (jamais exposé au frontend : secret serveur).
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // ===== Idempotence : ne JAMAIS recréer un espace existant =====
    const { data: existing } = await admin
      .from("tournament_discord_config")
      .select("*")
      .eq("tournament_id", tournament_id)
      .maybeSingle();
    if (existing) {
      console.log("[discord-create-tournament-space] Espace déjà existant pour", tournament_id);
      return json({ ok: true, already_exists: true, config: existing });
    }

    // ===== Tournoi =====
    const { data: tournament } = await admin
      .from("tournaments")
      .select("id, title, is_test")
      .eq("id", tournament_id)
      .maybeSingle();
    if (!tournament) return json({ error: "TOURNAMENT_NOT_FOUND" }, 404);
    if (tournament.is_test) return json({ error: "TEST_TOURNAMENT_EXCLUDED" }, 400);

    const title = String(tournament.title || tournament_id).trim().slice(0, 80);
    console.log("[discord-create-tournament-space] Création de l'espace pour", tournament_id, "«", title, "»");

    // ===== Secrets Discord =====
    const botToken = Deno.env.get("DISCORD_BOT_TOKEN");
    const guildId = Deno.env.get("DISCORD_GUILD_ID");
    if (!botToken || !guildId) {
      console.error("[discord-create-tournament-space] Secrets Discord manquants");
      return json({ error: "MISSING_DISCORD_SECRETS" }, 500);
    }

    // ===== 1. Rôle Participant (violet eGame, mentionnable) =====
    const role = await discordApi(botToken, `/guilds/${guildId}/roles`, "POST", {
      name: `🏆 Participant — ${title}`,
      color: 0x8a2be2,
      mentionable: true,
      reason: `eGame Bénin — espace tournoi ${tournament_id}`,
    });
    console.log("[discord-create-tournament-space] Rôle créé", role.id);

    // ===== 2. Catégorie privée (invisible à @everyone) =====
    const category = await discordApi(botToken, `/guilds/${guildId}/channels`, "POST", {
      name: `🏆 ${title}`,
      type: 4,
      permission_overwrites: [
        { id: guildId, type: 0, deny: String(VIEW_CHANNEL) }, // @everyone : caché
        { id: role.id, type: 0, allow: String(VIEW_CHANNEL) }, // Participants : visible
      ],
    });
    console.log("[discord-create-tournament-space] Catégorie créée", category.id);

    // ===== 3. Salons =====
    const mkChannel = (name: string, allow: number, deny = 0) =>
      discordApi(botToken, `/guilds/${guildId}/channels`, "POST", {
        name,
        type: 0,
        parent_id: category.id,
        permission_overwrites: [
          { id: guildId, type: 0, deny: String(VIEW_CHANNEL) },
          { id: role.id, type: 0, allow: String(allow), deny: String(deny) },
        ],
      });

    // annonces-tournoi : lecture seule pour les participants.
    const announcements = await mkChannel("annonces-tournoi", VIEW_CHANNEL, SEND_MESSAGES);
    // Salons de discussion pour les participants.
    const checkin = await mkChannel("presence-check-in", VIEW_CHANNEL | SEND_MESSAGES);
    const matches = await mkChannel("matchs-et-adversaires", VIEW_CHANNEL | SEND_MESSAGES);
    // preuves-de-match : envoi d'images et vidéos autorisé.
    const proofs = await mkChannel(
      "preuves-de-match",
      VIEW_CHANNEL | SEND_MESSAGES | ATTACH_FILES | EMBED_LINKS,
    );
    const support = await mkChannel("aide-tournoi", VIEW_CHANNEL | SEND_MESSAGES);
    console.log("[discord-create-tournament-space] 5 salons créés");

    // ===== 4. Enregistrement automatique des IDs =====
    const inviteUrl = Deno.env.get("DISCORD_GUILD_INVITE_URL") ?? null;
    const config = {
      tournament_id,
      guild_id: guildId,
      participant_role_id: role.id,
      category_id: category.id,
      announcements_channel_id: announcements.id,
      checkin_channel_id: checkin.id,
      matches_channel_id: matches.id,
      proofs_channel_id: proofs.id,
      support_channel_id: support.id,
      invite_url: inviteUrl,
      is_active: true,
    };
    const { error: upsertError } = await admin
      .from("tournament_discord_config")
      .upsert(config, { onConflict: "tournament_id" });
    if (upsertError) throw new Error("Enregistrement config impossible : " + upsertError.message);

    console.log("[discord-create-tournament-space] Espace créé avec succès pour", tournament_id);
    return json({ ok: true, config });
  } catch (error) {
    console.error("[discord-create-tournament-space] Erreur :", error.message);
    return json({ error: "DISCORD_API_FAILED", details: error.message }, 500);
  }
});
