import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { JWT } from 'https://esm.sh/google-auth-library@9.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_EMAIL = 'egamebenin@gmail.com'
const SITE_URL = 'https://www.egamebenin.com'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 0. Authentification de l'appelant : soit la clé service_role (appels serveur à
    // serveur des fonctions de paiement), soit l'administrateur connecté (dashboard).
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
    const isServiceRole = token !== '' && token === Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!isServiceRole) {
      const { data: { user } } = await supabase.auth.getUser(token)
      if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
        return new Response(JSON.stringify({ error: "Accès réservé à l'administrateur." }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

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
    let link = SITE_URL

    // 2. Logique de ciblage
    switch (payload.type) {
      case 'NEW_TOURNAMENT': {
        // Plateforme panafricaine : on notifie TOUS les joueurs abonnés
        // (l'ancien filtre par ville excluait la majorité des joueurs).
        const { data: subscribers, error: fetchError } = await supabase
          .from('profiles')
          .select('fcm_token')
          .eq('notifications_enabled', true)
          .not('fcm_token', 'is', null)
        if (fetchError) throw fetchError
        tokens = subscribers?.map((u: any) => u.fcm_token) || []
        title = `🎮 Nouveau tournoi ${payload.game} !`
        body = `${payload.slots} places — ${payload.fee} FCFA — Cash prize ${payload.prize}`
        if (payload.tournament_id) link = `${SITE_URL}/tournament/${encodeURIComponent(payload.tournament_id)}`
        break;
      }

      case 'PAYMENT_CONFIRMED': {
        const { data: user } = await supabase
          .from('profiles')
          .select('fcm_token')
          .eq('id', payload.user_id)
          .single()
        if (user?.fcm_token) tokens = [user.fcm_token]
        title = "✅ Inscription confirmée !"
        body = `Ton inscription au tournoi ${payload.tournament_name} est validée. Bonne chance !`
        link = `${SITE_URL}/payments`
        break;
      }

      case 'RESULTS_PUBLISHED': {
        const { data: participants } = await supabase
          .from('payments')
          .select('user_id')
          .eq('tournament_id', payload.tournament_id)
          .eq('status', 'Réussi')
        const userIds = participants?.map((p: any) => p.user_id).filter(Boolean) || []
        const { data: participantTokens } = await supabase
          .from('profiles')
          .select('fcm_token')
          .in('id', userIds)
          .eq('notifications_enabled', true)
          .not('fcm_token', 'is', null)
        tokens = participantTokens?.map((u: any) => u.fcm_token) || []
        title = `🏆 Résultats : ${payload.tournament_name}`
        body = `Le tournoi est terminé ! Félicitations à ${payload.winner}.`
        if (payload.tournament_id) link = `${SITE_URL}/tournament/${encodeURIComponent(payload.tournament_id)}`
        break;
      }
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
    const sendPromises = tokens.map((token) => {
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
                link
              }
            }
          }
        })
      })
    })

    const results = await Promise.all(sendPromises)
    const failures = results.filter((r) => !r.ok)
    for (const failure of failures) {
      console.error("[send-push-notification] Échec FCM:", failure.status, await failure.text())
    }
    console.log(`[send-push-notification] ${results.length - failures.length}/${results.length} notifications envoyées.`)

    return new Response(JSON.stringify({ success: true, sent: results.length - failures.length }), {
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
