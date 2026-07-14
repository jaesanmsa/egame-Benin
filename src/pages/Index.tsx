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

const Index = () => {
  const [stats, setStats] = useState({ players: 30, tournaments: 5, cashPrize: 150000 });
  const [activeTournaments, setActiveTournaments] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
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

      const { data: newsData } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (newsData) setNews(newsData);

      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <SEO />
      <Navbar />
      
      {/* Section Héros Immersif */}
      <section className="relative pt-8 pb-28 overflow-hidden min-h-[90vh] flex flex-col justify-between">
        {/* Effets de lueur d'ambiance en arrière-plan */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-900/10 blur-[120px] pointer-events-none" />

        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-30">
            <source src="/hero-video.webm" type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        <div className="absolute inset-0 z-10 opacity-30">
          <VSBackground />
        </div>

        {/* Header / Logo */}
        <div className="max-w-7xl mx-auto px-6 w-full relative z-30 pt-4">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Logo size="md" />
          </motion.div>
        </div>

        {/* Contenu Central du Héros */}
        <div className="max-w-4xl mx-auto px-6 relative z-30 flex-1 flex flex-col items-center justify-center text-center my-16 md:my-24 space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="badge-glow-purple px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.25em]"
          >
            L'Arène des Champions du Bénin
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-7xl font-black tracking-tighter leading-[1.1] uppercase font-sora"
          >
            Domine le jeu. <br />
            <span className="text-gradient-purple-gold drop-shadow-[0_0_30px_rgba(138,43,226,0.3)]">
              Encaisse la victoire.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed font-medium"
          >
            Rejoins la communauté eSport numéro 1 au Bénin. Participe à des tournois légendaires et gagne des Cash Prizes réels payés instantanément.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4"
          >
            <Button 
              onClick={() => navigate('/jeux')} 
              className="btn-premium-primary w-full sm:w-auto py-7 px-10 rounded-2xl text-xs uppercase tracking-widest gap-3"
            >
              Découvrir les Tournois <ArrowRight size={16} />
            </Button>
            <Button 
              onClick={() => navigate('/classement')} 
              className="w-full sm:w-auto py-7 px-10 rounded-2xl border-white/10 bg-white/5 backdrop-blur-md text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Voir le Classement
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Contenu Principal */}
      <main className="max-w-7xl mx-auto px-6 space-y-28 -mt-12 relative z-40">
        
        {/* Section Tournois Live */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              <h2 className="text-xl font-black tracking-tight uppercase italic font-sora">
                Tournois <span className="text-violet-500">En Cours</span>
              </h2>
            </div>
            <Link to="/jeux" className="text-[10px] font-black uppercase tracking-widest text-violet-400 hover:text-violet-300 transition-colors">
              Tout voir →
            </Link>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-6 pb-6 -mx-6 px-6">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="min-w-[85%] sm:min-w-[45%] aspect-[16/10] bg-card/30 animate-pulse rounded-[28px] border border-border" />
              ))
            ) : activeTournaments.length === 0 ? (
              <div className="w-full py-20 text-center glass-card rounded-[32px] border border-dashed border-white/10">
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
                    date={new Date(t.start_date).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Porto-Novo' })} 
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

        {/* Section Actualités */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight uppercase italic font-sora">
              Actualités <span className="text-violet-500">Gaming</span>
            </h2>
            <Link to="/news" className="text-[10px] font-black uppercase tracking-widest text-violet-400 hover:text-violet-300 transition-colors">
              Le Mag →
            </Link>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-6 pb-6 -mx-6 px-6">
            {news.map((article) => (
              <Link key={article.id} to={`/news/${article.id}`} className="min-w-[80%] sm:min-w-[30%] snap-center">
                <motion.div 
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="glass-card glass-card-hover rounded-[28px] overflow-hidden h-full flex flex-col"
                >
                  <div className="aspect-video overflow-hidden relative">
                    <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0414] to-transparent" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[9px] font-black text-violet-400 uppercase tracking-widest mb-3">
                        <Clock size={11} /> {article.read_time}
                      </div>
                      <h3 className="text-white font-bold text-sm mb-3 line-clamp-2 font-sora">{article.title}</h3>
                      <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 font-medium">{article.excerpt}</p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section Statistiques Premium */}
        <section className="py-12 glass-card rounded-[32px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-900/10 via-transparent to-fuchsia-900/10 pointer-events-none" />
          <div className="max-w-4xl mx-auto flex justify-around items-center relative z-10">
            <div className="text-center space-y-1">
              <p className="text-3xl md:text-5xl font-black text-gradient-purple-gold font-sora">{stats.tournaments}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Tournois</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center space-y-1">
              <p className="text-3xl md:text-5xl font-black text-gradient-purple-gold font-sora">{stats.players}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Joueurs</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center space-y-1">
              <p className="text-3xl md:text-5xl font-black text-gradient-purple-gold font-sora">{stats.cashPrize.toLocaleString()}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">CFA Gagnés</p>
            </div>
          </div>
        </section>

        {/* Pied de page */}
        <footer className="py-16 border-t border-white/5 text-center space-y-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <Link to="/about" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-violet-400 transition-colors">À propos</Link>
            <Link to="/contact" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-violet-400 transition-colors">Contact</Link>
            <Link to="/privacy" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-violet-400 transition-colors">Confidentialité</Link>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground font-black tracking-[0.4em] uppercase">eGame Bénin • L'Arène des Champions</p>
            <p className="text-[9px] text-muted-foreground/30 font-black uppercase tracking-widest">© 2026 • Tous droits réservés</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;