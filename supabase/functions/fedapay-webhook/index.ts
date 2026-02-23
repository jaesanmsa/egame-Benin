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

  // On récupère le token envoyé par FedaPay dans le header
  const webhookToken = req.headers.get('x-webhook-token')
  
  // On récupère le secret que TU as configuré dans Supabase
  const expectedToken = Deno.env.get('fedapaywebhook')

  console.log("[fedapay-webhook] Tentative de validation avec le token reçu")

  if (!webhookToken || webhookToken !== expectedToken) {
    console.error("[fedapay-webhook] ERREUR: Token non autorisé. Vérifie que le Header 'X-Webhook-Token' sur FedaPay correspond au secret 'fedapaywebhook' sur Supabase.")
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log("[fedapay-webhook] Événement reçu:", payload.event)

    if (payload.event === 'transaction.approved') {
      const transaction = payload.entity
      const customerEmail = transaction.customer?.email
      
      if (!customerEmail) {
        console.error("[fedapay-webhook] ERREUR: Aucun email trouvé dans la transaction")
        return new Response("No email", { status: 200 })
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Liste des utilisateurs pour trouver le bon ID
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
      if (userError) throw userError

      const user = userData.users.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase())

      if (user) {
        // Mise à jour du paiement
        const { data: updateData, error: updateError } = await supabase
          .from('payments')
          .update({ status: 'Réussi' })
          .eq('user_id', user.id)
          .eq('status', 'En attente')
          .order('created_at', { ascending: false })
          .limit(1)
          .select()

        if (updateError) throw updateError

        if (updateData && updateData.length > 0) {
          console.log("[fedapay-webhook] SUCCÈS: Paiement validé pour", customerEmail)
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  } catch (error) {
    console.error("[fedapay-webhook] ERREUR:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})