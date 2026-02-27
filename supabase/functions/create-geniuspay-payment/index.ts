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

    console.log(`[create-geniuspay-payment] Initialisation paiement Live pour ${user.email}`);

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
        customer_firstname: user.user_metadata?.full_name?.split(' ')[0] || 'Joueur',
        callback_url: `https://egamebenin.com/payment-success`,
        // L'URL du webhook est configurée dans le dashboard GeniusPay, 
        // mais on peut parfois la passer ici selon l'API
        metadata: { 
          tournament_id, 
          user_id: user.id 
        }
      })
    })

    const data = await response.json()
    if (!response.ok) {
      console.error("[create-geniuspay-payment] Erreur API:", data);
      throw new Error(data.message || "Erreur GeniusPay");
    }

    // L'ID de transaction renvoyé par GeniusPay est crucial pour le webhook
    const transactionId = data.id || data.transaction_id;
    const validationCode = `EGB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    
    await supabase.from('payments').insert({
      user_id: user.id,
      tournament_id,
      tournament_name,
      amount: String(amount),
      status: 'en attente',
      validation_code: validationCode,
      geniuspay_transaction_id: String(transactionId)
    })

    return new Response(JSON.stringify({ url: data.payment_url || data.link }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("[create-geniuspay-payment] Erreur:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})