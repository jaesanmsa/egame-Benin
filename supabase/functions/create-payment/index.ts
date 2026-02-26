import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    console.log("[create-payment] Nouvelle tentative d'inscription...");

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('En-tête d\'autorisation manquant')

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      console.error("[create-payment] Erreur utilisateur:", userError);
      throw new Error('Utilisateur non authentifié');
    }

    const { tournament_id, tournament_name, amount } = await req.json()
    console.log(`[create-payment] Tournoi: ${tournament_name}, Montant: ${amount}, User: ${user.email}`);

    const validationCode = `EGB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    const fedapayKey = Deno.env.get('FEDAPAY_SECRET_KEY') ?? ''
    const fedapayEnv = Deno.env.get('FEDAPAY_ENV') ?? 'sandbox'
    const fedapayBaseUrl = fedapayEnv === 'live' ? 'https://api.fedapay.com' : 'https://sandbox-api.fedapay.com'

    if (!fedapayKey) {
      console.error("[create-payment] FEDAPAY_SECRET_KEY manquante dans les secrets Supabase");
      throw new Error("Configuration de paiement manquante");
    }

    // 1. Création de la transaction FedaPay
    console.log("[create-payment] Appel API FedaPay...");
    const createRes = await fetch(`${fedapayBaseUrl}/v1/transactions`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${fedapayKey}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        amount: parseInt(String(amount)),
        description: `Inscription: ${tournament_name}`,
        currency: { iso: 'XOF' },
        callback_url: `https://egamebenin.com/payment-success`,
        customer: { 
          email: user.email,
          firstname: user.user_metadata?.full_name?.split(' ')[0] || 'Joueur',
          lastname: user.user_metadata?.full_name?.split(' ')[1] || 'eGame'
        },
      }),
    })

    const createData = await createRes.json()
    
    if (!createRes.ok) {
      console.error("[create-payment] Erreur FedaPay API:", createData);
      throw new Error(createData.message || "Erreur lors de la création de la transaction FedaPay");
    }

    const fedapayId = createData?.v1?.transaction?.id || createData?.transaction?.id || createData?.id
    console.log(`[create-payment] Transaction FedaPay créée ID: ${fedapayId}`);

    // 2. Génération du token de paiement
    const tokenRes = await fetch(`${fedapayBaseUrl}/v1/transactions/${fedapayId}/token`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${fedapayKey}`, 
        'Content-Type': 'application/json' 
      },
    })
    
    const tokenData = await tokenRes.json()
    const checkoutUrl = tokenData?.token?.url || tokenData?.url

    if (!checkoutUrl) {
      console.error("[create-payment] Impossible de générer le lien de paiement:", tokenData);
      throw new Error("Erreur lors de la génération du lien de paiement");
    }

    // 3. Enregistrement en base de données
    console.log("[create-payment] Enregistrement en base de données...");
    const { error: insertError } = await supabase.from('payments').insert({
      user_id: user.id,
      tournament_id,
      tournament_name,
      amount: String(amount),
      status: 'en attente',
      validation_code: validationCode,
      fedapay_transaction_id: String(fedapayId)
    })

    if (insertError) {
      console.error("[create-payment] Erreur insertion Supabase:", insertError);
      throw new Error("Erreur lors de l'enregistrement de l'inscription");
    }

    console.log("[create-payment] Succès ! Redirection vers:", checkoutUrl);

    return new Response(JSON.stringify({ url: checkoutUrl }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error("[create-payment] ERREUR CRITIQUE:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})