// Helpers partagés pour l'enregistrement idempotent des paiements.
// Import : import { genCode, claimPending, insertPayment, creditPoints } from '../_shared/payment.ts'

import { notifyPaymentConfirmed } from './push.ts';

export function genCode(): string {
  return `EGB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

/**
 * Réclame une ligne "En attente" créée avant l'ouverture du widget.
 * Condition atomique (validation_code IS NULL) : si un concurrent (webhook ou
 * page de retour) l'a déjà validée, l'update touche 0 ligne et on renvoie null.
 */
export async function claimPending(
  supabase: any,
  params: {
    userId: string;
    tournamentId: string;
    gateway: string;
    transactionId: string;
    amount: string | number;
    tournamentName?: string | null;
    code: string;
  }
): Promise<any | null> {
  const { data: pending } = await supabase
    .from('payments')
    .select('id')
    .eq('user_id', params.userId)
    .eq('tournament_id', params.tournamentId)
    .eq('gateway', params.gateway)
    .is('fedapay_transaction_id', null)
    .is('validation_code', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!pending) return null;

  const updates: Record<string, any> = {
    status: 'Réussi',
    validation_code: params.code,
    fedapay_transaction_id: params.transactionId,
    amount: String(params.amount ?? '0'),
    updated_at: new Date().toISOString()
  };
  if (params.tournamentName) updates.tournament_name = params.tournamentName;

  const { data: claimed, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', pending.id)
    .is('validation_code', null)
    .select()
    .maybeSingle();

  if (error || !claimed) return null;
  await notifyPaymentConfirmed(claimed.user_id, claimed.tournament_name);
  return claimed;
}

/** Insère un paiement validé (retourne null si déjà enregistré — doublon transaction). */
export async function insertPayment(
  supabase: any,
  params: {
    userId?: string | null;
    tournamentId: string;
    tournamentName: string;
    amount: string | number;
    transactionId: string;
    gateway: string;
    code: string;
  }
): Promise<{ row: any | null; duplicate: boolean }> {
  const { data: existing } = await supabase
    .from('payments')
    .select('id, validation_code')
    .eq('fedapay_transaction_id', params.transactionId)
    .maybeSingle();
  if (existing) return { row: existing, duplicate: true };

  const { data: row, error } = await supabase
    .from('payments')
    .insert({
      user_id: params.userId ?? null,
      tournament_id: params.tournamentId,
      tournament_name: params.tournamentName,
      amount: String(params.amount ?? '0'),
      status: 'Réussi',
      validation_code: params.code,
      fedapay_transaction_id: params.transactionId,
      gateway: params.gateway
    })
    .select()
    .maybeSingle();

  if (error) {
    // Course concurrente : un autre processus vient d'insérer la même transaction.
    if (error.code === '23505') {
      const { data: existing } = await supabase
        .from('payments')
        .select('id, validation_code')
        .eq('fedapay_transaction_id', params.transactionId)
        .maybeSingle();
      if (existing) return { row: existing, duplicate: true };
    }
    throw error;
  }
  await notifyPaymentConfirmed(row?.user_id, row?.tournament_name);
  return { row, duplicate: false };
}

/** Marque les paiements "En attente" non réclamés comme échoués (événement refusé/annulé). */
export async function failPending(
  supabase: any,
  params: { userId?: string | null; tournamentId?: string | null; gateway?: string | null }
): Promise<void> {
  if (!params.userId || !params.tournamentId) return;
  let query = supabase
    .from('payments')
    .update({ status: 'Échoué', updated_at: new Date().toISOString() })
    .eq('user_id', params.userId)
    .eq('tournament_id', params.tournamentId)
    .is('validation_code', null);
  if (params.gateway) query = query.eq('gateway', params.gateway);
  await query;
}

/** Crédite les points de fidélité (une seule fois par transaction validée). */
export async function creditPoints(supabase: any, userId?: string | null, points = 10): Promise<void> {
  if (!userId) return;
  const { data: profile } = await supabase.from('profiles').select('points').eq('id', userId).single();
  await supabase
    .from('profiles')
    .update({ points: (profile?.points || 0) + points })
    .eq('id', userId);
}

/** Extrait tournamentId / tournamentName depuis l'URL de callback passée à la passerelle. */
export function parseCallbackUrl(raw: string | null | undefined): { tournamentId?: string; tournamentName?: string; amount?: string } {
  if (!raw || !raw.includes('tournamentId=')) return {};
  try {
    const url = new URL(raw);
    return {
      tournamentId: url.searchParams.get('tournamentId') ?? undefined,
      tournamentName: url.searchParams.get('tournamentName') ?? undefined,
      amount: url.searchParams.get('amount') ?? undefined
    };
  } catch {
    return {};
  }
}

/** Cherche une URL de callback dans n'importe quel champ string d'un objet transaction. */
export function findCallbackUrl(obj: any): string | null {
  if (!obj || typeof obj !== 'object') return null;
  for (const value of Object.values(obj)) {
    if (typeof value === 'string' && value.includes('payment-success') && value.includes('tournamentId=')) {
      return value;
    }
  }
  return null;
}
