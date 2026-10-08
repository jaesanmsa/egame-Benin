"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Trophy, UsersRound, Swords } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PlatformStatsRow {
  total_players: number | null;
  tournaments_organized: number | null;
  competition_players: number | null;
}

const formatNumber = (n: number) => n.toLocaleString("fr-FR");

const PlatformStats = () => {
  const [row, setRow] = useState<PlatformStatsRow | null>(null);
  const [partnerCount, setPartnerCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Les statistiques agrégées viennent de la vue publique ; le compteur partenaires
  // est compté directement sur les seules entrées visibles et officiellement confirmées.
  useEffect(() => {
    Promise.all([
      supabase.from("public_platform_stats").select("total_players,tournaments_organized,competition_players").maybeSingle(),
      supabase.from("partners").select("id", { count: "exact", head: true }).eq("visible", true).eq("is_official", true),
    ]).then(([statsResult, partnersResult]) => {
      if (statsResult.data) setRow(statsResult.data as PlatformStatsRow);
      setPartnerCount(partnersResult.count ?? 0);
      setLoaded(true);
    });
  }, []);

  if (!loaded || !row) return null;

  const stats = [
    { icon: Users, value: row.total_players, label: "Joueurs inscrits", color: "text-[#A855F7]" },
    { icon: Trophy, value: row.tournaments_organized, label: "Compétitions organisées", color: "text-[#FFD700]" },
    { icon: UsersRound, value: partnerCount, label: "Partenaires", color: "text-emerald-400", alwaysShow: true },
    { icon: Swords, value: row.competition_players, label: "Participants aux compétitions", color: "text-cyan-400" },
  ].filter((s) => typeof s.value === "number" && ((s.value as number) > 0 || s.alwaysShow));

  if (stats.length < 2) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-gaming font-black uppercase text-white">
          Nos <span className="text-[#FFD700]">résultats</span> en chiffres
        </h2>
        <p className="text-sm text-[#8888AA] font-esport">Des indicateurs issus directement des données réelles de la plateforme.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.08, 0.24) }}
            className="bg-[#0F0F1E] border border-[#8A2BE2]/25 rounded-3xl p-6 md:p-8 text-center space-y-3 shadow-xl"
          >
            <s.icon size={24} className={`mx-auto ${s.color}`} />
            <p className="text-3xl md:text-4xl font-gaming font-black tracking-tight text-white leading-none">
              {formatNumber(s.value as number)}
            </p>
            <p className="text-[10px] font-gaming font-bold uppercase tracking-widest text-[#8888AA] leading-snug">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PlatformStats;
