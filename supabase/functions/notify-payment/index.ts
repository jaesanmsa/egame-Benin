import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
    const MON_WHATSAPP = "whatsapp:+2290141790790"
    const TWILIO_NUMBER = "whatsapp:+14155238886"

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error("Secrets Twilio manquants")
    }

    const { joueur_nom, joueur_telephone, tournoi_nom, montant, transactionId } = await req.json()

    const message = `🎮 *NOUVELLE INSCRIPTION*\n\n` +
                    `👤 Joueur: ${joueur_nom}\n` +
                    `📱 Tel: ${joueur_telephone}\n` +
                    `🏆 Tournoi: ${tournoi_nom}\n` +
                    `💰 Montant: ${montant} FCFA\n` +
                    `🆔 ID: ${transactionId}`

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: TWILIO_NUMBER,
          To: MON_WHATSAPP,
          Body: message,
        }),
      }
    )

    const data = await response.json()
    console.log("[notify-payment] Twilio response:", data)

    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    })

  } catch (error) {
    console.error("[notify-payment] Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400 
    })
  }
})