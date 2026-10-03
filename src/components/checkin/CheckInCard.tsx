import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Zap, CheckCircle2, PartyPopper, HeartCrack, Globe, RefreshCw, ChevronDown,
} from "lucide-react";
import { useCheckIn } from "@/hooks/useCheckIn";
import { CYCLE_TOTAL_POINTS } from "@/lib/checkin";
import { getCountryByCode } from "@/lib/countries";
import { Link } from "react-router-dom";
import CheckInGrid from "./CheckInGrid";
import PointsInfoBox from "./PointsInfoBox";

/**
 * Carte « Ma série eGame » — version compacte : une seule ligne résume la
 * progression (jour, points en attente, solde) avec le bouton de réclamation
 * intégré. Le détail (grille 7 jours, fuseau, barème) se déplie via la flèche.
 * L'historique complet vit dans « Historique des récompenses » juste en dessous.
 */
const CheckInCard = ({ userId }: { userId: string }) => {
  const { state, loading, claiming, claim, canClaim, timeRemaining, refresh } = useCheckIn(userId);
  const [justClaimed, setJustClaimed] = useState<null | {
    day: number;
    points: number;
    completed: boolean;
    credited: number;
  }>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

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
      <div className="glass-panel p-4 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#8A2BE2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!state?.authenticated || state.profile_found === false) return null;

  // Le joueur doit d'abord configurer son pays et son fuseau horaire sur son profil
  // avant de pouvoir valider sa présence quotidienne.
  if (state.country_configured === false) {
    return (
      <div className="glass-panel p-5 space-y-3">
        <h3 className="text-sm font-gaming font-black uppercase tracking-widest text-white flex items-center gap-2">
          <Flame size={16} className="text-orange-400" />
          Ma série eGame
        </h3>
        <div className="rounded-2xl border border-[#8A2BE2]/40 bg-[#8A2BE2]/10 p-4 space-y-2 text-center">
          <div className="mx-auto w-11 h-11 rounded-full bg-[#8A2BE2]/20 border border-[#8A2BE2]/50 flex items-center justify-center">
            <Globe size={20} className="text-[#A855F7]" />
          </div>
          <p className="text-xs font-gaming font-black text-white uppercase tracking-wide">
            Configure ton pays pour activer tes récompenses
          </p>
          <Link
            to="/edit-profile"
            className="inline-block mt-1 px-5 py-2.5 rounded-xl bg-[#8A2BE2] hover:bg-[#A855F7] text-white font-gaming font-black text-[10px] uppercase tracking-widest transition-colors"
          >
            ⚙️ Configurer mon profil
          </Link>
        </div>
      </div>
    );
  }

  const pendingCountry = state.pending_country
    ? getCountryByCode(state.pending_country)
    : null;
  const gap = state.gap_detected && !justClaimed;

  return (
    <div className="glass-panel p-4 space-y-3">
      {/* ===== Ligne principale compacte ===== */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 min-w-0 flex-1 text-left group"
          aria-label={expanded ? "Replier le détail de la série" : "Déplier le détail de la série"}
        >
          <Flame size={16} className="text-orange-400 shrink-0" />
          <span className="text-xs font-gaming font-black uppercase tracking-widest text-white">
            Série {state.streak_day}/7
          </span>
          <span className="text-[11px] font-bold text-[#A855F7]">· {state.pending_points} en attente</span>
          <span className="text-[11px] font-bold text-[#FFD700]">· {state.balance} pts</span>
          <ChevronDown
            size={14}
            className={`text-[#8888AA] shrink-0 ml-auto transition-transform group-hover:text-white ${expanded ? "rotate-180" : ""}`}
          />
        </button>
        <button
          onClick={() => refresh()}
          className="p-1.5 rounded-full border border-white/10 text-[#8888AA] hover:text-white hover:border-[#8A2BE2]/60 transition-colors"
          aria-label="Actualiser"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      {/* ===== Changement de pays programmé (compact) ===== */}
      {pendingCountry && state.pending_timezone && (
        <p className="text-[10px] text-amber-200/90 font-bold leading-relaxed flex items-center gap-1.5">
          <Zap size={11} className="text-amber-400 shrink-0" />
          Changement programmé : {pendingCountry.flag} {pendingCountry.name} — appliqué après le Jour 7.
        </p>
      )}

      {/* ===== Bandeaux transitoires ===== */}
      {justClaimed && (
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-center"
        >
          <p className="text-[11px] font-gaming font-black text-emerald-400">
            {justClaimed.completed
              ? `🎉 Série terminée ! +${justClaimed.credited} points crédités`
              : `✅ Présence validée ! +${justClaimed.points} point${justClaimed.points > 1 ? "s" : ""} en attente`}
          </p>
        </motion.div>
      )}
      {!justClaimed && gap && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2">
          <p className="text-[11px] font-bold text-red-400 flex items-center gap-1.5">
            <HeartCrack size={12} /> Série interrompue — {state.points_to_lose} points en attente perdus, reprise au Jour 1.
          </p>
        </div>
      )}

      {claimError && <p className="text-[11px] font-bold text-red-400 text-center">{claimError}</p>}

      {/* ===== Réclamation compacte ===== */}
      {state.already_claimed_today ? (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-[#0A0A0F] border border-white/10 px-3 py-2.5">
          <p className="text-[11px] font-gaming font-black text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 size={13} /> Jour validé
          </p>
          {timeRemaining && (
            <p className="text-[10px] font-bold text-[#8888AA]">
              Prochaine : <span className="text-[#A855F7]">{timeRemaining.label}</span>
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={handleClaim}
          disabled={claiming || !canClaim}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8A2BE2] to-[#A855F7] hover:brightness-110 disabled:opacity-60 text-white font-gaming font-black text-[11px] uppercase tracking-widest shadow-lg shadow-[#8A2BE2]/30 transition-all"
        >
          {claiming ? "Validation..." : `✅ Réclamer ma présence · J${Math.min(state.streak_day + 1, 7)}/7`}
        </button>
      )}

      {/* ===== Détail repliable ===== */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden space-y-4"
          >
            <CheckInGrid streakDay={state.streak_day} claimedToday={state.already_claimed_today} />

            <p className="text-[10px] text-[#8888AA]/80 font-medium flex items-center gap-1.5">
              <Globe size={11} className="text-[#8A2BE2]" />
              Fuseau : <span className="text-white/90 font-mono">{state.timezone}</span>
              {" "}• Cycle complet : +{CYCLE_TOTAL_POINTS} points
            </p>

            <PointsInfoBox />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckInCard;
