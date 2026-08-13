"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Globe, MapPin, Share2, Trophy, ArrowRight, Zap } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { showSuccess } from '@/utils/toast';

interface TournamentProps {
  id: string;
  title: string;
  game: string;
  image: string;
  date: string;
  participants: string;
  entryFee: string;
  prizePool?: string;
  type: 'Online' | 'Presentiel';
  status?: 'active' | 'finished';
}

const TournamentCard = ({ id, title, game, image, date, participants, entryFee, prizePool = "50.000 FCFA", type, status = 'active' }: TournamentProps) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/tournament/${id}`;
    if (navigator.share) {
      navigator.share({ title, text: `Rejoins le tournoi ${game} sur eGame Bénin !`, url });
    } else {
      navigator.clipboard.writeText(url);
      showSuccess("Lien copié dans le presse-papier !");
    }
  };

  const handleClick = () => {
    if (!isLoggedIn) {
      navigate('/auth');
    } else {
      navigate(`/tournament/${id}`);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -6 }}
      onClick={handleClick}
      className={`group relative glass-panel overflow-hidden cursor-pointer ${
        status === 'finished' ? 'opacity-70 grayscale-[0.2]' : ''
      }`}
    >
      {/* Image de couverture */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={image || '/coc-tournament.webp'} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1E] via-[#0F0F1E]/40 to-transparent" />
        
        {/* Badge Mode */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge className="bg-[#07070C]/80 backdrop-blur-md text-white border border-[#8A2BE2]/40 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">
            {type === 'Online' ? <Globe size={12} className="text-cyan-400" /> : <MapPin size={12} className="text-orange-400" />}
            {type === 'Online' ? 'En ligne' : 'Présentiel'}
          </Badge>
        </div>

        {/* Badge Live */}
        {status === 'active' && (
          <div className="absolute top-3 right-3 flex items-center gap-2 bg-emerald-950/80 backdrop-blur-md border border-emerald-500/50 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest font-gaming">Ouvert</span>
          </div>
        )}

        <button 
          onClick={handleShare}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-[#07070C]/80 hover:bg-[#8A2BE2] text-white/80 hover:text-white border border-white/10 transition-colors"
        >
          <Share2 size={14} />
        </button>
      </div>

      {/* Contenu */}
      <div className="p-6 space-y-4">
        <div>
          <p className="text-[10px] font-extrabold text-[#A855F7] uppercase tracking-[0.2em] font-gaming mb-1 flex items-center gap-1.5">
            <Zap size={12} className="text-[#FFD700]" />
            {game}
          </p>
          <h3 className="font-gaming font-extrabold text-lg text-white group-hover:text-[#A855F7] transition-colors line-clamp-1">
            {title}
          </h3>
        </div>

        {/* Cash Prize */}
        <div className="bg-[#07070C] border border-[#FFD700]/40 p-3.5 rounded-2xl flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <Trophy className="text-[#FFD700]" size={20} />
            <span className="text-[10px] font-bold text-[#8888AA] uppercase tracking-wider">Cash Prize</span>
          </div>
          <span className="text-xl font-gaming font-black text-[#FFD700] text-glow-gold">
            {prizePool}
          </span>
        </div>

        {/* Metadonnées */}
        <div className="flex items-center justify-between text-xs font-semibold text-[#8888AA] pt-2 border-t border-[#8A2BE2]/15">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-[#8A2BE2]" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-[#8A2BE2]" />
            <span>{participants}</span>
          </div>
        </div>

        <button 
          className="w-full btn-neon py-3 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2"
        >
          S'inscrire • {entryFee} FCFA
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
};

export default TournamentCard;
</dyad-file>

<dyad-write path="src/pages/Index.tsx" description="Page d'accueil eSport refaite à neuf avec Hero, tournois en direct, catalogue de jeux et Hall of Fame.">
"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import VSBackground from '@/components/VSBackground';
import TournamentCard from '@/components/TournamentCard';
import { motion } from 'framer-motion';
import { Trophy, Shield, Smartphone, Award, ArrowRight, Gamepad2, Users, Sparkles, Flame } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const ALL_GAMES = [
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
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
    <div className="min-h-screen bg-[#07070C] text-white pb-32">
      <SEO />
      <Navbar />
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
          <VSBackground />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8 my-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#8A2BE2]/15 border border-[#8A2BE2]/40 text-[#A855F7] text-xs font-gaming font-extrabold tracking-widest uppercase shadow-lg shadow-[#8A2BE2]/20"
          >
            <Sparkles size={14} className="text-[#FFD700]" />
            L'Arène Élite eSport au Bénin
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
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
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-[#8888AA] text-base md:text-xl font-medium max-w-2xl mx-auto font-esport tracking-wide leading-relaxed"
          >
            Affronte les meilleurs gamers béninois, participe aux tournois officiels et retire tes Cash Prizes en direct par Mobile Money.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button 
              onClick={() => navigate('/jeux')}
              className="w-full sm:w-auto btn-neon px-9 py-4 text-xs tracking-widest uppercase flex items-center justify-center gap-3"
            >
              Explorer les tournois
              <ArrowRight size={16} />
            </button>

            <button 
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto px-9 py-4 border border-[#8A2BE2]/50 hover:border-[#8A2BE2] bg-[#0F0F1E]/80 rounded-2xl text-xs font-gaming font-bold uppercase tracking-widest text-white transition-all hover:bg-[#8A2BE2]/10"
            >
              Créer mon compte
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. SECTION TOURNOIS ACTIFS */}
      <section className="max-w-7xl mx-auto px-6 py-16 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="text-orange-500" size={24} />
            <h2 className="text-2xl font-gaming font-black uppercase text-white tracking-wide">
              Tournois <span className="text-[#8A2BE2]">Ouverts</span>
            </h2>
          </div>
          <Link to="/jeux" className="text-xs font-gaming font-bold text-[#A855F7] hover:underline uppercase tracking-wider">
            Tout le catalogue →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[16/10] bg-[#0F0F1E] rounded-3xl animate-pulse border border-[#8A2BE2]/20" />
            ))}
          </div>
        ) : activeTournaments.length === 0 ? (
          <div className="text-center py-16 glass-panel">
            <Trophy size={48} className="mx-auto text-[#8888AA] mb-4 opacity-40" />
            <p className="text-[#8888AA] font-gaming font-bold">Aucun tournoi actif en ce moment.</p>
            <p className="text-xs text-[#8888AA]/70 mt-1">Nouveaux affrontements très bientôt !</p>
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

      {/* 3. SECTION DISCIPLINES */}
      <section className="max-w-7xl mx-auto px-6 py-16 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-gaming font-black uppercase text-white">
            Catalogue <span className="text-[#8A2BE2]">eSport</span>
          </h2>
          <p className="text-sm text-[#8888AA] font-esport">Choisis ta discipline et rentre dans la arène</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07070C] via-transparent to-transparent" />
                  
                  {hasActive && (
                    <div className="absolute top-3 right-3 bg-emerald-500 w-3 h-3 rounded-full animate-ping border-2 border-white" />
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

      {/* 4. SECTION HALL OF FAME */}
      <section className="max-w-7xl mx-auto px-6 py-16 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-gaming font-black uppercase text-white">
            Hall of <span className="text-[#FFD700]">Fame</span>
          </h2>
          <p className="text-sm text-[#8888AA]">Les légendes qui ont décroché le Cash Prize</p>
        </div>

        {hallOfFame.length === 0 ? (
          <div className="glass-panel-gold p-12 text-center max-w-2xl mx-auto space-y-6">
            <Trophy size={56} className="mx-auto text-[#FFD700]" />
            <div className="space-y-2">
              <h3 className="text-xl font-gaming font-bold text-white">Inscris ton nom dans l'histoire !</h3>
              <p className="text-xs text-[#8888AA]">Rejoins un tournoi actif et deviens le prochain champion.</p>
            </div>
            <button 
              onClick={() => navigate('/jeux')}
              className="btn-gold-neon px-8 py-4 text-xs tracking-widest uppercase"
            >
              Voir les tournois
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hallOfFame.map((c, i) => (
              <div key={i} className="glass-panel-gold p-6 text-center space-y-4">
                <div className="text-4xl">{c.winner_avatar || "🏆"}</div>
                <div>
                  <h3 className="font-gaming font-bold text-lg text-white">{c.winner_name}</h3>
                  <p className="text-xs text-[#A855F7] font-bold uppercase">{c.game} • {c.title}</p>
                </div>
                <div className="bg-[#07070C] py-2 px-4 rounded-xl inline-block border border-[#FFD700]/40">
                  <span className="text-[#FFD700] font-gaming font-black text-sm">{c.prize_pool}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#8A2BE2]/20 pt-16 pb-12 text-center space-y-6">
        <Logo size="md" className="justify-center" />
        <div className="flex flex-wrap justify-center gap-6 text-xs text-[#8888AA] font-bold uppercase tracking-wider">
          <Link to="/about" className="hover:text-white">À propos</Link>
          <Link to="/contact" className="hover:text-white">Contact</Link>
          <Link to="/privacy" className="hover:text-white">Confidentialité</Link>
          <Link to="/classement" className="hover:text-white">Classement</Link>
        </div>
        <p className="text-[10px] text-[#8888AA]/50 font-gaming uppercase tracking-widest">
          © 2026 eGame Bénin • La Plateforme eSport #1 au Bénin
        </p>
      </footer>
    </div>
  );
};

export default Index;