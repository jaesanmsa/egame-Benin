import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log("[cleanup-payments] Démarrage du nettoyage des paiements expirés (2 heures)...")

    // Les tentatives anciennes passent en "Échoué" : le règlement par référence
    // (settle_kkiapay_payment) reste possible ensuite, quel que soit le statut.
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('payments')
      .update({ status: 'Échoué' })
      .eq('status', 'En attente')
      .is('fedapay_transaction_id', null)
      .lt('created_at', twoHoursAgo)
      .select()

    if (error) throw error

    console.log(`[cleanup-payments] Nettoyage terminé. ${data?.length || 0} paiements marqués comme échoués.`)

    return new Response(JSON.stringify({ success: true, updated: data?.length || 0 }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  } catch (error) {
    console.error("[cleanup-payments] ERREUR:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
