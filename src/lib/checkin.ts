import { supabase } from "@/lib/supabase";
import { isValidTimezone, proposeTimezone } from "@/lib/timezones";

// Barème officiel du cycle de 7 jours : J1-J3 = 1 pt, J4-J6 = 2 pts, J7 = 3 pts.
// Les points des jours 1 à 6 restent EN ATTENTE ; les 12 points du cycle ne sont
// crédités au solde principal qu'à la réussite du Jour 7.
export const CHECKIN_LADDER = [1, 1, 1, 2, 2, 2, 3];
export const CYCLE_TOTAL_POINTS = 12;

export interface CheckInState {
  authenticated: boolean;
  profile_found?: boolean;
  timezone: string;
  profile_timezone: string;
  streak_day: number;
  pending_points: number;
  balance: number;
  today_local: string;
  next_midnight_epoch: number;
  already_claimed_today: boolean;
  gap_detected: boolean;
  points_to_lose: number;
  cycle_status: string;
}

export interface ClaimResult {
  ok: boolean;
  reason?: string;
  day?: number;
  points_for_day?: number;
  pending_points?: number;
  credited_points?: number;
  balance?: number;
  cycle_completed?: boolean;
  cycle_broken?: boolean;
  lost_pending_points?: number;
  timezone?: string;
  today_local?: string;
}

export async function fetchCheckInState(): Promise<CheckInState | null> {
  const { data, error } = await supabase.rpc("get_checkin_state");
  if (error || !data) return null;
  return data as CheckInState;
}

export async function claimDailyCheckIn(): Promise<ClaimResult> {
  const { data, error } = await supabase.rpc("claim_daily_checkin");
  if (error) throw new Error(error.message);
  return data as ClaimResult;
}

/**
 * Garantit que le profil a un fuseau horaire valide enregistré.
 * Le fuseau est PROPOSÉ depuis le pays du profil (ou du navigateur en dernier
 * recours) puis enregistré : le serveur s'en sert comme source de vérité pour
 * calculer les journées locales et verrouille le fuseau de chaque cycle.
 */
export async function ensureProfileTimezone(
  userId: string,
  currentTz: string | null | undefined
): Promise<string> {
  if (isValidTimezone(currentTz)) return currentTz!;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("country, timezone")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (isValidTimezone(profile?.timezone)) return profile.timezone;

  const proposed = proposeTimezone(profile?.country);
  const { error: updateError } = await supabase.from("profiles").update({ timezone: proposed }).eq("id", userId).is("timezone", null);
  if (updateError) throw updateError;
  return proposed;
}
