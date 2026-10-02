import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  VIEW_CHANNEL,
  SEND_MESSAGES,
  ATTACH_FILES,
  EMBED_LINKS,
  READ_MESSAGE_HISTORY,
  MANAGE_MESSAGES,
  TICKET_CATEGORIES,
  discordApi,
  loadSupportContext,
  serviceClient,
  safeChannelName,
} from "../_shared/discordSupport.ts";

/**
 * [discord-support-interactions] Endpoint Discord (Interactions Endpoint URL).
 * Reçoit les clics sur les boutons/menus du support privé et :
 *  - ouvre un ticket (salon privé ticket-{username}-{numero}) ;
 *  - garantit UN SEUL ticket ouvert par utilisateur Discord (index unique base) ;
 *  - gère « Parler à un humain », « Problème résolu », « Fermer le ticket » ;
 *  - archive ou supprime le salon après fermeture.
 * Sécurité : chaque requête est vérifiée via la signature Ed25519 Discord
 * (DISCORD_PUBLIC_KEY). Aucun secret n'est exposé : le bot agit côté serveur.
 */

const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

/** Vérifie la signature Ed25519 de Discord sur la requête brute. */
async function verifyDiscordSignature(
  publicKeyHex: string,
  signatureHex: string,
  timestamp: string,
  bodyText: string,
): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      hexToBytes(publicKeyHex) as unknown as ArrayBuffer,
      { name: "Ed25519" },
      false,
      ["verify"],
    );
    const message = new TextEncoder().encode(timestamp + bodyText);
    const sig = hexToBytes(signatureHex) as unknown as ArrayBuffer;
    return await crypto.subtle.verify("Ed25519", key, sig, message as unknown as ArrayBuffer);
  } catch (err) {
    console.error("[discord-support-interactions] Signature error:", (err as Error).message);
    return false;
  }
}

const reply = (data: unknown) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

const ephemeral = (content: string) => reply({ type: 4, data: { content, flags: 64 } });

