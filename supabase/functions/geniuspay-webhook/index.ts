import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  console.log("[geniuspay-webhook] Notification reçue");

  try {
    const payload = await req.json()
    // L'ID peut être à différents endroits selon le format du webhook GeniusPay
    const transactionId = payload.id || payload.transaction_id || (payload.data && payload.data.id);

    if (!transactionId) {
      console.error("[geniuspay-webhook] Aucun ID de transaction trouvé dans le payload");
      return new Response("No ID", { status: 200 });
    }

    const geniuspayKey = Deno.env.get('GENIUSPAY_SECRET_KEY');
    
    // --- ÉTAPE DE DOUBLE VÉRIFICATION (SERVER-TO-SERVER) ---
    // On demande directement à GeniusPay le statut de cette transaction
    console.log(`[geniuspay-webhook] Vérification de la transaction ${transactionId} auprès de GeniusPay...`);
    
    const verifyRes = await fetch(`https://api.geniuspay.ci/v1/payments/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${geniuspayKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!verifyRes.ok) {
      throw new Error(`Impossible de vérifier la transaction auprès de GeniusPay: ${verifyRes.statusText}`);
    }

    const verifyData = await verifyRes.json();
    const status = verifyData.status || verifyData.state;

    // On ne valide que si GeniusPay confirme que c'est SUCCESSFUL ou COMPLETED
    if (status === 'SUCCESSFUL' || status === 'COMPLETED' || status === 'ACCEPTED') {
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
        console.log(`[geniuspay-webhook] SUCCÈS : Paiement ${transactionId} vérifié et validé.`);
      } else {
        console.warn(`[geniuspay-webhook] Transaction ${transactionId} déjà traitée ou introuvable.`);
      }
    } else {
      console.warn(`[geniuspay-webhook] La transaction ${transactionId} n'est pas en succès (Statut: ${status})`);
    }

    return new Response(JSON.stringify({ ok: true }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  } catch (error) {
    console.error(`[geniuspay-webhook] ERREUR: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})