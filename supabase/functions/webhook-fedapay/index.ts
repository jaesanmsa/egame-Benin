import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { genCode, claimPending, insertPayment, failPending, creditPoints, parseCallbackUrl } from '../_shared/payment.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders })
  }

  const rawBody = await req.text()
  const secret = Deno.env.get('FEDAPAY_WEBHOOK_SECRET') ?? Deno.env.get('FEDAPAY_SECRET_KEY')

  if (!secret) {
    console.error('[webhook-fedapay] FEDAPAY_SECRET_KEY manquant — configurer le secret Supabase.')
    return new Response(JSON.stringify({ error: 'Secret manquant' }), { status: 503, headers: corsHeaders })
  }

  // Vérification de la signature : X-FEDAPAY-SIGNATURE = HMAC-SHA256(rawBody, secret)
  const provided = (req.headers.get('x-fedapay-signature') ?? '').replace(/^sha256=/i, '').toLowerCase()
  const expected = await hmacSha256Hex(secret, rawBody)
  if (!provided || provided !== expected) {
    console.error('[webhook-fedapay] Signature invalide ou absente.')
    return new Response(JSON.stringify({ error: 'Signature invalide' }), { status: 401, headers: corsHeaders })
  }

  try {
    const body = JSON.parse(rawBody)
    const eventName: string = body?.event?.name ?? body?.name ?? ''
    const entity = body?.event?.entity ?? body?.entity ?? body

    console.log(`[webhook-fedapay] Événement reçu: ${eventName} (transaction #${entity?.id})`)

    if (!eventName.startsWith('transaction.')) {
      return new Response(JSON.stringify({ success: true, ignored: eventName }), { headers: corsHeaders })
    }

    const metadata = entity?.metadata ?? entity?.custom_metadata ?? {}
    const fromCallback = parseCallbackUrl(entity?.callback_url)
    const tournamentId: string | undefined = metadata.tournamentId ?? fromCallback.tournamentId
    const tournamentName: string | undefined = metadata.tournamentName ?? fromCallback.tournamentName
    const userId: string | undefined = metadata.userId
    const transactionId = String(entity?.id ?? '')
    const amount = entity?.amount ?? fromCallback.amount ?? '0'

    if (!transactionId) {
      console.error('[webhook-fedapay] Transaction sans identifiant.')
      return new Response(JSON.stringify({ error: 'Transaction sans identifiant' }), { status: 400, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Paiement refusé / annulé : on marque l'inscription en attente comme échouée.
    if (eventName !== 'transaction.approved') {
      await failPending(supabase, { userId, tournamentId, gateway: 'fedapay' })
      console.log(`[webhook-fedapay] Transaction ${transactionId} non approuvée (${eventName}).`)
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders })
    }

    // Déjà enregistrée (page de retour ou webhook précédent) ?
    const { data: existing } = await supabase
      .from('payments')
      .select('id, validation_code')
      .eq('fedapay_transaction_id', transactionId)
      .maybeSingle()
    if (existing) {
      console.log(`[webhook-fedapay] Transaction ${transactionId} déjà enregistrée.`)
      return new Response(JSON.stringify({ success: true, duplicate: true }), { headers: corsHeaders })
    }

    const code = genCode()
    let row: any = null

    // 1) Réclamer la ligne "En attente" créée à l'ouverture du widget.
    if (userId && tournamentId) {
      row = await claimPending(supabase, {
        userId, tournamentId, gateway: 'fedapay',
        transactionId, amount, tournamentName, code
      })
      if (row) console.log(`[webhook-fedapay] Ligne en attente réclamée (${row.id}).`)
    }

    // 2) Sinon, insertion directe (ex: navigateur fermé, métadonnées incomplètes).
    if (!row) {
      const result = await insertPayment(supabase, {
        userId: userId ?? null,
        tournamentId: tournamentId ?? 'inconnu',
        tournamentName: tournamentName ?? 'Non attribué (webhook FedaPay)',
        amount, transactionId, gateway: 'fedapay', code
      })
      row = result.row
      if (!result.duplicate) {
        await creditPoints(supabase, userId)
        console.log(`[webhook-fedapay] Paiement inséré via webhook. Code: ${row?.validation_code}`)
      }
    } else {
      await creditPoints(supabase, userId)
    }

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders })
  } catch (error) {
    console.error('[webhook-fedapay] Erreur:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
  }
})