serve(async (req) => {
  // Discord n'envoie pas de préflight CORS : traitement direct du POST signé.
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const signature = req.headers.get("X-Signature-Ed25519") || "";
  const timestamp = req.headers.get("X-Signature-Timestamp") || "";
  const bodyText = await req.text();

  const publicKey = Deno.env.get("DISCORD_PUBLIC_KEY");
  if (!publicKey) {
    console.error("[discord-support-interactions] DISCORD_PUBLIC_KEY manquant");
    return new Response("Configuration manquante", { status: 500 });
  }
  const valid = await verifyDiscordSignature(publicKey, signature, timestamp, bodyText);
  if (!valid) {
    console.error("[discord-support-interactions] Signature invalide");
    return new Response("Signature invalide", { status: 401 });
  }

  const interaction = JSON.parse(bodyText);

  // Handshake Discord
  if (interaction.type === 1) return reply({ type: 1 });
  if (interaction.type !== 3) return reply({ type: 4, data: { content: "unknown" } });

  const customId: string = interaction.data?.custom_id || "";
  const member = interaction.member;
  const discordUser = member?.user;
  const userId = discordUser?.id;
  const username = discordUser?.username || "joueur";
  const channelId: string = interaction.channel?.id || "";

  try {
    // ===== 1. Bouton « 🎫 Contacter le support » → sélection de catégorie =====
    if (customId === "support_open") {
      return reply({
        type: 4,
        data: {
          flags: 64,
          content: "🎫 **Quel est le sujet de ta demande ?** Choisis une catégorie :",
          components: [
            {
              type: 1,
              components: [
                {
                  type: 3,
                  custom_id: "support_category",
                  placeholder: "Choisis la catégorie de ta demande",
                  options: Object.entries(TICKET_CATEGORIES).map(([value, label]) => ({
                    value,
                    label,
                  })),
                },
              ],
            },
          ],
        },
      });
    }

    // ===== 2. Catégorie choisie → ouverture du ticket privé =====
    if (customId === "support_category") {
      const categoryKey = interaction.data?.values?.[0] || "autre";
      const categoryLabel = TICKET_CATEGORIES[categoryKey] || TICKET_CATEGORIES.autre;

      const admin = serviceClient();

      // Un seul ticket ouvert simultanément : la base le garantit (index unique),
      // on vérifie d'abord ici pour renvoyer un message clair.
      const { data: openTicket } = await admin
        .from("support_tickets")
        .select("discord_channel_id")
        .eq("discord_user_id", userId)
        .neq("status", "closed")
        .maybeSingle();
      if (openTicket?.discord_channel_id) {
        return ephemeral(
          `⚠️ Tu as déjà un ticket ouvert : <#${openTicket.discord_channel_id}>.\nUtilise ce salon ou ferme-le avant d'en ouvrir un autre.`,
        );
      }

      const ctx = await loadSupportContext();

      // Numéro du ticket
      const { count } = await admin
        .from("support_tickets")
        .select("id", { count: "exact", head: true });
      const numero = (count ?? 0) + 1;
      const channelName = `ticket-${safeChannelName(username)}-${numero}`;

      // Liaison facultative au compte eGame via discord_connections :
      // la future IA support identifiera ainsi le joueur (paiements, tickets...).
      let linkedUserId: string | null = null;
      const { data: conn } = await admin
        .from("discord_connections")
        .select("user_id")
        .eq("discord_user_id", userId)
        .maybeSingle();
      linkedUserId = conn?.user_id ?? null;

      // Salon privé : utilisateur + bot + Support eGame + Fondateur eGame.
      const overwrites: any[] = [
        { id: ctx.guildId, type: 0, deny: String(VIEW_CHANNEL) },
        { id: userId, type: 1, allow: String(VIEW_CHANNEL | SEND_MESSAGES | ATTACH_FILES | EMBED_LINKS | READ_MESSAGE_HISTORY) },
      ];
      if (ctx.botUserId) {
        overwrites.push({
          id: ctx.botUserId,
          type: 1,
          allow: String(VIEW_CHANNEL | SEND_MESSAGES | MANAGE_MESSAGES),
        });
      }
      if (ctx.supportRoleId) {
        overwrites.push({ id: ctx.supportRoleId, type: 0, allow: String(VIEW_CHANNEL | SEND_MESSAGES | MANAGE_MESSAGES) });
      }
      if (ctx.founderRoleId) {
        overwrites.push({ id: ctx.founderRoleId, type: 0, allow: String(VIEW_CHANNEL | SEND_MESSAGES | MANAGE_MESSAGES) });
      }

      const channel = await discordApi(ctx.botToken, `/guilds/${ctx.guildId}/channels`, "POST", {
        name: channelName,
        type: 0,
        parent_id: ctx.categoryId,
        topic: `Support eGame Bénin — ${categoryLabel} — ouvert par ${username}`,
        permission_overwrites: overwrites,
      });

      // Message d'accueil avec les 3 boutons
      await discordApi(ctx.botToken, `/channels/${channel.id}/messages`, "POST", {
        content:
          `Bonjour **${username}** 👋🏽\n\n` +
          `Bienvenue au support eGame Bénin. Explique ton problème avec le plus de détails possible. ` +
          `L'assistant eGame va d'abord essayer de t'aider. Si nécessaire, un membre de l'équipe prendra le relais.\n\n` +
          `**Catégorie :** ${categoryLabel}${linkedUserId ? "" : "\n_(Compte eGame non lié : lie ton Discord depuis ton profil eGame pour une aide plus rapide.)_"}`,
        components: [
          {
            type: 1,
            components: [
              { type: 2, style: 2, label: "👤 Parler à un humain", custom_id: "support_human" },
              { type: 2, style: 3, label: "✅ Problème résolu", custom_id: "support_resolved" },
              { type: 2, style: 4, label: "🔒 Fermer le ticket", custom_id: "support_close" },
            ],
          },
        ],
      });

      // Enregistrement base (l'index unique protège des doubles-clics simultanés)
      const { error: insertError } = await admin.from("support_tickets").insert({
        user_id: linkedUserId,
        discord_user_id: userId,
        discord_channel_id: channel.id,
        category: categoryKey,
        status: "open",
        ai_enabled: true,
        escalated: false,
      });
      if (insertError) {
        // Double ouverture simultanée : on supprime le salon surnuméraire.
        if (insertError.code === "23505") {
          await discordApi(ctx.botToken, `/channels/${channel.id}`, "DELETE").catch(() => null);
          return ephemeral("⚠️ Tu as déjà un ticket ouvert. Regarde tes salons privés.");
        }
        throw insertError;
      }

      console.log("[discord-support-interactions] Ticket", channelName, "ouvert par", username);
      return ephemeral(
        `✅ Ton ticket privé a été créé : <#${channel.id}>\nCatégorie : **${categoryLabel}** — retrouve-le dans la catégorie ${"🎫"} TICKETS SUPPORT.`,
      );
    }

    // ===== 3. Boutons dans le salon du ticket =====
    const admin = serviceClient();

    const ticketChannel = async () => {
      const { data } = await admin
        .from("support_tickets")
        .select("*")
        .eq("discord_channel_id", channelId)
        .maybeSingle();
      return data;
    };

    if (customId === "support_human") {
      const ticket = await ticketChannel();
      if (!ticket) return ephemeral("⚠️ Ticket introuvable pour ce salon.");
      await admin
        .from("support_tickets")
        .update({ ai_enabled: false, escalated: true, status: "human_support", updated_at: new Date().toISOString() })
        .eq("id", ticket.id);
      const ctx = await loadSupportContext();
      const supportMention = ctx.supportRoleId ? `<@&${ctx.supportRoleId}>` : "**équipe support**";
      return reply({
        type: 4,
        data: {
          content:
            `👥 <@${userId}> a demandé à parler à un humain.\n` +
            `${supportMention} un membre de l'équipe va prendre le relais 🙏`,
        },
      });
    }

    if (customId === "support_resolved" || customId === "support_close") {
      const ticket = await ticketChannel();
      if (!ticket) return ephemeral("⚠️ Ticket introuvable pour ce salon.");
      const resolved = customId === "support_resolved";
      await admin
        .from("support_tickets")
        .update({
          status: "closed",
          closed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          resolution_summary: resolved ? "Résolu par l'utilisateur" : "Fermé par l'utilisateur",
        })
        .eq("id", ticket.id);

      const closeButtons = {
        type: 1,
        components: [
          { type: 2, style: 2, label: "📦 Archiver le salon", custom_id: "support_archive" },
          { type: 2, style: 4, label: "🗑️ Supprimer le salon", custom_id: "support_delete" },
        ],
      };
      return reply({
        type: 4,
        data: {
          content: resolved
            ? `✅ Ticket marqué **résolu** par <@${userId}>. Merci !\nTu peux maintenant archiver ou supprimer ce salon.`
            : `🔒 Ticket **fermé** par <@${userId}>.\nTu peux maintenant archiver ou supprimer ce salon.`,
          components: [closeButtons],
        },
      });
    }

    if (customId === "support_archive") {
      const ticket = await ticketChannel();
      if (!ticket || ticket.status !== "closed") {
        return ephemeral("⚠️ Ferme d'abord le ticket avant de l'archiver.");
      }
      const ctx = await loadSupportContext();
      // Archivage : le salon est renommé et réservé à l'équipe (l'utilisateur n'y a plus accès).
      const current = await discordApi(ctx.botToken, `/channels/${channelId}`, "GET");
      await discordApi(ctx.botToken, `/channels/${channelId}`, "PATCH", {
        name: `archivé-${String(current.name).replace(/^archivé-/, "")}`.slice(0, 100),
      });
      if (ticket.discord_user_id) {
        await discordApi(
          ctx.botToken,
          `/channels/${channelId}/permissions/${ticket.discord_user_id}`,
          "DELETE",
        ).catch(() => null);
      }
      return reply({ type: 4, data: { content: "📦 Salon archivé : accès réservé à l'équipe eGame." } });
    }

    if (customId === "support_delete") {
      const ticket = await ticketChannel();
      if (!ticket || ticket.status !== "closed") {
        return ephemeral("⚠️ Ferme d'abord le ticket avant de supprimer le salon.");
      }
      const ctx = await loadSupportContext();
      await discordApi(ctx.botToken, `/channels/${channelId}/messages`, "POST", {
        content: "🗑️ Suppression du salon dans quelques secondes… (l'historique reste enregistré côté eGame)",
      }).catch(() => null);
      await new Promise((r) => setTimeout(r, 1200));
      await discordApi(ctx.botToken, `/channels/${channelId}`, "DELETE").catch(() => null);
      console.log("[discord-support-interactions] Salon supprimé pour le ticket", ticket.id);
      return ephemeral("🗑️ Ticket supprimé. Merci d'avoir contacté le support eGame Bénin !");
    }

    return ephemeral("Action inconnue.");
  } catch (error) {
    console.error("[discord-support-interactions] Erreur :", error.message);
    return ephemeral("⚠️ Une erreur est survenue. Réessaie ou contacte un membre de l'équipe.");
  }
});
