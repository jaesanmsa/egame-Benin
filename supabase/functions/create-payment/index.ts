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
    if (!authHeader) throw new Error('Non autorisé')

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) throw new Error('Utilisateur non trouvé')

    const { tournament_id, tournament_name, amount } = await req.json()
    const validationCode = `EGB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    const fedapayKey = Deno.env.get('FEDAPAY_SECRET_KEY') ?? ''
    const fedapayBaseUrl = Deno.env.get('FEDAPAY_ENV') === 'live' ? 'https://api.fedapay.com' : 'https://sandbox-api.fedapay.com'

    const createRes = await fetch(`${fedapayBaseUrl}/v1/transactions`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${fedapayKey}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        amount: parseInt(String(amount)),
        description: `Tournoi: ${tournament_name}`,
        currency: { iso: 'XOF' },
        callback_url: `https://egamebenin.com/payment-success`,
        customer: { email: user.email },
      }),
    })

    const createData = await createRes.json()
    const fedapayId = createData?.v1?.transaction?.id || createData?.transaction?.id || createData?.id

    if (!fedapayId) throw new Error("Erreur FedaPay : Impossible de créer la transaction")

    const tokenRes = await fetch(`${fedapayBaseUrl}/v1/transactions/${fedapayId}/token`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${fedapayKey}`, 
        'Content-Type': 'application/json' 
      },
    })
    const tokenData = await tokenRes.json()
    const checkoutUrl = tokenData?.token?.url || tokenData?.url

    // Insertion avec 'en attente' en minuscules
    const { error: insertError } = await supabase.from('payments').insert({
      user_id: user.id,
      tournament_id,
      tournament_name,
      amount: String(amount),
      status: 'en attente',
      validation_code: validationCode,
      fedapay_transaction_id: String(fedapayId)
    })

    if (insertError) throw insertError

    return new Response(JSON.stringify({ url: checkoutUrl }), {
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