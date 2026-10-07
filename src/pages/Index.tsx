"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import VSBackground from '@/components/VSBackground';
import TournamentCard from '@/components/TournamentCard';
import PlatformStats from '@/components/PlatformStats';
import PartnersSection from '@/components/PartnersSection';
import TikTokLogo from '@/components/TikTokLogo';
import DiscordLogo from '@/components/DiscordLogo';
import { motion } from 'framer-motion';
import { Trophy, ArrowRight, Sparkles, User, Gamepad2, CreditCard, Hash } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatBeninShort } from '@/utils/datetime';
import { MAIN_DISCORD_INVITE } from '@/lib/discord';

const GAMES = [
  { id: 'blood-strike', name: 'Blood Strike', image: '/blood strike.jpg' },
  { id: 'brawl-stars', name: 'Brawl Stars', image: '/brawl stars.jpg' },
  { id: 'clash-of-clans', name: 'Clash of Clans', image: '/clash of clans.webp' },
  { id: 'clash-royale', name: 'Clash Royale', image: '/clash royal.webp' },
  { id: 'cod-mobile', name: 'COD Mobile', image: '/cod mobile.webp' },
  { id: 'efootball-mobile', name: 'eFootball Mobile', image: '/efootball.webp' },
  { id: 'free-fire', name: 'Free Fire', image: '/freefire.webp' },
  { id: 'mobile-legends', name: 'Mobile Legends', image: '/mobile legend.webp' },
  { id: 'pubg-mobile', name: 'PUBG Mobile', image: '/pubg-mobile.webp' },
];

const HOW_IT_WORKS = [
  { icon: User, title: 'Crée ton compte', text: 'Inscris-toi et complète ton profil joueur.' },
  { icon: Trophy, title: 'Choisis un tournoi', text: 'Consulte les tournois ouverts et leurs conditions.' },
  { icon: CreditCard, title: 'Confirme ton inscription', text: 'Choisis un moyen de paiement disponible pour le tournoi.' },
  { icon: Hash, title: 'Rejoins la compétition', text: 'Suis les informations du tournoi et joue à l’heure prévue.' },
];

