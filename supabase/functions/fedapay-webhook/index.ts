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

  const webhookToken = req.headers.get('x-webhook-token')
  console.log("[fedapay-webhook] Token reçu dans le header:", webhookToken)

  if (webhookToken !== 'egame-benin-secret-2026') {
    console.error("[fedapay-webhook] ERREUR: Token non autorisé ou manquant")
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log("[fedapay-webhook] Événement reçu:", payload.event)

    if (payload.event === 'transaction.approved') {
      const transaction = payload.entity
      const customerEmail = transaction.customer?.email
      console.log("[fedapay-webhook] Transaction approuvée pour l'email:", customerEmail)

      if (!customerEmail) {
        console.error("[fedapay-webhook] ERREUR: Aucun email trouvé dans la transaction")
        return new Response("No email", { status: 200 })
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Recherche de l'utilisateur par email
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
      if (userError) throw userError

      const user = userData.users.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase())

      if (user) {
        console.log("[fedapay-webhook] Utilisateur trouvé:", user.id)
        
        // Mise à jour du dernier paiement en attente
        const { data: updateData, error: updateError } = await supabase
          .from('payments')
          .update({ status: 'Réussi' })
          .eq('user_id', user.id)
          .eq('status', 'En attente')
          .order('created_at', { ascending: false })
          .limit(1)
          .select()

        if (updateError) {
          console.error("[fedapay-webhook] ERREUR lors de l'update:", updateError.message)
          throw updateError
        }

        if (updateData && updateData.length > 0) {
          console.log("[fedapay-webhook] SUCCÈS: Paiement mis à jour pour le tournoi:", updateData[0].tournament_name)
        } else {
          console.warn("[fedapay-webhook] ATTENTION: Aucun paiement 'En attente' trouvé pour cet utilisateur")
        }
      } else {
        console.warn("[fedapay-webhook] ATTENTION: Aucun utilisateur trouvé dans Supabase pour l'email:", customerEmail)
      }
    }

    return new Response(JSON.stringify({ ok: true }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  } catch (error) {
    console.error("[fedapay-webhook] ERREUR CRITIQUE:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})