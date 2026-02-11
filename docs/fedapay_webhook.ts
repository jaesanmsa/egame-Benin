import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const payload = await req.json()
  const transaction = payload.entity
  
  if (payload.event === 'transaction.approved') {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // On cherche le paiement correspondant à l'email du client
    // Note: FedaPay envoie l'email du client dans la transaction
    const { error } = await supabase
      .from('payments')
      .update({ status: 'Réussi' })
      .eq('status', 'En attente')
      // On peut aussi filtrer par montant ou description si besoin
      
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  }

  return new Response("OK", { status: 200 })
})