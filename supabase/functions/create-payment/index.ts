import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gestion du pré-vol CORS
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    console.log("[create-payment] Démarrage de la requête...");

    // 1. Vérification de l'authentification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Authentification manquante')

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      console.error("[create-payment] Erreur Auth:", userError);
      throw new Error('Session utilisateur invalide');
    }

    // 2. Récupération des données du tournoi
    const { tournament_id, tournament_name, amount } = await req.json()
    console.log(`[create-payment] Inscription de ${user.email} pour ${tournament_name} (${amount} FCFA)`);

    // 3. Configuration FedaPay
    const fedapayKey = Deno.env.get('FEDAPAY_SECRET_KEY')
    const fedapayEnv = Deno.env.get('FEDAPAY_ENV') || 'sandbox'
    const fedapayBaseUrl = fedapayEnv === 'live' ? 'https://api.fedapay.com' : 'https://sandbox-api.fedapay.com'

    if (!fedapayKey) {
      console.error("[create-payment] Erreur: FEDAPAY_SECRET_KEY non configurée");
      throw new Error("Configuration serveur incomplète");
    }

    // 4. Création de la transaction chez FedaPay
    console.log("[create-payment] Création transaction FedaPay...");
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
          lastname: user.user_metadata?.full_name?.split(' ')[1] || 'eGame'
        },
      }),
    })

    const createData = await createRes.json()
    if (!createRes.ok) {
      console.error("[create-payment] Erreur API FedaPay:", createData);
      throw new Error(createData.message || "Erreur FedaPay");
    }

    // Extraction de l'ID (FedaPay peut renvoyer l'objet dans 'v1.transaction' ou directement)
    const fedapayId = createData?.v1?.transaction?.id || createData?.transaction?.id || createData?.id;
    if (!fedapayId) throw new Error("ID de transaction FedaPay introuvable");

    // 5. Génération du token de paiement (URL de redirection)
    console.log(`[create-payment] Génération token pour ID: ${fedapayId}`);
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
      console.error("[create-payment] Erreur Token FedaPay:", tokenData);
      throw new Error("Impossible de générer le lien de paiement");
    }

    // 6. Enregistrement dans la base de données Supabase
    const validationCode = `EGB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    console.log("[create-payment] Enregistrement Supabase...");
    
    const { error: insertError } = await supabase.from('payments').insert({
      user_id: user.id,
      tournament_id,
      tournament_name,
      amount: String(amount),
      status: 'en attente', // Statut en minuscules comme demandé
      validation_code: validationCode,
      fedapay_transaction_id: String(fedapayId)
    })

    if (insertError) {
      console.error("[create-payment] Erreur SQL Supabase:", insertError);
      throw new Error("Erreur lors de l'enregistrement local");
    }

    console.log("[create-payment] Succès ! Redirection vers FedaPay.");

    return new Response(JSON.stringify({ url: checkoutUrl }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("[create-payment] ERREUR:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, // On renvoie 400 pour que le client puisse lire l'erreur
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})