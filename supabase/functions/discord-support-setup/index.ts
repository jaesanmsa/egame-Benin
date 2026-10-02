import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  SUPPORT_CATEGORY_NAME,
  SUPPORT_PANEL_CHANNEL,
  VIEW_CHANNEL,
  SEND_MESSAGES,
  discordApi,
  loadSupportContext,
} from "../_shared/discordSupport.ts";

/**
 * [discord-support-setup] Configuration initiale du support Discord (admin only) :
 *  - catégorie privée « 🎫 TICKETS SUPPORT » ;
 *  - salon public contact-support en lecture seule ;
 *  - panneau d'accueil avec le bouton « 🎫 Contacter le support ».
 * Idempotent : réutilise le salon/la catégorie existants et ne reposte pas le
 * panneau s'il est déjà présent.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "egamebenin@gmail.com";

const PANEL_TEXT =
  "🎫 **Support eGame Bénin**\n\n" +
  "Besoin d'aide concernant ton compte, un paiement, une inscription, un tournoi ou Discord ? " +
  "Clique sur le bouton ci-dessous.";

const PANEL_COMPONENTS = [
  {
    type: 1,
    components: [
      { type: 2, style: 1, label: "🎫 Contacter le support", custom_id: "support_open" },
    ],
  },
];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ===== Admin uniquement =====
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "UNAUTHORIZED" }, 401);
    const caller = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await caller.auth.getUser();
    if (!user || (user.email || "").toLowerCase() !== ADMIN_EMAIL) {
      console.error("[discord-support-setup] Accès refusé pour", user?.email ?? "anonyme");
      return json({ error: "FORBIDDEN" }, 403);
    }

    const ctx = await loadSupportContext();

    // ===== Salon public contact-support (lecture seule) =====
    const channels = await discordApi(ctx.botToken, `/guilds/${ctx.guildId}/channels`, "GET");
    let panelChannel = channels.find(
      (c: any) => c.type === 0 && c.name === SUPPORT_PANEL_CHANNEL,
    );
    let panelPosted = false;
    if (!panelChannel) {
      panelChannel = await discordApi(ctx.botToken, `/guilds/${ctx.guildId}/channels`, "POST", {
        name: SUPPORT_PANEL_CHANNEL,
        type: 0,
        permission_overwrites: [
          { id: ctx.guildId, type: 0, allow: String(VIEW_CHANNEL), deny: String(SEND_MESSAGES) },
        ],
      });
      console.log("[discord-support-setup] Salon contact-support créé", panelChannel.id);
    } else {
      // Idempotence : un panneau est-il déjà épinglé par le bot ?
      const messages = await discordApi(
        ctx.botToken,
        `/channels/${panelChannel.id}/messages?limit=50`,
        "GET",
      );
      panelPosted = messages.some(
        (m: any) => m.author?.bot && String(m.content).includes("Support eGame Bénin"),
      );
    }

    if (!panelPosted) {
      await discordApi(ctx.botToken, `/channels/${panelChannel.id}/messages`, "POST", {
        content: PANEL_TEXT,
        components: PANEL_COMPONENTS,
      });
      console.log("[discord-support-setup] Panneau publié dans", panelChannel.id);
    }

    return json({
      ok: true,
      category: { id: ctx.categoryId, name: SUPPORT_CATEGORY_NAME },
      panel_channel: { id: panelChannel.id, name: SUPPORT_PANEL_CHANNEL, already_posted: panelPosted },
      support_role_id: ctx.supportRoleId,
      founder_role_id: ctx.founderRoleId,
    });
  } catch (error) {
    console.error("[discord-support-setup] Erreur :", error.message);
    return json({ error: "SETUP_FAILED", details: error.message }, 500);
  }
});
