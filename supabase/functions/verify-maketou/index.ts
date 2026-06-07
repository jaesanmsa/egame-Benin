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
    const MAKETOU_SECRET_KEY = Deno.env.get('MAKETOU_SECRET_KEY')

    if (!MAKETOU_SECRET_KEY) {
      throw new Error("La clé secrète MAKETOU_SECRET_KEY n'est pas configurée.")
    }

    console.log(`[verify-maketou] Vérification de la transaction: ${transaction_id}`)

    // 1. Appeler l'API Maketou pour vérifier le statut
    const response = await fetch(`https://api.maketou.com/v1/transactions/verify/${transaction_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MAKETOU_SECRET_KEY}`,
        'Content-Type': 'application/json',
      }
    })

    const maketouData = await response.json()
    
    // Vérification du statut (selon la doc Maketou, souvent 'SUCCESS' ou 'COMPLETED')
    if (maketouData.status !== 'SUCCESS' && maketouData.status !== 'COMPLETED') {
      throw new Error(`Paiement non validé. Statut: ${maketouData.status}`)
    }

    // 2. Enregistrement Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } }
    )
    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    const { data: existing } = await supabase
      .from('payments')
      .select('*')
      .eq('fedapay_transaction_id', transaction_id) // On réutilise ce champ pour stocker l'ID Maketou
      .maybeSingle()

    if (existing) {
      return new Response(JSON.stringify({ success: true, validation_code: existing.validation_code }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const code = `EGB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    
    await supabase.from('payments').insert({
      user_id: user.id,
      tournament_id: tournamentId,
      tournament_name: tournamentName,
      amount: amount,
      status: 'Réussi',
      validation_code: code,
      fedapay_transaction_id: transaction_id
    })

    // Créditer les points
    const { data: profile } = await supabase.from('profiles').select('points').eq('id', user.id).single()
    await supabase.from('profiles').update({ points: (profile?.points || 0) + 10 }).eq('id', user.id)

    return new Response(JSON.stringify({ success: true, validation_code: code }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    console.error("[verify-maketou] Erreur:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})