import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const body = await req.json()
    const { action, transaction_id, tournamentId, tournamentName, amount, productDocumentId, customer } = body
    const MAKETOU_SECRET_KEY = Deno.env.get('MAKETOU_SECRET_KEY')

    if (!MAKETOU_SECRET_KEY) throw new Error("MAKETOU_SECRET_KEY non configurée.")

    // --- ACTION : CRÉER UN PAIEMENT ---
    if (action === 'create') {
      console.log(`[maketou] Création d'un panier pour le produit: ${productDocumentId}`)
      
      const response = await fetch(`https://api.maketou.net/api/v1/stores/cart/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MAKETOU_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productDocumentId: productDocumentId,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          customerPrice: amount, // Utilisation du prix libre si configuré
          redirectURL: customer.redirectURL,
          meta: {
            tournamentId: tournamentId,
            tournamentName: tournamentName,
            userId: customer.userId
          }
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Erreur lors de la création du panier Maketou")

      return new Response(JSON.stringify({ redirectUrl: data.redirectUrl, cartId: data.cart.id }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // --- ACTION : VÉRIFIER UN PAIEMENT ---
    if (action === 'verify') {
      console.log(`[maketou] Vérification du panier: ${transaction_id}`)

      const response = await fetch(`https://api.maketou.net/api/v1/stores/cart/${transaction_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MAKETOU_SECRET_KEY}`,
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()
      
      if (data.status !== 'completed') {
        throw new Error(`Paiement non complété. Statut actuel: ${data.status}`)
      }

      // Enregistrement en base de données
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Vérifier si déjà enregistré
      const { data: existing } = await supabase
        .from('payments')
        .select('*')
        .eq('fedapay_transaction_id', transaction_id)
        .maybeSingle()

      if (existing) {
        return new Response(JSON.stringify({ success: true, validation_code: existing.validation_code }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }

      const code = `EGB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
      
      await supabase.from('payments').insert({
        user_id: data.meta.userId,
        tournament_id: tournamentId,
        tournament_name: tournamentName,
        amount: amount,
        status: 'Réussi',
        validation_code: code,
        fedapay_transaction_id: transaction_id
      })

      // Créditer les points
      const { data: profile } = await supabase.from('profiles').select('points').eq('id', data.meta.userId).single()
      await supabase.from('profiles').update({ points: (profile?.points || 0) + 10 }).eq('id', data.meta.userId)

      return new Response(JSON.stringify({ success: true, validation_code: code }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

  } catch (error) {
    console.error("[maketou] Erreur:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})