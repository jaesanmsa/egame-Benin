"use client";

import React from 'react';
import { Trophy, Award, Medal, Crown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PlayerBadgeProps {
  tournamentCount: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const PlayerBadge = ({ tournamentCount, size = 'md', showLabel = false }: PlayerBadgeProps) => {
  let badge = { icon: <Award />, label: "Rookie", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" };

  if (tournamentCount >= 20) {
    badge = { icon: <Crown />, label: "Légende", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" };
  } else if (tournamentCount >= 10) {
    badge = { icon: <Trophy />, label: "Vétéran", color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20" };
  } else if (tournamentCount >= 5) {
    badge = { icon: <Medal />, label: "Compétiteur", color: "text-zinc-400", bg: "bg-zinc-400/10", border: "border-zinc-400/20" };
  } else if (tournamentCount < 1) {
    return null; // Pas de badge si 0 tournoi
  }

  const sizes = {
    sm: "w-5 h-5 p-0.5",
    md: "w-8 h-8 p-1.5",
    lg: "w-12 h-12 p-2.5"
  };

  const iconSize = size === 'sm' ? 12 : size === 'md' ? 16 : 24;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-2 ${showLabel ? 'bg-muted/50 px-3 py-1.5 rounded-full border border-border' : ''}`}>
            <div className={`${sizes[size]} ${badge.bg} ${badge.color} rounded-full border ${badge.border} flex items-center justify-center shadow-sm`}>
              {React.cloneElement(badge.icon as React.ReactElement, { size: iconSize })}
            </div>
            {showLabel && <span className={`text-[10px] font-black uppercase tracking-widest ${badge.color}`}>{badge.label}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-zinc-900 text-white border-zinc-800">
          <p className="text-[10px] font-bold">{badge.label} ({tournamentCount} tournois)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PlayerBadge;