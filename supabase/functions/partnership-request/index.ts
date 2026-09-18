import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CONTACT_EMAIL = "contact@egamebenin.com";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const clean = (value: unknown, max: number): string | null => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed.slice(0, max);
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

interface PartnershipPayload {
  full_name: string;
  organization: string;
  email: string;
  whatsapp: string;
  partnership_type: string;
  game: string | null;
  link: string | null;
  community_size: string | null;
  contribution: string;
  expectations: string;
  budget: string | null;
  message: string;
  website?: string; // honeypot anti-spam
}

const buildEmailHtml = (row: Record<string, string | null>): string => {
  const fields: Array<[string, string | null]> = [
    ["Nom / prénom", row.full_name],
    ["Organisation / clan / communauté", row.organization],
    ["E-mail", row.email],
    ["WhatsApp", row.whatsapp],
    ["Type de partenariat", row.partnership_type],
    ["Jeu concerné", row.game],
    ["Lien (site / réseau / groupe)", row.link],
    ["Taille de la communauté", row.community_size],
    ["Apport envisagé", row.contribution],
    ["Attendu de la collaboration", row.expectations],
    ["Budget envisagé", row.budget],
    ["Message / proposition", row.message],
  ];
  const rows = fields
    .filter(([, value]) => value)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 14px;background:#0F0F1E;color:#A855F7;font-weight:700;font-size:13px;vertical-align:top;white-space:nowrap;">${escapeHtml(label!)}</td>
          <td style="padding:10px 14px;color:#1A1A2E;font-size:13px;vertical-align:top;">${escapeHtml(value!).replace(/\n/g, "<br>")}</td>
        </tr>`
    )
    .join("");
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;">
      <div style="background:#8A2BE2;color:#fff;padding:20px 24px;border-radius:16px 16px 0 0;">
        <h1 style="margin:0;font-size:18px;">Nouvelle proposition de partenariat</h1>
        <p style="margin:6px 0 0;font-size:13px;opacity:.9;">eGame Bénin — formulaire /devenir-partenaire</p>
      </div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #E5E5F0;border-top:none;border-radius:0 0 16px 16px;">${rows}</table>
    </div>`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Méthode non autorisée." }, 405);
  }

  let payload: PartnershipPayload;
  try {
    payload = await req.json();
  } catch {
    console.error("[partnership-request] corps JSON invalide");
    return json({ error: "Requête invalide." }, 400);
  }

  // Anti-spam : champ piège invisible — doit rester vide.
  if ((payload.website ?? "").trim() !== "") {
    console.warn("[partnership-request] honeypot rempli, requête ignorée");
    return json({ success: true });
  }

  const required: Array<[keyof PartnershipPayload, string]> = [
    ["full_name", "Nom / prénom"],
    ["organization", "Organisation"],
    ["email", "E-mail"],
    ["whatsapp", "Numéro WhatsApp"],
    ["partnership_type", "Type de partenariat"],
    ["contribution", "Apport envisagé"],
    ["expectations", "Attendu de la collaboration"],
    ["message", "Message"],
  ];
  for (const [field, label] of required) {
    const value = clean(payload[field], 5000);
    if (!value || value.length < 2) {
      return json({ error: `Le champ « ${label} » est obligatoire.` }, 400);
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return json({ error: "Adresse e-mail invalide." }, 400);
  }

  const row = {
    full_name: clean(payload.full_name, 200)!,
    organization: clean(payload.organization, 200)!,
    email: clean(payload.email, 200)!,
    whatsapp: clean(payload.whatsapp, 50)!,
    partnership_type: clean(payload.partnership_type, 100)!,
    game: clean(payload.game, 100),
    link: clean(payload.link, 500),
    community_size: clean(payload.community_size, 50),
    contribution: clean(payload.contribution, 3000)!,
    expectations: clean(payload.expectations, 3000)!,
    budget: clean(payload.budget, 100),
    message: clean(payload.message, 5000)!,
  };

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { error } = await supabase.from("partnership_requests").insert([row]);
  if (error) {
    console.error("[partnership-request] erreur d'enregistrement", error);
    return json({ error: "Enregistrement impossible pour le moment. Réessayez ou écrivez-nous directement par e-mail." }, 500);
  }
  console.log("[partnership-request] demande enregistrée", {
    type: row.partnership_type,
    organisation: row.organization,
  });

  // Envoi de l'e-mail à contact@egamebenin.com via Resend si la clé est configurée.
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.warn("[partnership-request] RESEND_API_KEY absente : e-mail non envoyé, la demande reste enregistrée en base.");
    return json({ success: true, email_sent: false });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `eGame Bénin Partenariats <${CONTACT_EMAIL}>`,
        to: [CONTACT_EMAIL],
        reply_to: row.email,
        subject: `Partenariat — ${row.partnership_type} — ${row.organization}`,
        html: buildEmailHtml(row),
      }),
    });
    if (!res.ok) {
      console.error("[partnership-request] erreur Resend", await res.text());
      return json({ success: true, email_sent: false });
    }
    console.log("[partnership-request] e-mail envoyé à", CONTACT_EMAIL);
    return json({ success: true, email_sent: true });
  } catch (err) {
    console.error("[partnership-request] exception envoi e-mail", err);
    return json({ success: true, email_sent: false });
  }
});
