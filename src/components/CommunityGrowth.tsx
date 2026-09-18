"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";

/**
 * Options d'affichage de la preuve sociale.
 * Passe simplement la valeur à false pour désactiver un élément :
 *  - showTotal        : compteur public du nombre de joueurs inscrits
 *  - showToday        : nombre de nouveaux joueurs inscrits aujourd'hui
 *  - showNotifications : notifications temps réel à chaque inscription
 */
const FEATURES = {
  showTotal: true,
  showToday: true,
  showNotifications: true,
};

interface CommunityStats {
  total_players: number;
  new_today: number;
}

interface JoinToast {
  key: number;
  username: string | null;
  avatar_url: string | null;
}

const formatNumber = (n: number) => n.toLocaleString("fr-FR");

const CommunityGrowth = () => {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState<JoinToast | null>(null);
  const [pulse, setPulse] = useState(false);
  const prevTotal = useRef<number | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Chargement initial : une seule ligne, aucun COUNT côté client.
  useEffect(() => {
    supabase
      .from("community_stats")
      .select("total_players, new_today")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setStats({ total_players: data.total_players, new_today: data.new_today });
        setLoaded(true);
      });
  }, []);

  // 2. Temps réel : compteurs poussés par la base + notification à chaque inscription.
  useEffect(() => {
    const channel = supabase
      .channel("community-growth")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "community_stats", filter: "id=1" },
        (payload: any) => {
          setStats({ total_players: payload.new.total_players, new_today: payload.new.new_today });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_events" },
        (payload: any) => {
          if (!FEATURES.showNotifications) return;
          // Données publiques uniquement : pseudo et avatar, rien d'autre.
          setToast({ key: Date.now(), username: payload.new.username, avatar_url: payload.new.avatar_url });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 3. Animation légère quand le compteur augmente.
  useEffect(() => {
    if (prevTotal.current !== null && stats && stats.total_players > prevTotal.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 1200);
      return () => clearTimeout(t);
    }
    if (stats) prevTotal.current = stats.total_players;
  }, [stats?.total_players]);

  useEffect(() => {
    if (stats) prevTotal.current = stats.total_players;
  }, [stats]);

  // 4. Disparition automatique de la notification.
  useEffect(() => {
    if (!toast) return;
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 6000);
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [toast]);

  if (!FEATURES.showTotal && !FEATURES.showToday) return null;
  if (!loaded) return null;
  if (!stats) return null;
  if (stats.total_players <= 0) return null;

  return (
    <>
      {/* ============ SECTION PREUVE SOCIALE ============ */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="relative bg-[#0F0F1E] border border-[#8A2BE2]/30 rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl">
          <div className="absolute -top-32 -right-24 w-96 h-96 bg-[#8A2BE2]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-[10px] font-gaming font-extrabold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              En direct
            </div>
            <h2 className="text-2xl md:text-3xl font-gaming font-black uppercase text-white">
              La communauté eGame grandit 🎮
            </h2>
            <p className="text-sm text-[#8888AA] font-esport">
              Rejoins les joueurs qui construisent la nouvelle génération eSport au Bénin.
            </p>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {FEATURES.showTotal && (
              <div className="bg-[#0A0A0F] border border-[#8A2BE2]/30 rounded-3xl p-8 text-center space-y-2">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={stats.total_players}
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -14, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`block text-4xl md:text-5xl font-gaming font-black tracking-tight transition-colors duration-500 ${
                      pulse ? "text-[#FFD700] text-glow-gold" : "text-white"
                    }`}
                  >
                    {formatNumber(stats.total_players)}
                  </motion.span>
                </AnimatePresence>
                <p className="text-xs font-gaming font-bold uppercase tracking-widest text-[#A855F7]">
                  Joueurs inscrits
                </p>
                <p className="text-[11px] text-[#8888AA] font-esport italic pt-1">
                  Et le prochain joueur, c'est peut-être toi.
                </p>
              </div>
            )}

            {FEATURES.showToday && (
              <div className="bg-[#0A0A0F] border border-emerald-500/25 rounded-3xl p-8 text-center space-y-2 flex flex-col justify-center">
                {stats.new_today > 0 ? (
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={stats.new_today}
                      initial={{ y: 14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -14, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="block text-4xl md:text-5xl font-gaming font-black tracking-tight text-emerald-400"
                    >
                      +{formatNumber(stats.new_today)}
                    </motion.span>
                  </AnimatePresence>
                ) : (
                  <span className="block text-4xl md:text-5xl font-gaming font-black tracking-tight text-[#8888AA]/40">
                    —
                  </span>
                )}
                <p className="text-xs font-gaming font-bold uppercase tracking-widest text-emerald-400/80 flex items-center justify-center gap-1.5">
                  <TrendingUp size={13} />
                  Nouveaux aujourd'hui
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ NOTIFICATION TEMPS RÉEL ============ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            initial={{ x: -60, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -30, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="fixed left-4 bottom-24 md:bottom-6 z-[45] max-w-[calc(100vw-2rem)]"
          >
            <div className="flex items-center gap-3 bg-[#0F0F1E]/95 backdrop-blur-xl border border-[#8A2BE2]/50 rounded-2xl pl-3 pr-5 py-3 shadow-2xl shadow-black/60">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#8A2BE2]/20 border border-[#8A2BE2]/40 flex items-center justify-center shrink-0">
                {toast.avatar_url ? (
                  <img src={toast.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Gamepad2 size={18} className="text-[#A855F7]" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-gaming font-bold text-white leading-snug">
                  {toast.username ? (
                    <>
                      🎮 <span className="text-[#A855F7]">{toast.username}</span> vient de rejoindre eGame
                    </>
                  ) : (
                    <>🔥 Un nouveau joueur vient de rejoindre eGame !</>
                  )}
                </p>
                <p className="text-[10px] text-[#8888AA] mt-0.5">Il y a quelques secondes</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CommunityGrowth;
