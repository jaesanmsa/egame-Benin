"use client";

import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Users, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";

/**
 * Options d'affichage de la preuve sociale.
 * Passe simplement la valeur à false pour désactiver un élément :
 *  - showTotal         : compteur public du nombre de joueurs inscrits
 *  - showToday         : nombre de nouveaux joueurs inscrits aujourd'hui
 *  - showNotifications : notifications temps réel à chaque inscription
 */
const FEATURES = {
  showTotal: true,
  showToday: true,
  showNotifications: true,
};

/** Délai minimum (ms) entre deux notifications pour éviter le spam d'inscriptions simultanées. */
const TOAST_COOLDOWN_MS = 5000;

interface CommunityStats {
  total_players: number;
  new_today: number;
  stats_date: string;
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
  const lastToastAt = useRef(0);

  // 1. Chargement initial : une seule ligne, aucun COUNT côté client.
  useEffect(() => {
    supabase
      .from("community_stats")
      .select("total_players, new_today, stats_date")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setStats({ total_players: data.total_players, new_today: data.new_today, stats_date: data.stats_date });
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
          setStats({ total_players: payload.new.total_players, new_today: payload.new.new_today, stats_date: payload.new.stats_date });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_events" },
        (payload: any) => {
          if (!FEATURES.showNotifications) return;
          // Anti-spam : si une notification vient d'apparaître, on ignore les suivantes.
          if (Date.now() - lastToastAt.current < TOAST_COOLDOWN_MS) return;
          lastToastAt.current = Date.now();
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

  // Jour courant au Bénin (GMT+1) : si la base n'a pas encore basculé de jour,
  // le compteur du jour est considéré comme réinitialisé à zéro.
  const beninToday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Porto-Novo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const todayCount = stats.stats_date === beninToday ? stats.new_today : 0;

  return (
    <>
      {/* ============ BANDEAU PREUVE SOCIALE ============ */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="relative bg-[#0F0F1E] border border-[#8A2BE2]/30 rounded-3xl px-5 py-5 md:px-8 md:py-6 overflow-hidden shadow-xl">
          <div className="absolute -top-20 -right-16 w-64 h-64 bg-[#8A2BE2]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-5 lg:gap-10">
            <div className="text-center lg:text-left space-y-1 min-w-0">
              <div className="flex items-center justify-center lg:justify-start gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#8A2BE2]/20 border border-[#8A2BE2]/40 flex items-center justify-center shrink-0">
                  <Users size={16} className="text-[#A855F7]" />
                </div>
                <h2 className="text-base md:text-lg font-gaming font-black uppercase text-white leading-tight">
                  La communauté eGame grandit ! 🎮
                </h2>
              </div>
              <p className="text-[11px] md:text-xs text-[#8888AA] font-esport">
                Rejoins les joueurs qui construisent la nouvelle génération eSport au Bénin et en Afrique.
              </p>
              <p className="text-[10px] text-[#A855F7]/80 font-esport italic">
                Et le prochain joueur, c'est peut-être toi.
              </p>
            </div>

            <div className="flex items-center gap-5 md:gap-8 shrink-0">
              {FEATURES.showTotal && (
                <div className="text-center">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={stats.total_players}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className={`block text-3xl md:text-4xl font-gaming font-black tracking-tight leading-none transition-colors duration-500 ${
                        pulse ? "text-[#FFD700] text-glow-gold" : "text-white"
                      }`}
                    >
                      {formatNumber(stats.total_players)}
                    </motion.span>
                  </AnimatePresence>
                  <p className="text-[9px] font-gaming font-bold uppercase tracking-widest text-[#A855F7] mt-1.5">
                    Joueurs inscrits
                  </p>
                </div>
              )}

              {FEATURES.showToday && todayCount > 0 && (
                <>
                  <div className="w-px h-10 bg-[#8A2BE2]/25" />
                  <div className="text-center">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={todayCount}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="block text-2xl md:text-3xl font-gaming font-black tracking-tight leading-none text-emerald-400"
                      >
                        +{formatNumber(todayCount)}
                      </motion.span>
                    </AnimatePresence>
                    <p className="text-[9px] font-gaming font-bold uppercase tracking-widest text-emerald-400/80 mt-1.5">
                      Aujourd'hui
                    </p>
                  </div>
                </>
              )}

              <div className="hidden sm:flex flex-col items-center gap-1 pl-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[8px] font-gaming font-black uppercase tracking-widest text-emerald-400">
                  En direct
                </span>
              </div>
            </div>

            <Link
              to="/auth"
              className="btn-glow-border shrink-0 px-6 py-3.5 text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 w-full sm:w-auto lg:w-auto"
            >
              <UserPlus size={14} />
              Rejoindre la communauté
            </Link>
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
                      🎮 <span className="text-[#A855F7]">{toast.username}</span> vient de rejoindre eGame Bénin !
                    </>
                  ) : (
                    <>🎮 Un nouveau joueur vient de rejoindre eGame Bénin !</>
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
