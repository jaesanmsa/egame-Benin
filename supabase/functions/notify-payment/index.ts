import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let transactionId = body.transactionId || body.transaction_id;
    let joueur_nom = body.joueur_nom;
    let joueur_prenom = body.joueur_prenom;
    let joueur_telephone = body.joueur_telephone;
    let tournoi_nom = body.tournoi_nom;
    let montant = body.montant;

    // Si c'est un webhook KKiaPay, on récupère les infos depuis la DB
    if (transactionId && !tournoi_nom) {
      const { data: payment, error: payError } = await supabase
        .from('payments')
        .select('*, profiles(full_name, phone, username)')
        .eq('kkiapay_transaction_id', transactionId)
        .single();

      if (payment) {
        joueur_nom = payment.profiles?.full_name || payment.profiles?.username || "Joueur";
        joueur_prenom = "";
        joueur_telephone = payment.profiles?.phone || "N/A";
        tournoi_nom = payment.tournament_name;
        montant = payment.amount;

        // Mise à jour du statut en base
        await supabase
          .from('payments')
          .update({ status: 'Réussi', updated_at: new Date().toISOString() })
          .eq('kkiapay_transaction_id', transactionId);
      }
    }

    // Message WhatsApp
    const message =
      `✅ *Nouveau paiement confirmé !*\n\n` +
      `🎮 *Tournoi :* ${tournoi_nom}\n` +
      `👤 *Joueur :* ${joueur_prenom} ${joueur_nom}\n` +
      `📱 *WhatsApp :* ${joueur_telephone}\n` +
      `💰 *Montant :* ${montant} FCFA\n` +
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