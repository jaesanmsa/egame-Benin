import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Flame, Zap, Hourglass, Coins, CheckCircle2, PartyPopper, HeartCrack, Globe, RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCheckIn } from "@/hooks/useCheckIn";
import { CYCLE_TOTAL_POINTS } from "@/lib/checkin";
import CheckInGrid from "./CheckInGrid";
import PointsInfoBox from "./PointsInfoBox";

interface HistoryEvent {
  kind: "checkin" | "completed" | "broken";
  label: string;
  detail: string;
  date: string;
  color: string;
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  } catch {
    return "";
  }
};

/**
 * Carte permanente « Ma série eGame » affichée dans le profil du joueur :
 * progression du cycle, réclamation de la présence du jour, compte à rebours
 * jusqu'au prochain minuit LOCAL du joueur, fuseau horaire et historique.
 */
const CheckInCard = ({ userId }: { userId: string }) => {
  const { state, loading, claiming, claim, canClaim, timeRemaining, refresh } = useCheckIn(userId);
  const [justClaimed, setJustClaimed] = useState<null | {
    day: number;
    points: number;
    completed: boolean;
    credited: number;
  }>(null);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [claimError, setClaimError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    const [checkinsRes, cyclesRes] = await Promise.all([
      supabase
        .from("daily_checkins")
        .select("streak_day, points_for_day, credited_points, claimed_at")
        .eq("user_id", userId)
        .order("claimed_at", { ascending: false })
        .limit(6),
      supabase
        .from("checkin_cycles")
        .select("status, ended_at, pending_points")
        .eq("user_id", userId)
        .in("status", ["completed", "broken"])
        .order("ended_at", { ascending: false })
        .limit(3),
    ]);

    const events: HistoryEvent[] = [];

    (checkinsRes.data || []).forEach((c: any) => {
      if (c.credited_points > 0) {
        events.push({
          kind: "completed",
          label: "Cycle terminé 🎉",
          detail: `+${c.credited_points} points validés`,
          date: c.claimed_at,
          color: "text-[#FFD700]",
        });
      } else {
        events.push({
          kind: "checkin",
          label: `Check-in Jour ${c.streak_day}`,
          detail: `+${c.points_for_day} point${c.points_for_day > 1 ? "s" : ""} en attente`,
          date: c.claimed_at,
          color: "text-[#A855F7]",
        });
      }
    });

    (cyclesRes.data || []).forEach((c: any) => {
      if (c.status === "broken") {
        events.push({
          kind: "broken",
          label: "Série interrompue",
          detail: c.pending_points > 0 ? `${c.pending_points} points en attente perdus` : "0 point reçu",
          date: c.ended_at,
          color: "text-red-400",
        });
      }
    });

    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setHistory(events.slice(0, 6));
  }, [userId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, state?.streak_day, state?.pending_points, state?.balance]);

  useEffect(() => {
    setJustClaimed(null);
    setClaimError(null);
  }, [state?.today_local, userId]);

  const handleClaim = async () => {
    setClaimError(null);
    try {
      const result = await claim();
      if (result?.ok) {
        setJustClaimed({
          day: result.day ?? 0,
          points: result.points_for_day ?? 0,
          completed: !!result.cycle_completed,
          credited: result.credited_points ?? 0,
        });
      } else if (result?.reason === "ALREADY_CLAIMED") {
        setClaimError("Présence du jour déjà validée. Reviens demain !");
      } else {
        setClaimError("Impossible de valider ta présence pour le moment. Réessaie.");
      }
    } catch (err: any) {
      setClaimError(err?.message || "Erreur inattendue. Réessaie.");
    }
  };

  if (loading && !state) {
    return (
      <div className="glass-panel p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8A2BE2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!state?.authenticated || state.profile_found === false) return null;

  const gap = state.gap_detected && !justClaimed;

  return (
    <div className="glass-panel p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-gaming font-black uppercase tracking-widest text-white flex items-center gap-2">
          <Flame size={18} className="text-orange-400" />
          Ma série eGame
        </h3>
        <button
          onClick={() => { refresh(); loadHistory(); }}
          className="p-2 rounded-full border border-white/10 text-[#8888AA] hover:text-white hover:border-[#8A2BE2]/60 transition-colors"
          aria-label="Actualiser"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {justClaimed ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center space-y-2"
        >
          {justClaimed.completed ? (
            <>
              <p className="text-sm font-gaming font-black text-[#FFD700] flex items-center justify-center gap-2">
                <PartyPopper size={16} /> 🎉 Série de 7 jours terminée !
              </p>
              <p className="text-xs font-bold text-white">
                +{justClaimed.credited} points eGame ajoutés à ton compte.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-gaming font-black text-emerald-400 flex items-center justify-center gap-2">
                <CheckCircle2 size={16} /> ✅ Présence validée !
              </p>
              <p className="text-xs font-bold text-white">
                +{justClaimed.points} point{justClaimed.points > 1 ? "s" : ""} ajouté
                {justClaimed.points > 1 ? "s" : ""} à ta cagnotte en attente.
              </p>
            </>
          )}
          <p className="text-[11px] text-[#8888AA]">
            Continue ta série jusqu'au Jour 7 pour récupérer tous tes points !
          </p>
        </motion.div>
      ) : gap ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 space-y-1">
          <p className="text-sm font-gaming font-black text-red-400 flex items-center gap-2">
            <HeartCrack size={15} /> Série interrompue
          </p>
          <p className="text-[11px] text-[#8888AA] font-medium leading-relaxed">
            Tu as manqué une journée : tes{" "}
            <span className="text-red-400 font-bold">{state.points_to_lose} points en attente</span> sont
            perdus et ta série repart au Jour 1 aujourd'hui. Tes points déjà validés sont conservés.
          </p>
        </div>
      ) : null}

      <CheckInGrid streakDay={state.streak_day} claimedToday={state.already_claimed_today} />

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-[#0A0A0F] border border-white/10 p-3 space-y-1">
          <p className="text-[9px] font-gaming font-bold uppercase tracking-wider text-[#8888AA] flex items-center justify-center gap-1">
            <Flame size={10} className="text-orange-400" /> Série
          </p>
          <p className="text-sm font-gaming font-black text-white">{state.streak_day} / 7 jours</p>
        </div>
        <div className="rounded-xl bg-[#0A0A0F] border border-white/10 p-3 space-y-1">
          <p className="text-[9px] font-gaming font-bold uppercase tracking-wider text-[#8888AA] flex items-center justify-center gap-1">
            <Hourglass size={10} className="text-[#A855F7]" /> En attente
          </p>
          <p className="text-sm font-gaming font-black text-[#A855F7]">{state.pending_points}</p>
        </div>
        <div className="rounded-xl bg-[#0A0A0F] border border-white/10 p-3 space-y-1">
          <p className="text-[9px] font-gaming font-bold uppercase tracking-wider text-[#8888AA] flex items-center justify-center gap-1">
            <Coins size={10} className="text-[#FFD700]" /> Solde
          </p>
          <p className="text-sm font-gaming font-black text-[#FFD700]">{state.balance}</p>
        </div>
      </div>

      {claimError && <p className="text-xs font-bold text-red-400 text-center">{claimError}</p>}

      {state.already_claimed_today ? (
        <div className="space-y-2">
          <button
            disabled
            className="w-full py-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-gaming font-black text-xs uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={15} /> Présence du jour validée
          </button>
          {timeRemaining && (
            <div className="rounded-xl bg-[#0A0A0F] border border-white/10 p-3 flex items-center justify-center gap-2">
              <Zap size={13} className="text-[#A855F7]" />
              <p className="text-xs font-gaming font-bold text-white">
                Prochaine récompense dans :{" "}
                <span className="text-[#A855F7]">{timeRemaining.label}</span>
              </p>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleClaim}
          disabled={claiming || !canClaim}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#8A2BE2] to-[#A855F7] hover:brightness-110 disabled:opacity-60 text-white font-gaming font-black text-xs uppercase tracking-widest shadow-lg shadow-[#8A2BE2]/30 transition-all"
        >
          {claiming ? "Validation en cours..." : "✅ Réclamer ma présence"}
        </button>
      )}

      <p className="text-[10px] text-[#8888AA]/80 font-medium flex items-center gap-1.5">
        <Globe size={11} className="text-[#8A2BE2]" />
        Fuseau horaire : <span className="text-white/90 font-mono">{state.timezone}</span>
        {" "}• Cycle complet : +{CYCLE_TOTAL_POINTS} points
      </p>

      {history.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-gaming font-black uppercase tracking-widest text-[#8888AA]">
            Historique récent
          </p>
          <div className="space-y-1.5">
            {history.map((event, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl bg-[#0A0A0F] border border-white/5 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-white truncate">{event.label}</p>
                  <p className={`text-[10px] font-bold ${event.color}`}>{event.detail}</p>
                </div>
                <p className="text-[10px] text-[#8888AA] font-medium shrink-0 ml-2">
                  {formatDate(event.date)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <PointsInfoBox />
    </div>
  );
};

export default CheckInCard;
