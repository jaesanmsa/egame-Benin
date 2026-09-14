"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import VSBackground from '@/components/VSBackground';
import TournamentCard from '@/components/TournamentCard';
import { motion } from 'framer-motion';
import { Trophy, Shield, Smartphone, Award, ArrowRight, Users, Sparkles, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const ALL_GAMES = [
  { id: 'brawl-stars', name: 'Brawl Stars', image: '/brawl stars.jpg' },
  { id: 'clash-of-clans', name: 'Clash of Clans', image: '/clash of clans.webp' },
  { id: 'clash-royale', name: 'Clash Royale', image: '/clash royal.webp' },
  { id: 'cod-mobile', name: 'COD Mobile', image: '/cod mobile.webp' },
  { id: 'free-fire', name: 'Free Fire', image: '/freefire.webp' },
  { id: 'mobile-legends', name: 'Mobile Legends', image: '/mobile legend.webp' },
  { id: 'pubg-mobile', name: 'PUBG Mobile', image: '/pubg-mobile.webp' }
];

const Index = () => {
  const [activeTournaments, setActiveTournaments] = useState<any[]>([]);
  const [activeGames, setActiveGames] = useState<Set<string>>(new Set());
  const [hallOfFame, setHallOfFame] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Récupération des tournois actifs
      const { data: tours } = await supabase
        .from('tournaments')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (tours) {
        setActiveTournaments(tours);
        const activeSet = new Set<string>();
        tours.forEach(t => {
          const matched = ALL_GAMES.find(g => t.game.toLowerCase().includes(g.name.toLowerCase()));
          if (matched) activeSet.add(matched.id);
        });
        setActiveGames(activeSet);
      }

      // 2. Récupération des champions récents pour le Hall of Fame
      const { data: champions } = await supabase
        .from('tournaments')
        .select('winner_name, winner_avatar, title, game, prize_pool')
        .eq('status', 'finished')
        .not('winner_name', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(3);

      if (champions) setHallOfFame(champions);

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-32">
      <SEO />
      <Navbar />
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center pt-24 pb-16 overflow-hidden">
        {/* Vidéo de fond en slow motion */}
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-25">
            <source src="/hero-video.webm" type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/60 via-[#0A0A0F]/80 to-[#0A0A0F]" />
        </div>

        {/* Effets de grille et lumière violets */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <VSBackground />
        </div>

        {/* Logo d'en-tête */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 w-full text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 text-[#A855F7] text-xs font-gaming font-extrabold tracking-widest uppercase mb-6 shadow-lg shadow-[#8A2BE2]/20">
            <Sparkles size={14} className="text-[#FFD700]" />
            L'Arène Élite d'Afrique
          </div>
        </div>

        {/* Contenu principal du Héros */}
        <div className="relative z-20 max-w-4xl mx-auto px-6 text-center space-y-8 my-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-6xl md:text-7xl font-gaming font-black leading-tight tracking-tight uppercase"
          >
            Domine le jeu. <br />
            <span className="text-[#FFD700] text-glow-gold">
              Encaisse la victoire.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[#8888AA] text-base md:text-xl font-medium max-w-2xl mx-auto font-esport tracking-wide"
          >
            La plateforme eSport panafricaine. Affronte les meilleurs joueurs du continent, participe à des tournois officiels et retire tes gains directement par Mobile Money.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button 
              onClick={() => navigate('/jeux')}
              className="w-full sm:w-auto btn-glow-border px-8 py-4 text-xs tracking-widest uppercase flex items-center justify-center gap-3"
            >
              Explorer les tournois
              <ArrowRight size={16} />
            </button>

            {isLoggedIn ? (
              <button
                onClick={() => navigate('/profil')}
                className="w-full sm:w-auto px-8 py-4 border border-[#8A2BE2]/50 hover:border-[#8A2BE2] bg-[#0F0F1E]/80 hover:bg-[#8A2BE2]/10 rounded-2xl text-xs font-gaming font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-3"
              >
                <User size={16} />
                Mon Profil
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto px-8 py-4 border border-[#8A2BE2]/50 hover:border-[#8A2BE2] bg-[#0F0F1E]/80 hover:bg-[#8A2BE2]/10 rounded-2xl text-xs font-gaming font-bold uppercase tracking-widest text-white transition-all"
              >
                S'inscrire
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* 2. SECTION TOURNOIS ACTIFS */}
      <section className="max-w-7xl mx-auto px-6 py-16 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-2xl font-gaming font-black uppercase text-white tracking-wide">
              Tournois <span className="text-[#8A2BE2]">Actifs</span>
            </h2>
          </div>
          <Link to="/jeux" className="text-xs font-gaming font-bold text-[#A855F7] hover:underline uppercase tracking-wider">
            Tout voir →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[16/10] bg-[#0F0F1E] rounded-3xl animate-pulse border border-[#8A2BE2]/20" />
            ))}
          </div>
        ) : activeTournaments.length === 0 ? (
          <div className="text-center py-16 bg-[#0F0F1E] rounded-3xl border border-[#8A2BE2]/20">
            <Trophy size={48} className="mx-auto text-[#8888AA] mb-4 opacity-40" />
            <p className="text-[#8888AA] font-gaming font-bold">Aucun tournoi actif en ce moment.</p>
            <p className="text-xs text-[#8888AA]/70 mt-1">Reviens très vite pour de nouveaux affrontements !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTournaments.map((t) => (
              <TournamentCard 
                key={t.id}
                id={t.id}
                title={t.title}
                game={t.game}
                image={t.image_url}
                date={new Date(t.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                participants={`${t.max_participants} places`}
                entryFee={t.entry_fee.toString()}
                prizePool={t.prize_pool}
                type={t.type as any}
                status="active"
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. SECTION JEUX DISPONIBLES */}
      <section className="max-w-7xl mx-auto px-6 py-16 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-gaming font-black uppercase text-white">
            Jeux <span className="text-[#8A2BE2]">Disponibles</span>
          </h2>
          <p className="text-sm text-[#8888AA] font-esport">Sélectionne ta discipline et entre dans l'arène</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-4">
          {ALL_GAMES.map((game) => {
            const hasActive = activeGames.has(game.id);
            return (
              <Link key={game.id} to={`/game/${game.id}`}>
                <motion.div 
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#8A2BE2]/20 hover:border-[#8A2BE2] shadow-xl bg-[#0F0F1E] cursor-pointer"
                >
                  <img 
                    src={game.image} 
                    alt={game.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />
                  
                  {/* Point Vert Animé si tournoi actif */}
                  {hasActive && (
                    <div className="absolute top-3 right-3 bg-emerald-500/90 w-3 h-3 rounded-full animate-ping border-2 border-white" />
                  )}

                  <div className="absolute bottom-3 left-3 right-3 text-center">
                    <p className="font-gaming font-extrabold text-xs text-white uppercase group-hover:text-[#A855F7] transition-colors">
                      {game.name}
                    </p>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. SECTION POURQUOI EGAME BÉNIN */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-[#0F0F1E] border border-[#8A2BE2]/30 rounded-3xl p-8 md:p-12 space-y-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8A2BE2]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-gaming font-black uppercase text-white">
              Pourquoi <span className="text-[#FFD700]">eGame Bénin</span> ?
            </h2>
            <p className="text-sm text-[#8888AA]">L'excellence eSport avec la garantie d'une plateforme 100% fiable</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-[#0A0A0F] p-6 rounded-2xl border border-[#8A2BE2]/20 space-y-3 text-center">
              <div className="w-12 h-12 bg-[#8A2BE2]/20 text-[#8A2BE2] rounded-xl flex items-center justify-center mx-auto">
                <Smartphone size={24} />
              </div>
              <h3 className="font-gaming font-bold text-sm text-white">Cash Prizes Mobile Money</h3>
              <p className="text-xs text-[#8888AA] leading-relaxed">Paiement ultra-rapide des récompenses via MTN, Moov et Celtiis.</p>
            </div>

            <div className="bg-[#0A0A0F] p-6 rounded-2xl border border-[#8A2BE2]/20 space-y-3 text-center">
              <div className="w-12 h-12 bg-[#8A2BE2]/20 text-[#8A2BE2] rounded-xl flex items-center justify-center mx-auto">
                <Shield size={24} />
              </div>
              <h3 className="font-gaming font-bold text-sm text-white">Transparents & Sécurisés</h3>
              <p className="text-xs text-[#8888AA] leading-relaxed">Règlements clairs, arbitres dédiés et système anti-triche strict.</p>
            </div>

            <div className="bg-[#0A0A0F] p-6 rounded-2xl border border-[#8A2BE2]/20 space-y-3 text-center">
              <div className="w-12 h-12 bg-[#8A2BE2]/20 text-[#8A2BE2] rounded-xl flex items-center justify-center mx-auto">
                <Users size={24} />
              </div>
              <h3 className="font-gaming font-bold text-sm text-white">Communauté Panafricaine</h3>
              <p className="text-xs text-[#8888AA] leading-relaxed">Rejoins des millions de passionnés, de Dakar à Nairobi et de Casablanca à Johannesburg. Toute l'Afrique se retrouve dans l'arène.</p>
            </div>

            <div className="bg-[#0A0A0F] p-6 rounded-2xl border border-[#8A2BE2]/20 space-y-3 text-center">
              <div className="w-12 h-12 bg-[#8A2BE2]/20 text-[#FFD700] rounded-xl flex items-center justify-center mx-auto">
                <Award size={24} />
              </div>
              <h3 className="font-gaming font-bold text-sm text-white">Classement National</h3>
              <p className="text-xs text-[#8888AA] leading-relaxed">Marque des points, débloque des badges et monte au sommet de l'Élite.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION CHAMPIONS / HALL OF FAME */}
      <section className="max-w-7xl mx-auto px-6 py-16 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-gaming font-black uppercase text-white">
            Derniers <span className="text-[#FFD700]">Champions</span>
          </h2>
          <p className="text-sm text-[#8888AA]">Ils ont dominé le jeu et empoché le Cash Prize</p>
        </div>

        {hallOfFame.length === 0 ? (
          <div className="bg-[#0F0F1E] border border-[#FFD700]/30 rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-6">
            <Trophy size={64} className="mx-auto text-[#FFD700] animate-pulse" />
            <div className="space-y-2">
              <h3 className="text-xl font-gaming font-bold text-white">Sois le premier champion !</h3>
              <p className="text-xs text-[#8888AA]">Inscris-toi maintenant à un tournoi et entre dans la légende eGame Bénin.</p>
            </div>
            <button 
              onClick={() => navigate('/jeux')}
              className="btn-gold px-8 py-4 text-xs tracking-widest uppercase"
            >
              Inscris-toi maintenant
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hallOfFame.map((c, i) => (
              <div key={i} className="esport-card-gold p-6 text-center space-y-4">
                <div className="text-4xl">{c.winner_avatar || "🏆"}</div>
                <div>
                  <h3 className="font-gaming font-bold text-lg text-white">{c.winner_name}</h3>
                  <p className="text-xs text-[#A855F7] font-bold uppercase">{c.game} • {c.title}</p>
                </div>
                <div className="bg-[#0A0A0F] py-2 px-4 rounded-xl inline-block border border-[#FFD700]/40">
                  <span className="text-[#FFD700] font-gaming font-black text-sm">Gagné : {c.prize_pool}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PIED DE PAGE */}
      <footer className="border-t border-[#8A2BE2]/20 pt-16 pb-12 text-center space-y-6">
        <Logo size="md" className="justify-center" />
        <div className="flex flex-wrap justify-center gap-6 text-xs text-[#8888AA] font-bold uppercase tracking-wider">
          <Link to="/about" className="hover:text-white">À propos</Link>
          <Link to="/contact" className="hover:text-white">Contact</Link>
          <Link to="/privacy" className="hover:text-white">Confidentialité</Link>
          <Link to="/classement" className="hover:text-white">Classement</Link>
        </div>
        <p className="text-[10px] text-[#8888AA]/50 font-gaming uppercase tracking-widest">
          © 2026 eGame Bénin • L'arène eSport de l'Afrique
        </p>
      </footer>
    </div>
  );
};

export default Index;