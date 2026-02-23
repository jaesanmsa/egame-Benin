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

  console.log("[fedapay-webhook] Requête reçue...")

  // 1. Vérification du token de sécurité
  const webhookToken = req.headers.get('x-webhook-token')
  const expectedToken = Deno.env.get('FEDAPAY_WEBHOOK_TOKEN') ?? Deno.env.get('fedapaywebhook')

  if (!webhookToken || !expectedToken || webhookToken !== expectedToken) {
    console.error("[fedapay-webhook] ERREUR: Token de sécurité manquant ou incorrect.")
    return new Response(JSON.stringify({ error: 'Token non autorisé' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const payload = await req.json()
    console.log("[fedapay-webhook] Événement FedaPay:", payload.event)

    if (payload.event === 'transaction.approved') {
      const transaction = payload.entity
      const fedapayTransactionId = transaction?.id ? String(transaction.id) : null

      if (!fedapayTransactionId) {
        console.error("[fedapay-webhook] ERREUR: Aucun ID de transaction dans le payload.")
        return new Response(JSON.stringify({ error: 'ID de transaction manquant' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      console.log("[fedapay-webhook] Transaction FedaPay ID:", fedapayTransactionId)

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Mise à jour du paiement correspondant par fedapay_transaction_id
      const { data: updateData, error: updateError } = await supabase
        .from('payments')
        .update({ status: 'Réussi' })
        .eq('fedapay_transaction_id', fedapayTransactionId)
        .eq('status', 'En attente')
        .select()

      if (updateError) throw updateError

      if (updateData && updateData.length > 0) {
        console.log("[fedapay-webhook] SUCCÈS: Paiement validé pour la transaction", fedapayTransactionId)
      } else {
        console.warn("[fedapay-webhook] ATTENTION: Transaction approuvée mais aucun paiement 'En attente' trouvé pour l'ID:", fedapayTransactionId)
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error("[fedapay-webhook] ERREUR CRITIQUE:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
