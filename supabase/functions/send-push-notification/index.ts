import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { tokens, title, body, data } = await req.json()
    
    // Note: Pour envoyer réellement via Firebase depuis une Edge Function, 
    // il faudrait utiliser les identifiants de compte de service (Service Account).
    // Ici, nous simulons l'envoi pour la structure.
    
    console.log(`[send-push-notification] Envoi de "${title}" à ${tokens.length} appareils.`);

    // Logique d'envoi HTTP vers fcm.googleapis.com/fcm/send (Legacy) 
    // ou via l'API v1 (recommandé avec OAuth2)
    
    return new Response(JSON.stringify({ success: true, sentCount: tokens.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})