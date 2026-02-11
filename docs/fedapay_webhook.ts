/* 
  INSTRUCTIONS POUR L'AUTOMATISATION :
  1. Dans Supabase, va dans 'Edge Functions' et crée une fonction nommée 'fedapay-webhook'.
  2. Colle le code ci-dessous.
  3. Dans ton dashboard FedaPay, va dans 'Webhooks' et ajoute l'URL de ta fonction Supabase.
  4. Sélectionne l'événement 'transaction.approved'.
*/

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const payload = await req.json()
  const transaction = payload.entity
  
  // Si la transaction est approuvée
  if (payload.event === 'transaction.approved') {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // On met à jour le statut dans la base de données
    // Note: Il faut que FedaPay envoie l'ID du paiement dans les métadonnées
    const { error } = await supabase
      .from('payments')
      .update({ status: 'Réussi' })
      .eq('tournament_name', transaction.description) // Exemple de lien
      
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  }

  return new Response("Event ignored", { status: 200 })
})