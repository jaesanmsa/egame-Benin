"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import VSBackground from '@/components/VSBackground';
import TournamentCard from '@/components/TournamentCard';
import { motion } from 'framer-motion';
import { Trophy, Users, Activity, Shield, CreditCard, Zap, ArrowRight, MessageSquare, Newspaper, Clock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { MOCK_NEWS } from './News';

const Index = () => {
  const [stats, setStats] = useState({ players: 30, tournaments: 5, cashPrize: 150000 });
  const [activeTournaments, setActiveTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: tours } = await supabase
        .from('tournaments')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (tours) setActiveTournaments(tours);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <SEO />
      <Navbar />
      
      <section className="relative pt-8 pb-24 overflow-hidden min-h-[85vh] flex flex-col">
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-50">
            <source src="/hero-video.webm" type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-background" />
        </div>

        <div className="absolute inset-0 z-10 opacity-20">
          <VSBackground />
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full relative z-30 pt-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Logo size="md" />
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-30 flex-1 flex flex-col items-center justify-center text-center mt-12 md:mt-20 space-y-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-violet-600/20 backdrop-blur-md text-violet-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.25em] border border-violet-500/30"
          >
            L'Arène des Champions
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl md:text-3xl font-black tracking-tighter leading-tight uppercase text-white"
          >
            Domine le jeu. <br />
            <span className="text-violet-500">Encaisse la victoire.</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto px-4"
          >
            <Button 
              onClick={() => navigate('/jeux')} 
              className="w-full sm:w-auto py-8 px-12 rounded-2xl bg-violet-600 hover:bg-violet-700 font-black text-xs uppercase tracking-widest shadow-2xl shadow-violet-500/40 text-white gap-3"
            >
              Tournois <ArrowRight size={18} />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/classement')} 
              className="w-full sm:w-auto py-8 px-12 rounded-2xl border-white/20 bg-white/5 backdrop-blur-md text-white font-black text-xs uppercase tracking-widest hover:bg-white/10"
            >
              Classement
            </Button>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 space-y-24 -mt-16 relative z-40">
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight uppercase italic">
              Tournois <span className="text-violet-500">Live</span>
            </h2>
            <Link to="/jeux" className="text-[10px] font-black uppercase tracking-widest text-violet-500 hover:underline">
              Tout voir →
            </Link>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-5 pb-6 -mx-6 px-6">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="min-w-[85%] sm:min-w-[45%] aspect-[4/3] bg-card/50 animate-pulse rounded-[32px] border border-border" />
              ))
            ) : activeTournaments.length === 0 ? (
              <div className="w-full py-20 text-center bg-card/30 rounded-[40px] border border-dashed border-border">
                <p className="text-muted-foreground text-sm font-bold italic">Aucun tournoi actif pour le moment.</p>
              </div>
            ) : (
              activeTournaments.map((t) => (
                <div key={t.id} className="min-w-[85%] sm:min-w-[45%] snap-center">
                  <TournamentCard 
                    id={t.id} 
                    title={t.title} 
                    game={t.game} 
                    image={t.image_url} 
                    date={new Date(t.start_date).toLocaleDateString('fr-FR')} 
                    participants={`${t.max_participants} places`} 
                    entryFee={t.entry_fee.toString()} 
                    type={t.type as any} 
                    status="active" 
                  />
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight uppercase italic">
              Actualités <span className="text-violet-500">Gaming</span>
            </h2>
            <Link to="/news" className="text-[10px] font-black uppercase tracking-widest text-violet-500 hover:underline">
              Le Mag →
            </Link>
          </div>

          {/* Défilement horizontal pour les actualités */}
          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-5 pb-6 -mx-6 px-6">
            {MOCK_NEWS.map((article) => (
              <Link 
                key={article.id} 
                to={`/news/${article.id}`} 
                className={`${article.id === 'coc-rules' ? 'min-w-[90%] sm:min-w-[50%]' : 'min-w-[80%] sm:min-w-[30%]'} snap-center`}
              >
                <motion.div 
                  whileHover={{ y: -8 }}
                  className={`bg-[#1a0b2e] border border-violet-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl group h-full flex flex-col`}
                >
                  <div className={`${article.id === 'coc-rules' ? 'aspect-[16/10]' : 'aspect-video'} overflow-hidden`}>
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-[8px] font-black text-violet-400 uppercase tracking-widest mb-3">
                      <Clock size={10} /> {article.readTime}
                    </div>
                    <h3 className={`${article.id === 'coc-rules' ? 'text-sm md:text-base' : 'text-xs'} text-white font-bold mb-3 line-clamp-2 group-hover:text-violet-400 transition-colors`}>
                      {article.title}
                    </h3>
                    <p className={`${article.id === 'coc-rules' ? 'text-[10px] md:text-xs' : 'text-[9px]'} text-violet-200/60 leading-relaxed line-clamp-3`}>
                      {article.excerpt}
                    </p>
                    {article.id === 'coc-rules' && (
                      <div className="mt-auto pt-4 flex items-center gap-2 text-violet-400 font-black text-[10px] uppercase tracking-widest">
                        Lire le règlement <ArrowRight size={14} />
                      </div>
                    )}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-12 border-y border-border/50 bg-violet-600/5 rounded-[3rem]">
          <div className="max-w-4xl mx-auto flex justify-around items-center">
            <div className="text-center">
              <p className="text-2xl font-black text-violet-500">{stats.tournaments}</p>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Tournois</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-violet-500">{stats.players}</p>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Joueurs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-violet-500">{stats.cashPrize.toLocaleString()}</p>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60">CFA Gagnés</p>
            </div>
          </div>
        </section>

        <footer className="py-20 border-t border-border text-center space-y-10">
          <div className="flex flex-wrap items-center justify-center gap-10">
            <Link to="/about" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-violet-500 transition-colors">À propos</Link>
            <Link to="/contact" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-violet-500 transition-colors">Contact</Link>
            <Link to="/privacy" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-violet-500 transition-colors">Confidentialité</Link>
          </div>
          <div className="space-y-3">
            <p className="text-[9px] text-muted-foreground font-black tracking-[0.4em] uppercase">eGame Bénin • L'Arène des Champions</p>
            <p className="text-[8px] text-muted-foreground/40 font-black uppercase tracking-widest">© 2026 • Tous droits réservés</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;