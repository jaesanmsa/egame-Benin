import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

serve(async (req) => {
  try {
    const payload = await req.json()
    
    // Vérification du statut (selon la doc GeniusPay)
    if (payload.status === 'SUCCESSFUL' || payload.event === 'payment.captured') {
      const transactionId = payload.id || payload.transaction_id;

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabase
        .from('payments')
        .update({ status: 'Réussi' })
        .eq('geniuspay_transaction_id', String(transactionId))
        .eq('status', 'en attente');
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (error) {
    return new Response(error.message, { status: 400 })
  }
})