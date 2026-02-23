import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-token',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // SÉCURITÉ : Vérification du Token personnalisé
  // Tu dois mettre 'X-Webhook-Token' et 'egame-benin-secret-2026' dans FedaPay
  const webhookToken = req.headers.get('x-webhook-token')
  if (webhookToken !== 'egame-benin-secret-2026') {
    console.error("[fedapay-webhook] Tentative non autorisée ou Token manquant")
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log("[fedapay-webhook] Payload reçu:", payload)

    if (payload.event === 'transaction.approved') {
      const transaction = payload.entity
      
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const customerEmail = transaction.customer?.email

      if (customerEmail) {
        // On récupère l'utilisateur par son email
        const { data: userData } = await supabase.auth.admin.listUsers()
        const user = userData.users.find(u => u.email.toLowerCase() === customerEmail.toLowerCase())

        if (user) {
          const { error } = await supabase
            .from('payments')
            .update({ status: 'Réussi' })
            .eq('user_id', user.id)
            .eq('status', 'En attente')
            .order('created_at', { ascending: false })
            .limit(1)

          if (error) throw error
          console.log(`[fedapay-webhook] Paiement validé automatiquement pour ${customerEmail}`)
        } else {
          console.warn(`[fedapay-webhook] Aucun utilisateur trouvé pour l'email: ${customerEmail}`)
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  } catch (error) {
    console.error("[fedapay-webhook] Erreur critique:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})