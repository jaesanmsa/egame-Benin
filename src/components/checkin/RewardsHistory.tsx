import { useSiteLanguage, translate } from '@/lib/siteLanguage';
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coins, Trophy, Medal, Star, Flame, History } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface RewardEvent {
  id: string;
  kind: "checkin" | "tournament";
  label: string;
  detail: string;
  points: number;
  date: string;
  icon: React.ReactNode;
  color: string;
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const RewardsHistory = ({ userId }: { userId: string }) => {
  const language = useSiteLanguage();
  const t = (value: string) => translate(value, language);
  const [events, setEvents] = useState<RewardEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const [checkinsRes, rewardsRes] = await Promise.all([
          supabase
            .from("daily_checkins")
            .select("streak_day, points_for_day, credited_points, claimed_at")
            .eq("user_id", userId)
            .order("claimed_at", { ascending: false })
            .limit(10),
          supabase
            .from("tournament_rewards")
            .select("reward_type, points, created_at, tournaments!inner(title)")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

        const allEvents: RewardEvent[] = [];

        (checkinsRes.data || []).forEach((c: any) => {
          if (c.credited_points > 0) {
            allEvents.push({
              id: `checkin-completed-${c.claimed_at}`,
              kind: "checkin",
              label: "Cycle de 7 jours terminé",
              detail: `+${c.credited_points} points validés`,
              points: c.credited_points,
              date: c.claimed_at,
              icon: <Flame size={14} className="text-orange-400" />,
              color: "text-[#FFD700]",
            });
          } else {
            allEvents.push({
              id: `checkin-${c.claimed_at}-${c.streak_day}`,
              kind: "checkin",
              label: `Check-in Jour ${c.streak_day}`,
              detail: `+${c.points_for_day} point${c.points_for_day > 1 ? "s" : ""} en attente`,
              points: c.points_for_day,
              date: c.claimed_at,
              icon: <Flame size={14} className="text-[#A855F7]" />,
              color: "text-[#A855F7]",
            });
          }
        });

        (rewardsRes.data || []).forEach((r: any) => {
          const tournamentTitle = r.tournaments?.title || "Tournoi";
          const rewardLabels: Record<string, string> = {
            winner: "1ère place",
            second_place: "2ème place",
            third_place: "3ème place",
            mvp: "MVP",
          };
          const rewardIcons: Record<string, React.ReactNode> = {
            winner: <Trophy size={14} className="text-[#FFD700]" />,
            second_place: <Medal size={14} className="text-slate-300" />,
            third_place: <Medal size={14} className="text-orange-400" />,
            mvp: <Star size={14} className="text-orange-400" />,
          };
          allEvents.push({
            id: `tournament-${r.created_at}-${r.reward_type}`,
            kind: "tournament",
            label: `${rewardLabels[r.reward_type] || r.reward_type} — ${tournamentTitle}`,
            detail: r.points > 0 ? `+${r.points} points eGame` : "+1 titre",
            points: r.points,
            date: r.created_at,
            icon: rewardIcons[r.reward_type] || <Trophy size={14} />,
            color: "text-[#FFD700]",
          });
        });

        allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEvents(allEvents.slice(0, 15));
      } catch (error) {
        console.error("Erreur historique récompenses:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [userId]);

  if (loading) {
    return (
      <div className="glass-panel p-6 space-y-3">
        <h3 className="text-sm font-gaming font-black uppercase tracking-widest text-[#8888AA] flex items-center gap-2">
          <History size={14} className="text-[#8A2BE2]" /> Historique des récompenses
        </h3>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-[#0A0A0F] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="glass-panel p-6">
        <h3 className="text-sm font-gaming font-black uppercase tracking-widest text-[#8888AA] flex items-center gap-2">
          <History size={14} className="text-[#8A2BE2]" /> Historique des récompenses
        </h3>
        <p className="text-xs text-[#8888AA]/70 mt-3">{t("Aucune récompense pour le moment. Termine ton premier tournoi ou complète ta série de 7 jours !")}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 space-y-4"
    >
      <h3 className="text-sm font-gaming font-black uppercase tracking-widest text-[#8888AA] flex items-center gap-2">
        <History size={14} className="text-[#8A2BE2]" /> Historique des récompenses
      </h3>

      <div className="space-y-2">
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 rounded-xl bg-[#0A0A0F] border border-white/5 px-3 py-2.5"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0F0F1E] border border-white/10 shrink-0">
              {event.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{event.label}</p>
              <p className={`text-[10px] font-bold ${event.color}`}>{event.detail}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-gaming font-black text-[#FFD700]">+{event.points}</p>
              <p className="text-[9px] text-[#8888AA]">{formatDate(event.date)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RewardsHistory;