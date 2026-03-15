import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

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

    const payload = await req.json()
    console.log("[send-push-notification] Payload reçu:", payload)

    let tokens: string[] = []
    let title = ""
    let body = ""

    switch (payload.type) {
      case 'NEW_TOURNAMENT':
        // Récupérer les tokens des joueurs de la même ville
        const { data: cityUsers } = await supabase
          .from('profiles')
          .select('fcm_token')
          .eq('city', payload.city)
          .eq('notifications_enabled', true)
          .not('fcm_token', 'is', null)
        
        tokens = cityUsers?.map(u => u.fcm_token) || []
        title = `🎮 Nouveau tournoi ${payload.game} disponible !`
        body = `${payload.slots} places — ${payload.fee} FCFA — Cash prize ${payload.prize}`
        break;

      case 'PAYMENT_CONFIRMED':
        // Récupérer le token de l'utilisateur spécifique
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
        // Récupérer les tokens de tous les participants du tournoi
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
      return new Response(JSON.stringify({ success: true, message: "Aucun destinataire trouvé" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    console.log(`[send-push-notification] Envoi à ${tokens.length} tokens:`, title)

    // Ici, vous devriez appeler l'API FCM v1. 
    // Pour cela, vous devez configurer un Service Account dans les secrets Supabase.
    // Pour l'instant, nous logguons l'intention d'envoi.

    return new Response(JSON.stringify({ success: true, sentTo: tokens.length }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    })

  } catch (error) {
    console.error("[send-push-notification] Erreur:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400 
    })
  }
})