import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { corsHeaders, adminClient, credentials, verifyTransaction, settleTransaction } from '../_shared/kkiapay.ts'
import { notifyPaymentConfirmed } from '../_shared/push.ts'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

/**
 * Point d'entrée serveur unique pour KKiaPay :
 *  - action=configuration : fournit la clé publique au site pour ouvrir le widget.
 *  - sinon : vérifie une transaction auprès de KKiaPay (3 clés) et la règle
 *    via le RPC idempotent settle_kkiapay_payment. Le navigateur ne décide jamais
 *    seul qu'un paiement est réussi.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Non authentifié' }, 401)

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    })
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) return json({ error: 'Session invalide' }, 401)

    const body = await req.json().catch(() => ({}))

    // 1) Configuration du widget : la clé publique provient du serveur.
    if (body?.action === 'configuration') {
      const { publicKey } = credentials()
      console.log('[verify-kkiapay] Configuration demandée par', user.id)
      return json({ publicKey })
    }

    // 2) Vérification d'une transaction après le retour du joueur.
    const transactionId = String(body?.transactionId ?? '').trim()
    const fallbackAttemptId = typeof body?.paymentAttemptId === 'string' && body.paymentAttemptId ? body.paymentAttemptId : null
    if (!transactionId) return json({ error: 'Identifiant de transaction manquant' }, 400)

    console.log(`[verify-kkiapay] Vérification de #${transactionId} pour ${user.id}...`)

    // Source de vérité : l'API KKiaPay, avec les trois clés serveur.
    const tx = await verifyTransaction(transactionId)

    // Règlement idempotent : transaction → tentative exacte → paiement + ticket.
    const db = adminClient()
    const result = await settleTransaction(db, transactionId, tx, fallbackAttemptId)

    if (!result?.attributed) {
      console.error(`[verify-kkiapay] Transaction ${transactionId} non attribuée : ${result?.reason}`)
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

    console.log(`[verify-kkiapay] Transaction ${transactionId} réglée pour ${user.id} — ticket ${result.validation_code}.`)
    return json({
      validation_code: result.validation_code,
      tournament_id: result.tournament_id,
      duplicate: !!result.duplicate
    })
  } catch (error) {
    console.error('[verify-kkiapay] Erreur:', error.message)
    // Messages du helper : explicites pour le joueur, sans l'inviter à re payer.
    return json({ error: error.message })
  }
})
