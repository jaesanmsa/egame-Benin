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
    // 1. Vérification de l'authentification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      console.error('[create-payment] ERREUR: Utilisateur non authentifié.', userError?.message)
      return new Response(JSON.stringify({ error: 'Utilisateur non trouvé' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { tournament_id, tournament_name, amount } = await req.json()

    if (!tournament_id || !tournament_name || !amount) {
      return new Response(JSON.stringify({ error: 'Paramètres manquants: tournament_id, tournament_name, amount requis' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const validationCode = `EGB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    // 2. Création de la transaction via l'API FedaPay
    const fedapayEnv = Deno.env.get('FEDAPAY_ENV') ?? 'sandbox'
    const fedapayBaseUrl = fedapayEnv === 'live'
      ? 'https://api.fedapay.com'
      : 'https://sandbox-api.fedapay.com'
    const fedapayKey = Deno.env.get('FEDAPAY_SECRET_KEY') ?? ''

    console.log(`[create-payment] Création de la transaction FedaPay (${fedapayEnv}) pour ${user.email}`)

    const createRes = await fetch(`${fedapayBaseUrl}/v1/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fedapayKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: parseInt(String(amount)),
        description: `Inscription ${tournament_name} - ${validationCode}`,
        currency: { iso: 'XOF' },
        callback_url: `${Deno.env.get('SITE_URL') ?? ''}/payment-success`,
        customer: { email: user.email },
      }),
    })

    if (!createRes.ok) {
      const errText = await createRes.text()
      throw new Error(`FedaPay create transaction error (${createRes.status}): ${errText}`)
    }

    const createData = await createRes.json()
    const fedapayTransactionId =
      createData?.v1?.transaction?.id ??
      createData?.transaction?.id ??
      createData?.id

    if (!fedapayTransactionId) {
      throw new Error('ID de transaction FedaPay introuvable dans la réponse')
    }

    console.log(`[create-payment] Transaction FedaPay créée: ID=${fedapayTransactionId}`)

    // 3. Génération du token de paiement pour obtenir l'URL de checkout
    const tokenRes = await fetch(`${fedapayBaseUrl}/v1/transactions/${fedapayTransactionId}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fedapayKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      throw new Error(`FedaPay token error (${tokenRes.status}): ${errText}`)
    }

    const tokenData = await tokenRes.json()
    // FedaPay retourne { token: { url: "..." } } ou directement { url: "..." }
    const checkoutUrl = tokenData?.token?.url ?? tokenData?.url ?? tokenData?.token_url

    if (!checkoutUrl) {
      throw new Error('URL de paiement FedaPay introuvable dans la réponse')
    }

    // 4. Insertion du paiement en base avec le fedapay_transaction_id
    const { error: insertError } = await supabase.from('payments').insert({
      user_id: user.id,
      tournament_id,
      tournament_name,
      amount: String(amount),
      status: 'En attente',
      validation_code: validationCode,
      fedapay_transaction_id: String(fedapayTransactionId),
    })

    if (insertError) throw insertError

    console.log(`[create-payment] SUCCÈS: Paiement créé pour ${user.email}, code=${validationCode}`)

    return new Response(JSON.stringify({ url: checkoutUrl, validation_code: validationCode }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[create-payment] ERREUR CRITIQUE:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
