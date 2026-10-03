import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, X, CheckCircle2, PartyPopper } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCheckIn } from "@/hooks/useCheckIn";
import { CHECKIN_LADDER, CYCLE_TOTAL_POINTS } from "@/lib/checkin";

const MODAL_STORAGE_PREFIX = "egame_checkin_modal_";

/**
 * Rappel quotidien compact : une simple pastille en bas d'écran qui apparaît
 * une seule fois par journée locale, propose la récompense du jour en un clic
 * puis disparaît. Le détail complet (grille 7 jours, historique) reste dans
 * la carte « Ma série eGame » du profil.
 */
const DailyCheckInModal = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const { state, loading, claiming, claim, canClaim } = useCheckIn(userId);
  const [open, setOpen] = useState(false);
  const [justClaimed, setJustClaimed] = useState<null | { day: number; points: number; completed: boolean }>(null);
  const [dismissed, setDismissed] = useState(false);

  // Détection de session : le rappel ne concerne que les joueurs connectés.
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

  // Ouverture automatique une seule fois par journée locale (si non réclamé).
  useEffect(() => {
    if (loading || !state || !state.authenticated || state.profile_found === false) return;
    if (state.country_configured === false) return;
    const shouldShow = !state.already_claimed_today;
    if (!shouldShow || !userId) return;
    const key = `${MODAL_STORAGE_PREFIX}${userId}_${state.today_local}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
    setJustClaimed(null);
    setOpen(true);
  }, [state, loading, userId]);

  // Fermeture automatique après une réclamation réussie.
  useEffect(() => {
    if (!open || !justClaimed) return;
    const t = setTimeout(() => { setOpen(false); setDismissed(true); }, 3500);
    return () => clearTimeout(t);
  }, [open, justClaimed]);

  const handleClaim = async () => {
    try {
      const result = await claim();
      if (result?.ok) {
        setJustClaimed({
          day: result.day ?? 0,
          points: result.points_for_day ?? 0,
          completed: !!result.cycle_completed,
        });
      } else {
        setOpen(false);
      }
    } catch {
      setOpen(false);
    }
  };

  const nextPoints = CHECKIN_LADDER[Math.min(state?.streak_day ?? 0, 6)] ?? 1;

  const visible = open && state?.authenticated && !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="fixed bottom-24 left-3 right-3 z-[100] mx-auto sm:left-auto sm:right-6 sm:w-auto md:bottom-8"
        >
          <div className="mx-auto max-w-md flex items-center gap-3 rounded-2xl border border-[#8A2BE2]/60 bg-[#0F0F1E]/95 backdrop-blur-xl pl-4 pr-2.5 py-2.5 shadow-2xl shadow-black/60">
            {justClaimed ? (
              <>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  {justClaimed.completed
                    ? <PartyPopper size={16} className="text-[#FFD700]" />
                    : <CheckCircle2 size={16} className="text-emerald-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-gaming font-black text-white leading-snug">
                    {justClaimed.completed ? "🎉 Série terminée !" : "✅ Présence validée !"}
                  </p>
                  <p className="text-[10px] text-[#8888AA]">
                    +{justClaimed.completed ? CYCLE_TOTAL_POINTS : justClaimed.points} pt{justClaimed.points > 1 ? "s" : ""}
                    {justClaimed.completed ? " crédités" : " en attente"} • Reviens demain !
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-9 h-9 rounded-xl bg-[#8A2BE2]/20 border border-[#8A2BE2]/50 flex items-center justify-center shrink-0">
                  <Flame size={16} className="text-orange-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-gaming font-black text-white leading-snug">
                    Récompense quotidienne · Jour {(state?.streak_day ?? 0) + 1}/7
                  </p>
                  <p className="text-[10px] text-[#8888AA]">+{nextPoints} point{nextPoints > 1 ? "s" : ""} à réclamer maintenant</p>
                </div>
                <button
                  onClick={handleClaim}
                  disabled={claiming || !canClaim}
                  className="shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8A2BE2] to-[#A855F7] hover:brightness-110 disabled:opacity-60 text-white font-gaming font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#8A2BE2]/30 transition-all"
                >
                  {claiming ? "…" : "Réclamer"}
                </button>
              </>
            )}
            <button
              onClick={() => { setOpen(false); setDismissed(true); }}
              aria-label="Fermer le rappel"
              className="shrink-0 p-1.5 rounded-lg text-[#8888AA] hover:text-white hover:bg-white/5 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DailyCheckInModal;
