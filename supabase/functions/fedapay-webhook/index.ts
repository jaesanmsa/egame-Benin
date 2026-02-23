import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-token',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const webhookToken = req.headers.get('x-webhook-token')?.trim();
  const expectedToken = (Deno.env.get('fedapaywebhook') || Deno.env.get('FEDAPAY_WEBHOOK_TOKEN'))?.trim();

  if (!webhookToken || webhookToken !== expectedToken) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401, headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    
    if (payload.event === 'transaction.approved') {
      const transaction = payload.entity
      const fedapayId = String(transaction.id)

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Validation uniquement par l'ID de transaction FedaPay
      const { error } = await supabase
        .from('payments')
        .update({ status: 'Réussi' })
        .eq('fedapay_transaction_id', fedapayId)
        .eq('status', 'En attente')
        
      if (error) console.error(`[webhook] Erreur SQL: ${error.message}`)
      else console.log(`[webhook] Paiement ${fedapayId} validé avec succès.`)
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
  }
})