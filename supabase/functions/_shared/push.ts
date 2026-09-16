// Appel serveur à serveur de l'edge function send-push-notification.
// Import : import { notifyPaymentConfirmed } from '../_shared/push.ts'

const PUSH_URL = 'https://ajbpdaxtynkazdrzyopd.supabase.co/functions/v1/send-push-notification';

/** Notifie un joueur que son inscription (paiement) est validée. Ne lève jamais d'erreur. */
export async function notifyPaymentConfirmed(
  userId: string | null | undefined,
  tournamentName: string | null | undefined
): Promise<void> {
  if (!userId) return;
  try {
    const res = await fetch(PUSH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'PAYMENT_CONFIRMED',
        user_id: userId,
        tournament_name: tournamentName ?? 'ton tournoi'
      })
    });
    console.log(`[notify-push] PAYMENT_CONFIRMED -> ${res.status}`);
  } catch (e) {
    console.error('[notify-push] Échec notification paiement :', (e as Error).message);
  }
}
