import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckInState,
  ClaimResult,
  fetchCheckInState,
  claimDailyCheckIn,
  ensureProfileTimezone,
} from "@/lib/checkin";

export interface TimeRemaining {
  hours: number;
  minutes: number;
  label: string;
}

export function useCheckIn(userId: string | null) {
  const [state, setState] = useState<CheckInState | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [lastClaim, setLastClaim] = useState<ClaimResult | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Horloge pour le compte à rebours jusqu'au prochain minuit LOCAL du joueur.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  const refresh = useCallback(async () => {
    if (!userId) {
      setState(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await ensureProfileTimezone(userId, null);
      const s = await fetchCheckInState();
      if (mounted.current) setState(s);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const sync = () => { void refresh().catch(() => setState(null)); };
    sync();
    const timer = setInterval(sync, 60000);
    window.addEventListener("focus", sync);
    window.addEventListener("egame-points-updated", sync);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", sync);
      window.removeEventListener("egame-points-updated", sync);
    };
  }, [refresh]);

  const claim = useCallback(async (): Promise<ClaimResult | null> => {
    if (!userId || claiming) return null;
    setClaiming(true);
    try {
      const result = await claimDailyCheckIn();
      if (mounted.current) setLastClaim(result);
      await refresh();
      window.dispatchEvent(new Event("egame-points-updated"));
      return result;
    } catch (err) {
      // Le serveur reste la source de vérité : on resynchronise l'état réel.
      await refresh();
      throw err;
    } finally {
      if (mounted.current) setClaiming(false);
    }
  }, [userId, claiming, refresh]);

  const timeRemaining: TimeRemaining | null = (() => {
    if (!state?.next_midnight_epoch) return null;
    const diffMs = state.next_midnight_epoch * 1000 - now;
    if (diffMs <= 0) return { hours: 0, minutes: 0, label: "0h 00min" };
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return {
      hours,
      minutes,
      label: `${hours}h ${String(minutes).padStart(2, "0")}min`,
    };
  })();

  const canClaim =
    !!state &&
    state.authenticated &&
    state.profile_found !== false &&
    !state.already_claimed_today;

  return { state, loading, claiming, lastClaim, refresh, claim, canClaim, timeRemaining };
}
