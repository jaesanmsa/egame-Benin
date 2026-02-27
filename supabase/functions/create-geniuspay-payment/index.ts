import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Authentification manquante')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) throw new Error('Session invalide')

    const { tournament_id, tournament_name, amount } = await req.json()
    const geniuspayKey = Deno.env.get('GENIUSPAY_SECRET_KEY')

    // Appel à l'API GeniusPay (Exemple de structure standard)
    const response = await fetch('https://api.geniuspay.ci/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${geniuspayKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: parseInt(amount),
        currency: 'XOF',
        description: `Inscription eGame: ${tournament_name}`,
        customer_email: user.email,
        callback_url: `https://egamebenin.com/payment-success`,
        metadata: { tournament_id, user_id: user.id }
      })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || "Erreur GeniusPay")

    const validationCode = `EGB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    
    // Enregistrement en base
    await supabase.from('payments').insert({
      user_id: user.id,
      tournament_id,
      tournament_name,
      amount: String(amount),
      status: 'en attente',
      validation_code: validationCode,
      geniuspay_transaction_id: String(data.id)
    })

    return new Response(JSON.stringify({ url: data.payment_url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})