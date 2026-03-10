import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TWILIO_ACCOUNT_SID = "AC08e003bc21fec21e19662b7dd9c8d564";
const TWILIO_AUTH_TOKEN = "3e9e74939927870b24e2a4ab94b4be29";
const TWILIO_WHATSAPP_NUMBER = "whatsapp:+14155238886";
const MON_WHATSAPP = "whatsapp:+2290141790790";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    console.log("[notify-payment] Payload reçu:", body);

    const { joueur_nom, joueur_telephone, tournoi_nom, montant, transactionId } = body;

    // Message WhatsApp formaté
    const message =
      `✅ *Nouveau paiement confirmé !*\n\n` +
      `🎮 *Tournoi :* ${tournoi_nom}\n` +
      `👤 *Joueur :* ${joueur_nom}\n` +
      `📱 *WhatsApp :* ${joueur_telephone}\n` +
      `💰 *Montant :* ${montant} FCFA\n` +
      `🆔 *Transaction :* ${transactionId}\n` +
      `🕐 *Date :* ${new Date().toLocaleString("fr-FR", { timeZone: "Africa/Porto-Novo" })}`;

    // Appel API Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const formData = new URLSearchParams();
    formData.append("From", TWILIO_WHATSAPP_NUMBER);
    formData.append("To", MON_WHATSAPP);
    formData.append("Body", message);

    const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const result = await response.json();

    return new Response(
      JSON.stringify({ success: true, message_sid: result.sid }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("[notify-payment] Erreur:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});