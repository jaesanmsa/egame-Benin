import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flame, Zap, Hourglass, Coins, CheckCircle2, PartyPopper, HeartCrack, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCheckIn } from "@/hooks/useCheckIn";
import { CYCLE_TOTAL_POINTS } from "@/lib/checkin";
import CheckInGrid from "./CheckInGrid";
import PointsInfoBox from "./PointsInfoBox";

const MODAL_STORAGE_PREFIX = "egame_checkin_modal_";

/**
 * Fenêtre de check-in quotidienne. Elle s'ouvre automatiquement une seule fois
 * par journée locale du joueur lors de sa première visite, uniquement si la
 * présence du jour n'a pas encore été réclamée. Le joueur peut la fermer et
 * retrouver la carte de check-in en permanence dans son profil.
 */
const DailyCheckInModal = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const { state, loading, claiming, claim, canClaim, timeRemaining } = useCheckIn(userId);
  const [open, setOpen] = useState(false);
  const [justClaimed, setJustClaimed] = useState<null | {
    day: number;
    points: number;
    completed: boolean;
    credited: number;
  }>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Détection de session : la fenêtre se déclenche à la première visite
  // de la journée d'un joueur connecté.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id ?? null);
      if (event === "SIGNED_OUT") {
        setOpen(false);
        setJustClaimed(null);
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Ouverture automatique une fois par journée locale.
  useEffect(() => {
    if (loading || !state || !state.authenticated || state.profile_found === false) return;
    const shouldShow = !state.already_claimed_today;
    if (!shouldShow || !userId) return;
    const key = `${MODAL_STORAGE_PREFIX}${userId}_${state.today_local}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
    setJustClaimed(null);
    setOpen(true);
  }, [state, loading, userId]);

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
        setClaimError("Ta présence du jour a déjà été validée. Reviens demain !");
      } else {
        setClaimError("Impossible de valider ta présence pour le moment. Réessaie.");
      }
    } catch (err: any) {
      setClaimError(err?.message || "Erreur inattendue. Réessaie.");
    }
  };

  const streakDay = justClaimed ? justClaimed.day : state?.streak_day ?? 0;
  const gap = !!state?.gap_detected && !justClaimed;

  return (
    <AnimatePresence>
      {open && state?.authenticated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm px-3 pb-3 sm:p-6"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl border border-[#8A2BE2]/50 bg-[#0F0F1E] shadow-2xl shadow-[#8A2BE2]/20"
          >
            {/* En-tête */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-[#0F0F1E]/95 backdrop-blur px-5 py-4 border-b border-[#8A2BE2]/20">
              <p className="text-sm font-gaming font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Flame size={18} className="text-orange-400" />
                <span className="text-[#A855F7]">Récompense</span> quotidienne
              </p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="p-2 rounded-full border border-white/10 text-[#8888AA] hover:text-white hover:border-[#8A2BE2]/60 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {justClaimed ? (
                /* ============ VALIDATION ============ */
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center space-y-4 py-4"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12, delay: 0.1 }}
                    className="mx-auto w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-400/60 flex items-center justify-center"
                  >
                    {justClaimed.completed ? (
                      <PartyPopper size={36} className="text-[#FFD700]" />
                    ) : (
                      <CheckCircle2 size={36} className="text-emerald-400" />
                    )}
                  </motion.div>

                  {justClaimed.completed ? (
                    <>
                      <p className="text-lg font-gaming font-black text-[#FFD700]">
                        🎉 Série de 7 jours terminée !
                      </p>
                      <p className="text-sm font-bold text-white">
                        +{justClaimed.credited} points eGame ajoutés à ton compte.
                      </p>
                      <p className="text-xs text-[#8888AA] font-medium">
                        Ta nouvelle série recommence demain au Jour 1. Continue comme ça ! 🔥
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-gaming font-black text-emerald-400">
                        ✅ Présence validée !
                      </p>
                      <p className="text-sm font-bold text-white">
                        +{justClaimed.points} point{justClaimed.points > 1 ? "s" : ""} ajouté
                        {justClaimed.points > 1 ? "s" : ""} à ta cagnotte en attente.
                      </p>
                      <p className="text-xs text-[#8888AA] font-medium">
                        Continue ta série jusqu'au Jour 7 pour récupérer tous tes points !
                      </p>
                    </>
                  )}
                  <div className="rounded-2xl bg-[#0A0A0F] border border-white/10 p-3 flex items-center justify-center gap-6 text-xs font-gaming font-bold">
                    <span className="text-[#8888AA]">
                      Série : <span className="text-white">{justClaimed.completed ? 7 : justClaimed.day}/7</span>
                    </span>
                    <span className="text-[#8888AA]">
                      En attente :{" "}
                      <span className="text-[#FFD700]">
                        {justClaimed.completed ? 0 : (state?.pending_points ?? 0)}
                      </span>
                    </span>
                    <span className="text-[#8888AA]">
                      Solde : <span className="text-white">{state?.balance ?? 0}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-full py-4 rounded-2xl bg-[#8A2BE2] hover:bg-[#A855F7] text-white font-gaming font-black text-xs uppercase tracking-widest transition-colors"
                  >
                    {justClaimed.completed ? "Récupérer ma récompense ✓" : "Continuer"}
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* ============ SÉRIE INTERROMPUE ============ */}
                  {gap && (
                    <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 space-y-2">
                      <p className="text-sm font-gaming font-black text-red-400 flex items-center gap-2">
                        <HeartCrack size={16} /> SÉRIE INTERROMPUE
                      </p>
                      <p className="text-xs text-[#8888AA] font-medium leading-relaxed">
                        Tu as manqué une journée. Tes{" "}
                        <span className="text-red-400 font-bold">
                          {state?.points_to_lose ?? 0} points en attente
                        </span>{" "}
                        de la série précédente ont été perdus. Ta nouvelle série
                        recommence au <span className="text-white font-bold">Jour 1</span>. Tes
                        anciens points eGame déjà validés sont conservés.
                      </p>
                      <p className="text-[10px] font-gaming font-black uppercase tracking-widest text-[#A855F7] flex items-center gap-1.5">
                        <RotateCcw size={12} /> Nouvelle série — Jour 1
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-[#8888AA] font-medium leading-relaxed">
                    Connecte-toi <span className="text-white font-bold">7 jours consécutifs</span> et
                    récupère tous tes points eGame !
                  </p>

                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3">
                    <p className="text-[10px] font-bold text-amber-500/90 leading-relaxed">
                      ⚠️ Attention : si tu rates une journée avant le Jour 7, ta série est
                      réinitialisée et tes points en attente sont perdus.
                    </p>
                  </div>

                  <CheckInGrid streakDay={streakDay} claimedToday={!!state?.already_claimed_today} />

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-[#0A0A0F] border border-white/10 p-3 space-y-1">
                      <p className="text-[9px] font-gaming font-bold uppercase tracking-wider text-[#8888AA] flex items-center justify-center gap-1">
                        <Flame size={10} className="text-orange-400" /> Série
                      </p>
                      <p className="text-sm font-gaming font-black text-white">{streakDay} / 7</p>
                    </div>
                    <div className="rounded-xl bg-[#0A0A0F] border border-white/10 p-3 space-y-1">
                      <p className="text-[9px] font-gaming font-bold uppercase tracking-wider text-[#8888AA] flex items-center justify-center gap-1">
                        <Hourglass size={10} className="text-[#A855F7]" /> En attente
                      </p>
                      <p className="text-sm font-gaming font-black text-[#A855F7]">{state?.pending_points ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-[#0A0A0F] border border-white/10 p-3 space-y-1">
                      <p className="text-[9px] font-gaming font-bold uppercase tracking-wider text-[#8888AA] flex items-center justify-center gap-1">
                        <Coins size={10} className="text-[#FFD700]" /> Solde
                      </p>
                      <p className="text-sm font-gaming font-black text-[#FFD700]">{state?.balance ?? 0}</p>
                    </div>
                  </div>

                  {claimError && (
                    <p className="text-xs font-bold text-red-400 text-center">{claimError}</p>
                  )}

                  {state?.already_claimed_today ? (
                    <div className="space-y-3">
                      <button
                        disabled
                        className="w-full py-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-gaming font-black text-xs uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} /> Présence du jour validée
                      </button>
                      <p className="text-[11px] text-[#8888AA] font-medium text-center">
                        Reviens demain pour continuer ta série.
                      </p>
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
                      disabled={claiming || loading || !canClaim}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#8A2BE2] to-[#A855F7] hover:brightness-110 disabled:opacity-60 text-white font-gaming font-black text-xs uppercase tracking-widest shadow-lg shadow-[#8A2BE2]/30 transition-all"
                    >
                      {claiming ? "Validation en cours..." : "✅ Réclamer ma présence"}
                    </button>
                  )}

                  <p className="text-[10px] text-[#8888AA]/70 text-center font-medium">
                    Cycle complet : +{CYCLE_TOTAL_POINTS} points crédités à la réussite du Jour 7 •
                    Fuseau : {state?.timezone ?? "—"}
                  </p>

                  <PointsInfoBox />
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DailyCheckInModal;
