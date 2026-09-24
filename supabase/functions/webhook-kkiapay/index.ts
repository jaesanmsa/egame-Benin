import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { corsHeaders, adminClient, verifyTransaction, settleTransaction, transactionIdFrom } from '../_shared/kkiapay.ts'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

/**
 * Webhook KKiaPay : reçoit la notification, REVÉRIFIE la transaction auprès de
 * KKiaPay avec les trois clés serveur, puis règle via le RPC idempotent
 * settle_kkiapay_payment. Aucune décision basée sur le payload brut du webhook.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const body = await req.json()
    const transactionId = transactionIdFrom(body)
    if (!transactionId) {
      console.error('[webhook-kkiapay] Payload sans identifiant de transaction:', JSON.stringify(body).slice(0, 500))
      return json({ error: 'Identifiant manquant' }, 400)
    }

    console.log(`[webhook-kkiapay] Notification reçue pour #${transactionId} — vérification API...`)

    // Source de vérité : l'API KKiaPay. En cas d'échec (API indisponible ou
    // transaction pas encore SUCCESS), on répond en erreur pour que KKiaPay retente.
    const tx = await verifyTransaction(transactionId)

    const db = adminClient()
    const result = await settleTransaction(db, transactionId, tx)

    if (!result?.attributed) {
      // Orphelin ou double paiement : tracé côté base avec la raison, jamais compté comme participant.
      console.error(`[webhook-kkiapay] Transaction ${transactionId} non attribuée : ${result?.reason}`)
      return json({ success: true, attributed: false, reason: result?.reason })
    }

    console.log(`[webhook-kkiapay] Transaction ${transactionId} réglée (duplicate=${!!result.duplicate}).`)
    return json({ success: true, attributed: true, duplicate: !!result.duplicate })
  } catch (error) {
    console.error('[webhook-kkiapay] Erreur:', error.message)
    return json({ error: error.message }, 502)
  }
})
