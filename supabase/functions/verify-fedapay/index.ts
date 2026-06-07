import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { transaction_id, tournamentId, tournamentName, amount } = await req.json()
    const FEDAPAY_SECRET_KEY = Deno.env.get('FEDAPAY_SECRET_KEY')

    if (!FEDAPAY_SECRET_KEY) {
      throw new Error("La clé secrète FEDAPAY_SECRET_KEY n'est pas configurée dans Supabase.")
    }

    console.log(`[verify-fedapay] Vérification de la transaction: ${transaction_id}`)

    // 1. Appeler l'API FedaPay pour vérifier le statut réel
    const response = await fetch(`https://api.fedapay.com/v1/transactions/${transaction_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}`,
        'Content-Type': 'application/json',
      }
    })

    const fedaData = await response.json()
    
    // Le statut doit être 'approved' chez FedaPay
    if (fedaData.v1?.transaction?.status !== 'approved') {
      throw new Error(`Paiement non approuvé. Statut actuel: ${fedaData.v1?.transaction?.status}`)
    }

    // 2. Si c'est bon, on enregistre dans la base de données Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Récupérer l'utilisateur via le token d'auth (si présent) ou gérer via le contexte
    // Pour simplifier, on récupère l'ID utilisateur lié à la transaction si FedaPay le permet 
    // ou on attend que le frontend envoie l'ID utilisateur.
    const authHeader = req.headers.get('Authorization')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } }
    )
    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    // Vérifier si déjà enregistré
    const { data: existing } = await supabase
      .from('payments')
      .select('*')
      .eq('fedapay_transaction_id', transaction_id)
      .maybeSingle()

    if (existing) {
      return new Response(JSON.stringify({ success: true, already_processed: true, validation_code: existing.validation_code }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const code = `EGB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    
    const { error: insertError } = await supabase.from('payments').insert({
      user_id: user.id,
      tournament_id: tournamentId,
      tournament_name: tournamentName,
      amount: amount,
      status: 'Réussi',
      validation_code: code,
      fedapay_transaction_id: transaction_id
    })

    if (insertError) throw insertError;

    // Créditer les points
    const { data: profile } = await supabase.from('profiles').select('points').eq('id', user.id).single()
    await supabase.from('profiles').update({ points: (profile?.points || 0) + 10 }).eq('id', user.id)

    console.log(`[verify-fedapay] Succès ! Code généré: ${code}`)

    return new Response(JSON.stringify({ success: true, validation_code: code }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    console.error("[verify-fedapay] Erreur:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})