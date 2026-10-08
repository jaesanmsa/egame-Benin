import React from "react";
import { CHECKIN_LADDER } from "@/lib/checkin";
import { Check, Target, Lock, Gift } from "lucide-react";

interface CheckInGridProps {
  /** Dernier jour déjà réclamé dans le cycle actuel (0 = aucun). */
  streakDay: number;
  /** La présence du jour est-elle déjà réclamée ? */
  claimedToday: boolean;
  /** Le jour précédent a été manqué : la prochaine réclamation démarre au Jour 1. */
  gapDetected?: boolean;
  size?: "sm" | "lg";
}

/**
 * Grille visuelle des 7 jours du cycle :
 * ✅ jour réclamé — 🎯 jour à réclamer aujourd'hui — 🔒 jour à venir — 🎁 Jour 7.
 */
const CheckInGrid = ({ streakDay, claimedToday, gapDetected = false, size = "sm" }: CheckInGridProps) => {
  const visibleStreakDay = gapDetected ? 0 : streakDay;
  const currentDay = claimedToday && !gapDetected ? -1 : visibleStreakDay + 1;
  const cell = size === "lg" ? "p-4 space-y-2" : "p-3 space-y-1.5";
  const iconSize = size === "lg" ? 22 : 18;
  const labelSize = size === "lg" ? "text-sm" : "text-xs";

  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {CHECKIN_LADDER.map((points, index) => {
        const day = index + 1;
        const isDay7 = day === 7;
        const done = day <= visibleStreakDay;
        const isCurrent = day === currentDay;

        let wrapper =
          "bg-[#0A0A0F] border border-white/10 text-[#8888AA]";
        if (done) {
          wrapper = isDay7
            ? "bg-[#FFD700]/15 border-[#FFD700]/60 text-[#FFD700]"
            : "bg-[#8A2BE2]/20 border-[#8A2BE2]/60 text-white";
        } else if (isCurrent) {
          wrapper = isDay7
            ? "bg-[#FFD700]/10 border-[#FFD700]/70 text-[#FFD700] animate-pulse"
            : "bg-[#8A2BE2]/10 border-[#A855F7]/70 text-white animate-pulse";
        } else if (isDay7) {
          wrapper = "bg-[#0A0A0F] border-[#FFD700]/30 text-[#FFD700]/80";
        }

        return (
          <div
            key={day}
            className={`rounded-xl ${cell} ${wrapper} flex flex-col items-center justify-center text-center transition-all`}
          >
            {done ? (
              isDay7 ? (
                <Gift size={iconSize} className="shrink-0" />
              ) : (
                <Check size={iconSize} className="shrink-0" />
              )
            ) : isCurrent ? (
              <Target size={iconSize} className="shrink-0" />
            ) : isDay7 ? (
              <Gift size={iconSize} className="shrink-0" />
            ) : (
              <Lock size={iconSize} className="shrink-0 opacity-50" />
            )}
            <p className={`${labelSize} font-gaming font-black leading-none`}>J{day}</p>
            <p className={`${size === "lg" ? "text-xs" : "text-[10px]"} font-gaming font-bold opacity-90`}>
              +{points}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default CheckInGrid;
