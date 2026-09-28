"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Flame, Trophy, HeartCrack, Hourglass, Coins, Globe, RefreshCw, Users, BarChart3 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { showError } from "@/utils/toast";

interface AdminStats {
  checkins_today: number;
  total_checkins: number;
  active_players: number;
  by_day: Record<string, number>;
  completed_cycles: number;
  broken_cycles: number;
  pending_total: number;
  distributed_total: number;
  by_timezone: { timezone: string; players: number; checkins: number }[];
  by_country: { country: string; players: number }[];
}

const DAYS = ["1", "2", "3", "4", "5", "6", "7"];

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => (
  <div className="bg-muted/30 border border-border/50 rounded-2xl p-4 space-y-1">
    <div className={`flex items-center gap-2 ${color}`}>{icon}
      <p className="text-[9px] font-black uppercase tracking-widest">{label}</p>
    </div>
    <p className="text-xl font-gaming font-black text-foreground">{value}</p>
  </div>
);

const CheckInsAdminTab = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_checkin_admin_stats");
    if (error) {
      showError("Impossible de charger les statistiques : " + error.message);
    } else {
      setStats(data as AdminStats);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <div className="bg-card p-8 rounded-[2.5rem] border border-border flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#8A2BE2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const maxDay = Math.max(1, ...DAYS.map((d) => stats.by_day?.[d] || 0));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black flex items-center gap-3">
          <CalendarCheck className="text-orange-500" /> Check-ins quotidiens
        </h2>
        <button
          onClick={fetchStats}
          className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-violet-500/40 transition-colors"
          aria-label="Actualiser"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<CalendarCheck size={14} />} label="Check-ins aujourd'hui" value={stats.checkins_today} color="text-orange-500" />
        <StatCard icon={<Users size={14} />} label="Séries actives" value={stats.active_players} color="text-violet-500" />
        <StatCard icon={<Hourglass size={14} />} label="Points en attente" value={stats.pending_total} color="text-[#A855F7]" />
        <StatCard icon={<Coins size={14} />} label="Points distribués" value={stats.distributed_total} color="text-[#FFD700]" />
        <StatCard icon={<Flame size={14} />} label="Total check-ins" value={stats.total_checkins} color="text-emerald-500" />
        <StatCard icon={<Trophy size={14} />} label="Cycles terminés" value={stats.completed_cycles} color="text-[#FFD700]" />
        <StatCard icon={<HeartCrack size={14} />} label="Cycles interrompus" value={stats.broken_cycles} color="text-red-500" />
        <StatCard icon={<BarChart3 size={14} />} label="Joueurs Jour 7" value={stats.by_day?.["7"] || 0} color="text-[#FFD700]" />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Répartition par jour de série</h3>
        <div className="grid grid-cols-7 gap-2 items-end">
          {DAYS.map((day) => {
            const count = stats.by_day?.[day] || 0;
            const height = Math.max(8, Math.round((count / maxDay) * 100));
            const isDay7 = day === "7";
            return (
              <div key={day} className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-black text-foreground">{count}</span>
                <div
                  className={`w-full rounded-t-xl ${isDay7 ? "bg-gradient-to-t from-[#FFD700]/40 to-[#FFD700]" : "bg-gradient-to-t from-violet-600/40 to-violet-500"}`}
                  style={{ height: `${height}px` }}
                />
                <span className={`text-[9px] font-black uppercase ${isDay7 ? "text-[#FFD700]" : "text-muted-foreground"}`}>J{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Globe size={14} className="text-violet-500" /> Par fuseau horaire
          </h3>
          <div className="space-y-2">
            {stats.by_timezone.length === 0 && (
              <p className="text-xs text-muted-foreground font-bold">Aucune donnée pour le moment.</p>
            )}
            {stats.by_timezone.map((tz) => (
              <div key={tz.timezone} className="flex items-center justify-between bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5">
                <p className="text-xs font-mono font-bold text-foreground">{tz.timezone}</p>
                <p className="text-[10px] font-black text-muted-foreground">
                  <span className="text-violet-500">{tz.players}</span> joueur(s) • <span className="text-orange-500">{tz.checkins}</span> check-in(s)
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Globe size={14} className="text-violet-500" /> Par pays
          </h3>
          <div className="space-y-2">
            {stats.by_country.length === 0 && (
              <p className="text-xs text-muted-foreground font-bold">Aucune donnée pour le moment.</p>
            )}
            {stats.by_country.map((c) => (
              <div key={c.country} className="flex items-center justify-between bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5">
                <p className="text-xs font-bold text-foreground">{c.country}</p>
                <p className="text-[10px] font-black text-violet-500">{c.players} joueur(s)</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckInsAdminTab;
