"use client";

import React from 'react';
import { Trophy, Award, Medal, Crown, Star, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PlayerBadgeProps {
  tournamentCount: number;
  mvpCount?: number;
  championCount?: number;
  size?: 'sm' | 'md' | 'lg';
}

const PlayerBadge = ({ tournamentCount, mvpCount = 0, championCount = 0, size = 'md' }: PlayerBadgeProps) => {
  const iconSize = size === 'sm' ? 12 : size === 'md' ? 16 : 24;
  const containerClass = size === 'sm' ? 'gap-1' : 'gap-2';

  // Badges de Progression
  let progressionBadge = null;
  if (tournamentCount >= 20) {
    progressionBadge = { icon: <Crown size={iconSize} />, label: "Légende", color: "text-yellow-400", bg: "bg-yellow-400/10" };
  } else if (tournamentCount >= 10) {
    progressionBadge = { icon: <Trophy size={iconSize} />, label: "Vétéran", color: "text-violet-400", bg: "bg-violet-400/10" };
  } else if (tournamentCount >= 5) {
    progressionBadge = { icon: <Medal size={iconSize} />, label: "Compétiteur", color: "text-zinc-400", bg: "bg-zinc-400/10" };
  } else if (tournamentCount >= 1) {
    progressionBadge = { icon: <Award size={iconSize} />, label: "Rookie", color: "text-orange-400", bg: "bg-orange-400/10" };
  }

  return (
    <TooltipProvider>
      <div className={`flex items-center ${containerClass}`}>
        {/* Badge de Progression */}
        {progressionBadge && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`p-1.5 rounded-full border border-current/20 ${progressionBadge.bg} ${progressionBadge.color} shadow-sm cursor-help`}>
                {progressionBadge.icon}
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-900 text-white border-zinc-800">
              <p className="text-[10px] font-bold">{progressionBadge.label} ({tournamentCount} tournois)</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Badge Champion */}
        {championCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-500 shadow-sm cursor-help">
                <Zap size={iconSize} className="fill-yellow-500" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-900 text-white border-zinc-800">
              <p className="text-[10px] font-bold">Champion ({championCount} victoires)</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Badge MVP */}
        {mvpCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-500 shadow-sm cursor-help">
                <Star size={iconSize} className="fill-cyan-500" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-900 text-white border-zinc-800">
              <p className="text-[10px] font-bold">MVP ({mvpCount} fois)</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

export default PlayerBadge;