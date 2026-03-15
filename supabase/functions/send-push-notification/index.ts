import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { JWT } from 'https://esm.sh/google-auth-library@9.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Récupération du Service Account depuis les secrets
    const serviceAccount = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') || '{}')
    if (!serviceAccount.project_id) {
      throw new Error("Le secret FIREBASE_SERVICE_ACCOUNT est manquant ou invalide.")
    }

    const payload = await req.json()
    console.log("[send-push-notification] Payload reçu:", payload)

    let tokens: string[] = []
    let title = ""
    let body = ""

    // 2. Logique de ciblage (identique à la version précédente)
    switch (payload.type) {
      case 'NEW_TOURNAMENT':
        const { data: cityUsers } = await supabase
          .from('profiles')
          .select('fcm_token')
          .eq('city', payload.city)
          .eq('notifications_enabled', true)
          .not('fcm_token', 'is', null)
        tokens = cityUsers?.map(u => u.fcm_token) || []
        title = `🎮 Nouveau tournoi ${payload.game} !`
        body = `${payload.slots} places — ${payload.fee} FCFA — Cash prize ${payload.prize}`
        break;

      case 'PAYMENT_CONFIRMED':
        const { data: user } = await supabase
          .from('profiles')
          .select('fcm_token')
          .eq('id', payload.user_id)
          .single()
        if (user?.fcm_token) tokens = [user.fcm_token]
        title = "✅ Inscription confirmée !"
        body = `Ton inscription au tournoi ${payload.tournament_name} est validée. Bonne chance !`
        break;

      case 'RESULTS_PUBLISHED':
        const { data: participants } = await supabase
          .from('payments')
          .select('user_id')
          .eq('tournament_id', payload.tournament_id)
          .eq('status', 'Réussi')
        const userIds = participants?.map(p => p.user_id) || []
        const { data: participantTokens } = await supabase
          .from('profiles')
          .select('fcm_token')
          .in('id', userIds)
          .eq('notifications_enabled', true)
        tokens = participantTokens?.map(u => u.fcm_token) || []
        title = `🏆 Résultats : ${payload.tournament_name}`
        body = `Le tournoi est terminé ! Félicitations à ${payload.winner}.`
        break;
    }

    if (tokens.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "Aucun destinataire" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 3. Authentification Google OAuth2
    const jwtClient = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })

    const accessToken = await jwtClient.getAccessToken()
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`

    // 4. Envoi des notifications (une par token pour FCM v1)
    const sendPromises = tokens.map(token => {
      return fetch(fcmUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token: token,
            notification: { title, body },
            webpush: {
              fcm_options: {
                link: "https://www.egamebenin.com"
              }
            }
          }
        })
      })
    })

    const results = await Promise.all(sendPromises)
    console.log(`[send-push-notification] ${results.length} notifications envoyées.`)

    return new Response(JSON.stringify({ success: true, sent: results.length }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    })

  } catch (error) {
    console.error("[send-push-notification] ERREUR:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400 
    })
  }
})