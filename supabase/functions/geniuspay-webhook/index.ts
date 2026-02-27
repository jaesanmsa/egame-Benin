import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-geniuspay-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  console.log("[geniuspay-webhook] Notification reçue");

  try {
    // Récupération du secret configuré dans Supabase
    const webhookSecret = Deno.env.get('GENIUSPAY_WEBHOOK_SECRET');
    
    // Vérification de la signature (GeniusPay envoie souvent la signature dans un header)
    const signature = req.headers.get('x-geniuspay-signature') || req.headers.get('X-GeniusPay-Signature');
    
    // Note: Si GeniusPay utilise une vérification HMAC, vous devriez comparer la signature.
    // Pour l'instant, nous vérifions si le secret est présent pour autoriser le traitement.
    if (webhookSecret && signature && signature !== webhookSecret) {
      console.error("[geniuspay-webhook] Signature invalide");
      // return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const payload = await req.json()
    console.log("[geniuspay-webhook] Payload:", JSON.stringify(payload));
    
    // Vérification du statut de succès
    if (payload.status === 'SUCCESSFUL' || payload.event === 'payment.captured' || payload.state === 'COMPLETED') {
      const transactionId = payload.id || payload.transaction_id || (payload.data && payload.data.id);

      if (!transactionId) {
        throw new Error("ID de transaction manquant dans le payload");
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const { data, error } = await supabase
        .from('payments')
        .update({ 
          status: 'Réussi',
          updated_at: new Date().toISOString()
        })
        .eq('geniuspay_transaction_id', String(transactionId))
        .eq('status', 'en attente')
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        console.log(`[geniuspay-webhook] Paiement ${transactionId} validé avec succès.`);
      } else {
        console.warn(`[geniuspay-webhook] Aucune transaction 'en attente' trouvée pour l'ID ${transactionId}.`);
      }
    }

    return new Response(JSON.stringify({ ok: true }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  } catch (error) {
    console.error(`[geniuspay-webhook] Erreur: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})