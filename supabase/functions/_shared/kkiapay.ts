import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};
export const adminClient = () => createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

export function credentials() {
  const publicKey = Deno.env.get('KKIAPAY_PUBLIC_KEY');
  const privateKey = Deno.env.get('KKIAPAY_PRIVATE_KEY');
  const secret = Deno.env.get('KKIAPAY_SECRET_KEY');
  if (!publicKey || !privateKey || !secret) throw new Error('Configuration KKiaPay incomplète. Contacte le support, ne paie pas à nouveau.');
  return { publicKey, privateKey, secret };
}

export async function verifyTransaction(transactionId: string) {
  const { publicKey, privateKey, secret } = credentials();
  const response = await fetch('https://api.kkiapay.me/api/v1/transactions/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': publicKey, 'x-private-key': privateKey, 'x-secret-key': secret },
    body: JSON.stringify({ transactionId }),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error('Vérification KKiaPay indisponible. Réessaie la vérification sans effectuer un autre paiement.');
  const body = await response.json();
  const tx = body.transaction ?? body;
  if (String(tx.status).toUpperCase() !== 'SUCCESS') throw new Error('KKiaPay ne confirme pas encore le succès. Ne paie pas à nouveau et conserve ton reçu.');
  if (!Number.isFinite(Number(tx.amount)) || Number(tx.amount) <= 0) throw new Error('Montant KKiaPay invalide.');
  return tx;
}

// Ne lire la référence que dans la réponse vérifiée du prestataire, jamais dans le webhook brut.
export function attemptFromTransaction(tx: any): string | null {
  const candidates: string[] = [];
  const inspect = (value: any, depth = 0) => {
    if (!value || depth > 4) return;
    if (typeof value === 'string') {
      try { inspect(JSON.parse(value), depth + 1); } catch { /* Champ non JSON. */ }
      if (value.includes('paymentAttemptId=')) {
        try { const ref = new URL(value).searchParams.get('paymentAttemptId'); if (ref) candidates.push(ref); } catch { /* URL non valide. */ }
      }
    } else if (typeof value === 'object') {
      if (typeof value.paymentAttemptId === 'string') candidates.push(value.paymentAttemptId);
      Object.values(value).forEach(item => inspect(item, depth + 1));
    }
  };
  inspect(tx);
  const valid = [...new Set(candidates.filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)))];
  return valid.length === 1 ? valid[0] : null;
}

export async function settleTransaction(db: any, transactionId: string, tx: any, fallbackAttemptId?: string | null) {
  const extracted = attemptFromTransaction(tx);
  const attemptId = extracted ?? (fallbackAttemptId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fallbackAttemptId) ? fallbackAttemptId : null);
  const { data, error } = await db.rpc('settle_kkiapay_payment', {
    p_transaction_id: transactionId, p_attempt_id: attemptId, p_amount: Number(tx.amount),
  });
  if (error) throw new Error('Enregistrement temporairement indisponible. Réessaie la vérification, pas le paiement.');
  return data;
}

export function transactionIdFrom(body: any): string | null {
  const value = body?.transactionId ?? body?.transaction_id ?? body?.data?.transactionId ?? body?.data?.transaction_id ?? body?.transaction?.id ?? body?.id;
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{1,160}$/.test(value) ? value : null;
}