const Index = () => {
  const [activeTournaments, setActiveTournaments] = useState<any[]>([]);
  const [activeGames, setActiveGames] = useState<Set<string>>(new Set());
  const [hasPartners, setHasPartners] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setIsLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: tours }, { count: partnerCount }] = await Promise.all([
        supabase.from('tournaments').select('*').eq('status', 'active').eq('is_test', false).order('start_date', { ascending: true }),
        supabase.from('partners').select('id', { count: 'exact', head: true }).eq('visible', true).eq('is_official', true),
      ]);

      const tournaments = tours ?? [];
      setActiveTournaments(tournaments);
      const activeSet = new Set<string>();
      tournaments.forEach((t: any) => {
        const matched = GAMES.find(g => t.game?.toLowerCase().includes(g.name.toLowerCase()));
        if (matched) activeSet.add(matched.id);
      });
      setActiveGames(activeSet);
      setHasPartners((partnerCount ?? 0) > 0);
      setLoading(false);
    };
    fetchData();
  }, []);

  const now = Date.now();
  const upcomingTournaments = activeTournaments
    .filter((t) => !t.start_date || new Date(t.start_date).getTime() >= now)
    .slice(0, 3);
  const liveTournaments = activeTournaments
    .filter((t) => t.start_date && new Date(t.start_date).getTime() < now)
    .slice(0, 3);
  const featuredTournaments = upcomingTournaments.length ? upcomingTournaments : liveTournaments;
  const tournamentSectionTitle = upcomingTournaments.length ? 'Tournois en cours et à venir' : 'Tournois en cours';

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-32">
      <SEO
        title="eGame Bénin | Tournois gaming"
        description="Participe à des tournois gaming, affronte d’autres joueurs et construis ton parcours sur eGame Bénin."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[68vh] flex flex-col justify-center items-center pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#0A0A0F]">
          <video autoPlay loop muted playsInline preload="auto" className="w-full h-full object-cover opacity-25">
            <source src="/hero-video.webm" type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/60 via-[#0A0A0F]/80 to-[#0A0A0F]" />
        </div>
        <div className="absolute inset-0 z-10 pointer-events-none"><VSBackground /></div>
        <div className="relative z-20 max-w-4xl mx-auto px-5 sm:px-6 text-center space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 text-[#A855F7] text-[10px] sm:text-xs font-gaming font-extrabold tracking-widest uppercase shadow-lg shadow-[#8A2BE2]/20">
            <Sparkles size={14} className="text-[#FFD700]" /> eGame Bénin
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl sm:text-6xl md:text-7xl font-gaming font-black leading-tight tracking-tight uppercase"
          >
            Entre dans la <span className="text-[#FFD700] text-glow-gold">compétition.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-[#B1B1C4] font-medium leading-relaxed"
          >
            Participe à des tournois gaming, affronte d’autres joueurs et construis ton parcours sur eGame Bénin.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2"
          >
            <button onClick={() => navigate('/jeux')} className="w-full sm:w-auto min-h-12 btn-glow-border px-7 py-3.5 text-xs tracking-widest uppercase flex items-center justify-center gap-3">
              Voir les tournois <ArrowRight size={16} />
            </button>
            <a href={MAIN_DISCORD_INVITE} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto min-h-12 px-7 py-3.5 border border-[#5865F2]/60 hover:border-[#5865F2] bg-[#0F0F1E]/80 hover:bg-[#5865F2]/15 rounded-2xl text-xs font-gaming font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-3">
              <DiscordLogo size={16} /> Rejoindre Discord
            </a>
          </motion.div>
          {!isLoggedIn ? (
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="mx-auto inline-flex min-h-11 items-center justify-center rounded-xl border border-[#A855F7]/60 bg-[#8A2BE2]/15 px-6 py-3 text-[11px] font-gaming font-black uppercase tracking-widest text-white shadow-lg shadow-[#8A2BE2]/15 transition-all hover:border-[#A855F7] hover:bg-[#8A2BE2]/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#A855F7]"
            >
              Créer un compte eGame
            </button>
          ) : (
            <button
              onClick={() => navigate('/profil')}
              className="mx-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#A855F7]/60 bg-[#8A2BE2]/15 px-6 py-3 text-[11px] font-gaming font-black uppercase tracking-widest text-white transition-all hover:border-[#A855F7] hover:bg-[#8A2BE2]/30"
            >
              <User size={15} /> Mon profil eGame
            </button>
          )}
        </div>
      </section>

      {/* Tournois actuels et à venir. L'historique reste accessible depuis les pages des jeux. */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-12 sm:py-16 space-y-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-gaming font-bold uppercase tracking-[0.2em] text-[#A855F7]">Compétition</p>
            <h2 className="text-xl sm:text-2xl font-gaming font-black uppercase text-white mt-1">{tournamentSectionTitle}</h2>
          </div>
          <Link to="/jeux" className="text-xs font-gaming font-bold text-[#A855F7] hover:underline uppercase tracking-wider">Tous les tournois →</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="aspect-[16/10] bg-[#0F0F1E] rounded-3xl animate-pulse border border-[#8A2BE2]/20" />)}
          </div>
        ) : featuredTournaments.length === 0 ? (
          <div className="rounded-3xl border border-[#8A2BE2]/20 bg-[#0F0F1E] px-5 py-10 text-center">
            <Trophy size={36} className="mx-auto text-[#A855F7] mb-3 opacity-70" />
            <p className="text-sm font-gaming font-bold text-white">Aucun tournoi annoncé pour le moment.</p>
            <p className="text-xs text-[#8888AA] mt-2">Les résultats des événements passés restent consultables dans l’historique.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredTournaments.map((t: any) => (
              <TournamentCard key={t.id} id={t.id} title={t.title} game={t.game} image={t.image_url}
                date={formatBeninShort(t.start_date)} participants={`${t.max_participants} places`}
                entryFee={t.entry_fee.toString()} prizePool={t.prize_pool} type={t.type as any}
                status="active" isTest={false} />
            ))}
          </div>
        )}
      </section>

      {/* Comment ça marche — résumé compact en quatre étapes */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-gaming font-bold uppercase tracking-[0.2em] text-[#A855F7]">Simple et accessible</p>
            <h2 className="text-xl sm:text-2xl font-gaming font-black uppercase text-white mt-1">Comment ça marche</h2>
          </div>
          <Link to="/about" className="text-[10px] sm:text-xs font-gaming font-bold text-[#A855F7] hover:underline uppercase tracking-wider">En savoir plus →</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {HOW_IT_WORKS.map((step, index) => (
            <div key={step.title} className="min-w-0 rounded-xl border border-[#8A2BE2]/20 bg-[#0F0F1E] p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#8A2BE2]/15 flex items-center justify-center shrink-0">
                <step.icon size={16} className="text-[#A855F7]" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] sm:text-[9px] font-gaming font-black uppercase tracking-wider text-[#A855F7]">Étape {index + 1}</p>
                <h3 className="text-[10px] sm:text-xs font-gaming font-bold uppercase leading-tight text-white break-words">{step.title}</h3>
                <p className="hidden sm:block text-[10px] text-[#8888AA] leading-snug mt-1">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Présentation des jeux sans promettre un tournoi pour chacun */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-12 sm:py-16 space-y-7">
        <div className="text-center space-y-2">
          <p className="text-[10px] font-gaming font-bold uppercase tracking-[0.2em] text-[#A855F7]">Jeux pris en charge</p>
          <h2 className="text-2xl sm:text-3xl font-gaming font-black uppercase text-white">Jeux de la communauté</h2>
          <p className="text-sm text-[#8888AA]">Les tournois disponibles sont annoncés séparément selon leur calendrier.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {GAMES.map((game) => (
            <Link key={game.id} to={`/game/${game.id}`} className="group relative aspect-[4/3] min-w-0 rounded-2xl overflow-hidden border border-[#8A2BE2]/20 hover:border-[#8A2BE2] bg-[#0F0F1E]">
              <img src={game.image} alt={game.name} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07070C]/95 via-[#07070C]/20 to-transparent" />
              {activeGames.has(game.id) && <span className="absolute top-2 right-2 rounded-full bg-emerald-950/90 border border-emerald-500/50 px-2 py-1 text-[8px] font-gaming font-black uppercase text-emerald-300">Tournoi actif</span>}
              <span className="absolute bottom-3 left-3 right-3 text-center text-[10px] sm:text-xs font-gaming font-black uppercase leading-tight text-white break-words">{game.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Statistiques calculées uniquement à partir de données réelles */}
      <PlatformStats />

      {/* Communauté officielle */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-12 sm:py-16">
        <div className="rounded-3xl border border-[#5865F2]/30 bg-[#0F0F1E] p-6 sm:p-9 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            <p className="text-[10px] font-gaming font-bold uppercase tracking-[0.2em] text-[#A855F7]">Communauté officielle</p>
            <h2 className="text-xl sm:text-2xl font-gaming font-black uppercase text-white">Joue. Affronte. Gagne.</h2>
            <p className="text-sm text-[#8888AA] leading-relaxed">eGame Bénin développe le gaming compétitif au Bénin et ambitionne de connecter progressivement les joueurs à travers l’Afrique.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
            <a href={MAIN_DISCORD_INVITE} target="_blank" rel="noopener noreferrer" className="min-h-12 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] px-5 py-3 text-xs font-gaming font-black uppercase tracking-wider text-white flex items-center justify-center gap-2"><DiscordLogo size={17} /> Rejoindre Discord</a>
            <a href="https://tiktok.com/@egamebnin" target="_blank" rel="noopener noreferrer" className="min-h-12 rounded-xl border border-[#8A2BE2]/40 bg-[#07070C] hover:bg-[#8A2BE2]/10 px-5 py-3 text-xs font-gaming font-black uppercase tracking-wider text-white flex items-center justify-center gap-2"><TikTokLogo size={17} className="text-[#A855F7]" /> Suivre sur TikTok</a>
          </div>
        </div>
      </section>

      {/* Partenaires publics et officiellement confirmés uniquement. */}
      {hasPartners && <PartnersSection />}

      <footer className="border-t border-[#8A2BE2]/20 pt-10 sm:pt-12 pb-8 text-center space-y-5">
        <Logo size="md" className="justify-center" />
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 px-4 text-[10px] sm:text-xs text-[#8888AA] font-bold uppercase tracking-wider">
          <Link to="/about" className="hover:text-white">À propos</Link>
          <Link to="/devenir-partenaire" className="hover:text-white">Devenir partenaire</Link>
          <Link to="/contact" className="hover:text-white">Contact</Link>
          <Link to="/mentions-legales" className="hover:text-white">Mentions légales</Link>
          <Link to="/privacy" className="hover:text-white">Confidentialité & conditions</Link>
          <Link to="/classement" className="hover:text-white">Classement</Link>
        </div>
        <p className="px-4 text-[9px] sm:text-[10px] text-[#8888AA]/60 font-gaming uppercase tracking-wider sm:tracking-widest break-words">© 2026 eGame Bénin — <Link to="/privacy" className="hover:text-[#8A2BE2] transition-colors">Informations légales et conditions</Link></p>
      </footer>
    </div>
  );
};

export default Index;
