import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-token',
}

serve(async (req) => {
  // Gestion du CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  console.log("[fedapay-webhook] Requête reçue...");

  // 1. Vérification du Token de sécurité
  const webhookToken = req.headers.get('x-webhook-token')
  const expectedToken = Deno.env.get('fedapaywebhook')

  if (!webhookToken || webhookToken !== expectedToken) {
    console.error("[fedapay-webhook] ERREUR: Token de sécurité manquant ou incorrect.");
    console.log("[fedapay-webhook] Reçu:", webhookToken, "Attendu:", expectedToken);
    return new Response(JSON.stringify({ error: 'Token non autorisé' }), { status: 401, headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log("[fedapay-webhook] Événement FedaPay:", payload.event)

    if (payload.event === 'transaction.approved') {
      const transaction = payload.entity
      const customerEmail = transaction.customer?.email
      
      if (!customerEmail) {
        console.error("[fedapay-webhook] ERREUR: Aucun email client dans la transaction FedaPay.");
        return new Response("No email", { status: 200 })
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Trouver l'utilisateur par son email
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
      if (userError) throw userError

      const user = userData.users.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase())

      if (!user) {
        console.error("[fedapay-webhook] ERREUR: Aucun utilisateur trouvé sur le site avec l'email:", customerEmail);
        return new Response("User not found", { status: 200 })
      }

      // Valider le dernier paiement "En attente" de cet utilisateur
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
        console.log("[fedapay-webhook] SUCCÈS: Paiement validé pour", customerEmail);
      } else {
        console.warn("[fedapay-webhook] ATTENTION: Transaction approuvée mais aucun paiement 'En attente' trouvé pour cet utilisateur.");
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