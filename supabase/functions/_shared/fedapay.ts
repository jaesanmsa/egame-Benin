// Helpers partagés pour FedaPay : vérification serveur + règlement exact par tentative.
// Import : import { verifyTransaction, settleTransaction, attemptFromTransaction } from '../_shared/fedapay.ts'

export const FEDAPAY_API = 'https://api.fedapay.com/v1';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function fedapaySecret(): string {
  const secret = Deno.env.get('FEDAPAY_SECRET_KEY');
  if (!secret) throw new Error('Configuration FedaPay incomplète. Contacte le support, ne paie pas à nouveau.');
  return secret;
}

/** Vérifie la transaction auprès de FedaPay (source de vérité). Statut attendu : approved. */
export async function verifyTransaction(transactionId: string) {
  const response = await fetch(`${FEDAPAY_API}/transactions/${encodeURIComponent(transactionId)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${fedapaySecret()}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) {
    throw new Error('Vérification FedaPay indisponible. Réessaie la vérification sans effectuer un autre paiement.');
  }
  const body = await response.json();
  const tx = body?.v1?.transaction ?? body?.transaction ?? body;
  const status = String(tx?.status ?? '').toLowerCase();
  if (status !== 'approved') {
    throw new Error('FedaPay ne confirme pas encore le succès. Ne paie pas à nouveau et conserve ton reçu.');
  }
  const amount = Number(tx?.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Montant FedaPay invalide.');
  return tx;
}

// La référence de tentative n'est lue que dans la réponse vérifiée du prestataire.
export function attemptFromTransaction(tx: any): string | null {
  const candidates: string[] = [];
  const inspect = (value: any, depth = 0) => {
    if (!value || depth > 4) return;
    if (typeof value === 'string') {
      if (value.includes('paymentAttemptId=')) {
        try {
          const ref = new URL(value).searchParams.get('paymentAttemptId');
          if (ref) candidates.push(ref);
        } catch { /* URL non valide. */ }
      }
    } else if (typeof value === 'object') {
      if (typeof value.paymentAttemptId === 'string') candidates.push(value.paymentAttemptId);
      Object.values(value).forEach((item) => inspect(item, depth + 1));
    }
  };
  inspect(tx);
  const valid = [...new Set(candidates.filter((id) => UUID_RE.test(id)))];
  return valid.length === 1 ? valid[0] : null;
}

/** Règle la transaction via le RPC idempotent settle_fedapay_payment. */
export async function settleTransaction(db: any, transactionId: string, tx: any, fallbackAttemptId?: string | null) {
  const extracted = attemptFromTransaction(tx);
  const attemptId = extracted ?? (fallbackAttemptId && UUID_RE.test(fallbackAttemptId) ? fallbackAttemptId : null);
  const { data, error } = await db.rpc('settle_fedapay_payment', {
    p_transaction_id: transactionId, p_attempt_id: attemptId, p_amount: Number(tx.amount)
  });
  if (error) throw new Error('Enregistrement temporairement indisponible. Réessaie la vérification, pas le paiement.');
  return data;
}

export function transactionIdFrom(body: any): string | null {
  const entity = body?.event?.entity ?? body?.entity ?? body;
  const value = entity?.id ?? body?.id;
  return value != null && /^[a-zA-Z0-9_-]{1,160}$/.test(String(value)) ? String(value) : null;
}
