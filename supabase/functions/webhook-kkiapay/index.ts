import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { genCode, insertPayment, creditPoints, parseCallbackUrl, findCallbackUrl } from '../_shared/payment.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/** Extrait l'identifiant de transaction, quel que soit le format du webhook KKiaPay. */
function extractTransactionId(body: any): string | null {
  const candidates = [
    body?.transactionId,
    body?.transaction_id,
    body?.id,
    body?.data?.transactionId,
    body?.data?.transaction_id,
    body?.data?.id,
    body?.event?.transactionId,
    body?.transaction?.transactionId,
    body?.transaction?.id
  ]
  for (const c of candidates) {
    if (c && (typeof c === 'string' || typeof c === 'number')) return String(c)
  }
  return null
}

function digitsOnly(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value).replace(/\D/g, '') : ''
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders })
  }

  const KKIAPAY_PRIVATE_KEY = Deno.env.get('KKIAPAY_PRIVATE_KEY')
  if (!KKIAPAY_PRIVATE_KEY) {
    console.error('[webhook-kkiapay] KKIAPAY_PRIVATE_KEY manquant — configurer le secret Supabase.')
    // 503 pour que KKiaPay retente après configuration.
    return new Response(JSON.stringify({ error: 'Secret manquant' }), { status: 503, headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const transactionId = extractTransactionId(body)

    if (!transactionId) {
      console.error('[webhook-kkiapay] Payload sans identifiant de transaction:', JSON.stringify(body).slice(0, 500))
      return new Response(JSON.stringify({ error: 'Identifiant manquant' }), { status: 400, headers: corsHeaders })
    }

    console.log(`[webhook-kkiapay] Notification reçue pour #${transactionId} — vérification API...`)

    // Revérification serveur auprès de KKiaPay (source de vérité).
    const response = await fetch(`https://api.kkiapay.me/api/v1/transactions/status/${transactionId}`, {
      method: 'POST',
      headers: {
        'x-api-key': KKIAPAY_PRIVATE_KEY,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error(`[webhook-kkiapay] API KKiaPay a répondu ${response.status}.`)
      return new Response(JSON.stringify({ error: 'Vérification impossible' }), { status: 502, headers: corsHeaders })
    }

    const apiData = await response.json()
    const tx = apiData?.transaction ?? apiData
    const status = String(tx?.status ?? '').toUpperCase()

    if (status !== 'SUCCESS') {
      console.log(`[webhook-kkiapay] Transaction ${transactionId} statut=${status} — ignorée.`)
      return new Response(JSON.stringify({ success: true, ignored: status }), { headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Déjà enregistrée ?
    const { data: existing } = await supabase
      .from('payments')
      .select('id, validation_code')
      .eq('fedapay_transaction_id', transactionId)
      .maybeSingle()
    if (existing) {
      console.log(`[webhook-kkiapay] Transaction ${transactionId} déjà enregistrée.`)
      return new Response(JSON.stringify({ success: true, duplicate: true }), { headers: corsHeaders })
    }

    const amount = String(tx?.amount ?? '0')
    const phone = digitsOnly(tx?.phone)
    const callbackInfo = parseCallbackUrl(findCallbackUrl(tx))

    const code = genCode()
    let attributed = false

    // 1) Attribution exacte via l'URL de callback (contient tournamentId généré au clic).
    if (callbackInfo.tournamentId) {
      const { data: pending } = await supabase
        .from('payments')
        .select('id, user_id, validation_code')
        .eq('tournament_id', callbackInfo.tournamentId)
        .eq('gateway', 'kkiapay')
        .is('fedapay_transaction_id', null)
        .is('validation_code', null)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (pending) {
        const { data: claimed, error } = await supabase
          .from('payments')
          .update({
            status: 'Réussi',
            validation_code: code,
            fedapay_transaction_id: transactionId,
            amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', pending.id)
          .is('validation_code', null)
          .select()
          .maybeSingle()

        if (!error && claimed) {
          console.log(`[webhook-kkiapay] Ligne en attente réclamée via callback (${claimed.id}).`)
          await creditPoints(supabase, claimed.user_id)
          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders })
        }
      }
      if (!pending) {
        // Transaction validée sans ligne d'attente (ex: navigateur fermé avant insertion ?) : insertion directe.
        const result = await insertPayment(supabase, {
          userId: null,
          tournamentId: callbackInfo.tournamentId,
          tournamentName: callbackInfo.tournamentName ?? 'Tournoi (webhook)',
          amount, transactionId, gateway: 'kkiapay', code
        })
        if (!result.duplicate) {
          console.log(`[webhook-kkiapay] Paiement inséré via callback. Code: ${result.row?.validation_code}`)
        }
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders })
      }
      attributed = true
    }

    // 2) Attribution via ligne "En attente" : même montant, téléphone du profil si possible.
    const { data: pendings } = await supabase
      .from('payments')
      .select('id, user_id')
      .eq('gateway', 'kkiapay')
      .eq('amount', amount)
      .is('fedapay_transaction_id', null)
      .is('validation_code', null)
      .order('created_at', { ascending: true })
      .limit(10)

    if (pendings && pendings.length > 0) {
      let target: any = null

      if (phone) {
        const userIds = pendings.map((p: any) => p.user_id)
        const { data: profileList } = await supabase
          .from('profiles')
          .select('id, phone')
          .in('id', userIds)
        const matchingUserId = (profileList ?? []).find((pr: any) => {
          const dbPhone = digitsOnly(pr.phone)
          return dbPhone && phone.endsWith(dbPhone.slice(-8))
        })?.id
        target = pendings.find((p: any) => p.user_id === matchingUserId) ?? null
      }

      if (!target) target = pendings[0] // plus ancienne ligne en attente pour ce montant

      const { data: claimed, error } = await supabase
        .from('payments')
        .update({
          status: 'Réussi',
          validation_code: code,
          fedapay_transaction_id: transactionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', target.id)
        .is('validation_code', null)
        .select()
        .maybeSingle()

      if (!error && claimed) {
        console.log(`[webhook-kkiapay] Ligne en attente réclamée (montant${phone ? '/téléphone' : ''}) ${claimed.id}.`)
        await creditPoints(supabase, claimed.user_id)
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders })
      }
    }

    // 3) Aucune correspondance : on enregistre quand même la transaction pour rapprochement admin.
    if (!attributed) {
      await insertPayment(supabase, {
        userId: null,
        tournamentId: 'inconnu',
        tournamentName: `Non attribué — vérifier #${transactionId} sur KKiaPay`,
        amount, transactionId, gateway: 'kkiapay', code
      })
      console.log(`[webhook-kkiapay] Paiement orphelin enregistré #${transactionId} (rapprochement admin nécessaire).`)
    }

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders })
  } catch (error) {
    console.error('[webhook-kkiapay] Erreur:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
  }
})
