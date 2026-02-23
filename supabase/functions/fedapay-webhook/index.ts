import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gestion du CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log("[fedapay-webhook] Payload reçu:", payload)

    // On vérifie si la transaction est approuvée
    if (payload.event === 'transaction.approved') {
      const transaction = payload.entity
      
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // On cherche le paiement en attente correspondant
      // FedaPay envoie l'email du client. On l'utilise pour matcher.
      const customerEmail = transaction.customer?.email

      if (customerEmail) {
        const { data: userData } = await supabase.auth.admin.listUsers()
        const user = userData.users.find(u => u.email === customerEmail)

        if (user) {
          const { error } = await supabase
            .from('payments')
            .update({ status: 'Réussi' })
            .eq('user_id', user.id)
            .eq('status', 'En attente')
            .order('created_at', { ascending: false })
            .limit(1)

          if (error) throw error
          console.log(`[fedapay-webhook] Paiement validé pour ${customerEmail}`)
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  } catch (error) {
    console.error("[fedapay-webhook] Erreur:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})