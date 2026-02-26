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

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) throw new Error('Session invalide')

    const { tournament_id, tournament_name, amount } = await req.json()

    // RÉCUPÉRATION DE LA CLÉ
    const fedapayKey = Deno.env.get('FEDAPAY_SECRET_KEY')
    if (!fedapayKey) throw new Error("FEDAPAY_SECRET_KEY non configurée dans Supabase");

    // AUTO-DÉTECTION DE L'ENVIRONNEMENT
    // Si la clé commence par sk_live_, on FORCE le mode live, peu importe la variable d'environnement
    const isLive = fedapayKey.startsWith('sk_live_');
    const fedapayBaseUrl = isLive ? 'https://api.fedapay.com' : 'https://sandbox-api.fedapay.com';

    console.log(`[create-payment] DIAGNOSTIC :`);
    console.log(`[create-payment] - Clé détectée comme : ${isLive ? 'LIVE' : 'SANDBOX/TEST'}`);
    console.log(`[create-payment] - URL utilisée : ${fedapayBaseUrl}`);

    // Création transaction
    const createRes = await fetch(`${fedapayBaseUrl}/v1/transactions`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${fedapayKey}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        amount: parseInt(String(amount)),
        description: `Inscription eGame: ${tournament_name}`,
        currency: { iso: 'XOF' },
        callback_url: `https://egamebenin.com/payment-success`,
        customer: { 
          email: user.email,
          firstname: user.user_metadata?.full_name?.split(' ')[0] || 'Joueur',
        },
      }),
    })

    const createData = await createRes.json()
    if (!createRes.ok) {
      console.error("[create-payment] Erreur FedaPay:", createData);
      throw new Error(createData.message || "Erreur FedaPay");
    }

    const fedapayId = createData?.v1?.transaction?.id || createData?.transaction?.id || createData?.id;

    // Génération Token
    const tokenRes = await fetch(`${fedapayBaseUrl}/v1/transactions/${fedapayId}/token`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${fedapayKey}`, 'Content-Type': 'application/json' },
    })
    
    const tokenData = await tokenRes.json()
    const checkoutUrl = tokenData?.token?.url || tokenData?.url

    const validationCode = `EGB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    
    await supabase.from('payments').insert({
      user_id: user.id,
      tournament_id,
      tournament_name,
      amount: String(amount),
      status: 'en attente',
      validation_code: validationCode,
      fedapay_transaction_id: String(fedapayId)
    })

    return new Response(JSON.stringify({ url: checkoutUrl }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("[create-payment] ERREUR:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})