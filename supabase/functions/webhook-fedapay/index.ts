import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { verifyTransaction, settleTransaction, transactionIdFrom } from '../_shared/fedapay.ts'
import { failPending } from '../_shared/payment.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

async function hmacSha256Hex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Webhook FedaPay : signature vérifiée (HMAC-SHA256), puis REVÉRIFICATION de la
 * transaction auprès de l'API FedaPay, puis règlement idempotent par le RPC
 * settle_fedapay_payment. Aucune décision basée sur le seul payload reçu.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const rawBody = await req.text()
  const secret = Deno.env.get('FEDAPAY_WEBHOOK_SECRET') ?? Deno.env.get('FEDAPAY_SECRET_KEY')

  if (!secret) {
    console.error('[webhook-fedapay] FEDAPAY_SECRET_KEY manquant — configurer le secret Supabase.')
    return json({ error: 'Secret manquant' }, 503)
  }

  // Vérification de la signature : X-FEDAPAY-SIGNATURE = HMAC-SHA256(rawBody, secret)
  const provided = (req.headers.get('x-fedapay-signature') ?? '').replace(/^sha256=/i, '').toLowerCase()
  const expected = await hmacSha256Hex(secret, rawBody)
  if (!provided || provided !== expected) {
    console.error('[webhook-fedapay] Signature invalide ou absente.')
    return json({ error: 'Signature invalide' }, 401)
  }

  try {
    const body = JSON.parse(rawBody)
    const eventName: string = body?.event?.name ?? body?.name ?? ''
    const entity = body?.event?.entity ?? body?.entity ?? body
    const transactionId = transactionIdFrom(body)

    console.log('[webhook-fedapay] Événement reçu: ' + eventName + ' (transaction #' + transactionId + ')')

    if (!transactionId) {
      console.error('[webhook-fedapay] Transaction sans identifiant.')
      return json({ error: 'Transaction sans identifiant' }, 400)
    }

    if (!eventName.startsWith('transaction.')) {
      return json({ success: true, ignored: eventName })
    }

    const db = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Paiement refusé / annulé : la tentative en attente est libérée pour le joueur.
    if (eventName !== 'transaction.approved') {
      const metadata = entity?.metadata ?? entity?.custom_metadata ?? {}
      await failPending(db, { userId: metadata.userId, tournamentId: metadata.tournamentId, gateway: 'fedapay' })
      console.log('[webhook-fedapay] Transaction ' + transactionId + ' non approuvée (' + eventName + ').')
      return json({ success: true })
    }

    // Source de vérité : l'API FedaPay. En cas d'échec, on répond en erreur
    // pour que FedaPay retente la notification.
    const tx = await verifyTransaction(transactionId)
    const result = await settleTransaction(db, transactionId, tx)

    if (!result?.attributed) {
      // Orphelin ou double paiement : tracé côté base avec la raison, jamais compté comme participant.
      console.error('[webhook-fedapay] Transaction ' + transactionId + ' non attribuée : ' + result?.reason)
      return json({ success: true, attributed: false, reason: result?.reason })
    }

    console.log('[webhook-fedapay] Transaction ' + transactionId + ' réglée (duplicate=' + (!!result.duplicate) + ').')
    return json({ success: true, attributed: true, duplicate: !!result.duplicate })
  } catch (error) {
    console.error('[webhook-fedapay] Erreur:', error.message)
    return json({ error: error.message }, 502)
  }
})
