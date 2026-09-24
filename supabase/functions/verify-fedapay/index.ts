import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { verifyTransaction, settleTransaction } from '../_shared/fedapay.ts'
import { notifyPaymentConfirmed } from '../_shared/push.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

/**
 * Vérification SERVEUR d'une transaction FedaPay après le retour du joueur.
 * Le navigateur ne décide jamais seul : seule l'API FedaPay (clé secrète serveur)
 * fait foi, et le règlement passe par le RPC idempotent settle_fedapay_payment.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Non authentifié' }, 401)

  try {
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) return json({ error: 'Session invalide' }, 401)

    const body = await req.json().catch(() => ({}))
    const transactionId = String(body?.transaction_id ?? body?.transactionId ?? '').trim()
    const fallbackAttemptId = typeof body?.paymentAttemptId === 'string' && body.paymentAttemptId ? body.paymentAttemptId : null
    if (!transactionId) return json({ error: 'Identifiant de transaction manquant' }, 400)

    console.log(`[verify-fedapay] Vérification de la transaction ${transactionId} pour ${user.id}...`)

    // Source de vérité : l'API FedaPay.
    const tx = await verifyTransaction(transactionId)

    // Règlement idempotent : transaction → tentative exacte → paiement + ticket.
    const db = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    const result = await settleTransaction(db, transactionId, tx, fallbackAttemptId)

    if (!result?.attributed) {
      console.error(`[verify-fedapay] Transaction ${transactionId} non attribuée : ${result?.reason}`)
      return json({
        error: result?.reason ?? 'Paiement non attribué. Contacte le support avec ton reçu — ne paie pas à nouveau.'
      })
    }

    if (!result.duplicate) {
      const { data: row } = await db
        .from('payments')
        .select('tournament_name')
        .eq('id', result.payment_id)
        .maybeSingle()
      await notifyPaymentConfirmed(result.user_id, row?.tournament_name)
    }

    console.log(`[verify-fedapay] Transaction ${transactionId} réglée pour ${user.id} — ticket ${result.validation_code}.`)
    return json({
      success: true,
      validation_code: result.validation_code,
      tournament_id: result.tournament_id,
      already_processed: !!result.duplicate
    })
  } catch (error) {
    console.error('[verify-fedapay] Erreur:', error.message)
    return json({ error: error.message })
  }
})
