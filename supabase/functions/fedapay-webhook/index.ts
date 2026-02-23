import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-token',
}

serve(async (req) => {
  // Gestion du CORS
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  console.log("[fedapay-webhook] Requête reçue");

  try {
    const payload = await req.json()
    console.log("[fedapay-webhook] Payload reçu:", JSON.stringify(payload));
    
    // On vérifie si c'est une transaction approuvée
    if (payload.event === 'transaction.approved' || payload.event === 'transaction.successful') {
      const transaction = payload.entity;
      // On récupère l'ID de FedaPay (on essaie plusieurs formats pour être sûr)
      const fedapayId = String(transaction.id || payload.id);

      console.log(`[fedapay-webhook] Tentative de validation pour l'ID FedaPay: ${fedapayId}`);

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Mise à jour du statut et de la date de mise à jour
      const { data, error } = await supabase
        .from('payments')
        .update({ 
          status: 'Réussi',
          updated_at: new Date().toISOString()
        })
        .eq('fedapay_transaction_id', fedapayId)
        .select();
        
      if (error) {
        console.error(`[fedapay-webhook] Erreur SQL lors de la mise à jour: ${error.message}`);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
      }

      if (data && data.length > 0) {
        console.log(`[fedapay-webhook] SUCCÈS : Paiement ${fedapayId} marqué comme Réussi.`);
      } else {
        console.warn(`[fedapay-webhook] ATTENTION : Aucun paiement trouvé en base avec l'ID ${fedapayId}.`);
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders })
  } catch (error) {
    console.error(`[fedapay-webhook] Erreur critique: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
  }
})