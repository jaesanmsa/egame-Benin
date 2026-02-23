import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gestion du CORS
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    console.log("[create-payment] Nouvelle tentative de paiement...");

    // 1. Vérification de l'utilisateur
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('En-tête d\'autorisation manquant');

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) throw new Error('Utilisateur non identifié ou session expirée');

    // 2. Récupération des données du corps de la requête
    const body = await req.json()
    const { tournament_id, tournament_name, amount } = body
    
    if (!tournament_id || !amount) throw new Error('Données du tournoi manquantes (ID ou Montant)');

    const validationCode = `EGB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    // 3. Configuration FedaPay
    const fedapayKey = Deno.env.get('FEDAPAY_SECRET_KEY')
    if (!fedapayKey) throw new Error('Clé secrète FEDAPAY_SECRET_KEY manquante dans les secrets Supabase');

    // On force le sandbox si on n'est pas sûr, pour éviter les erreurs de clé live
    const isLive = Deno.env.get('FEDAPAY_ENV') === 'live'
    const fedapayBaseUrl = isLive ? 'https://api.fedapay.com' : 'https://sandbox-api.fedapay.com'

    console.log(`[create-payment] Appel FedaPay (${isLive ? 'LIVE' : 'SANDBOX'})...`);

    // 4. Création de la transaction sur FedaPay
    const createRes = await fetch(`${fedapayBaseUrl}/v1/transactions`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${fedapayKey}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        amount: parseInt(String(amount)),
        description: `Tournoi: ${tournament_name} | Code: ${validationCode}`,
        currency: { iso: 'XOF' },
        callback_url: `https://egamebenin.com/payment-success`,
        customer: { 
          email: user.email,
          firstname: user.user_metadata?.full_name?.split(' ')[0] || 'Joueur',
          lastname: user.user_metadata?.full_name?.split(' ')[1] || 'eGame'
        },
      }),
    })

    if (!createRes.ok) {
      const errorData = await createRes.json();
      console.error("[create-payment] Erreur FedaPay API:", errorData);
      throw new Error(`FedaPay a refusé la transaction: ${errorData.message || 'Erreur inconnue'}`);
    }

    const createData = await createRes.json()
    const fedapayId = createData?.v1?.transaction?.id || createData?.transaction?.id || createData?.id

    if (!fedapayId) throw new Error("FedaPay n'a pas renvoyé d'ID de transaction");

    // 5. Génération du lien de paiement (Token)
    console.log(`[create-payment] Génération du token pour l'ID: ${fedapayId}`);
    const tokenRes = await fetch(`${fedapayBaseUrl}/v1/transactions/${fedapayId}/token`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${fedapayKey}`, 
        'Content-Type': 'application/json' 
      },
    })

    if (!tokenRes.ok) throw new Error("Impossible de générer le lien de paiement FedaPay");
    
    const tokenData = await tokenRes.json()
    const checkoutUrl = tokenData?.token?.url || tokenData?.url

    // 6. Enregistrement final dans Supabase
    console.log("[create-payment] Enregistrement dans la table payments...");
    const { error: insertError } = await supabase.from('payments').insert({
      user_id: user.id,
      tournament_id,
      tournament_name,
      amount: String(amount),
      status: 'En attente',
      validation_code: validationCode,
      fedapay_transaction_id: String(fedapayId)
    })

    if (insertError) {
      console.error("[create-payment] Erreur insertion Supabase:", insertError);
      throw new Error(`Erreur base de données: ${insertError.message}`);
    }

    console.log("[create-payment] Succès ! Redirection vers:", checkoutUrl);

    return new Response(JSON.stringify({ url: checkoutUrl }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("[create-payment] ERREUR GLOBALE:", error.message);
    return new Response(JSON.stringify({ 
      error: error.message,
      tip: "Vérifie tes logs dans l'onglet 'Edge Functions' de Supabase pour plus de détails."
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})