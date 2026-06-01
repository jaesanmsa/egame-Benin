"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import VSBackground from '@/components/VSBackground';
import TournamentCard from '@/components/TournamentCard';
import AdBanner from '@/components/AdBanner';
import { motion } from 'framer-motion';
import { Trophy, Users, Activity, Shield, CreditCard, Zap, ArrowRight, MessageSquare } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [stats, setStats] = useState({ players: 0, tournaments: 0, cashPrize: 0 });
  const [activeTournaments, setActiveTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      // Stats
      const { count: playerCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: tourCount } = await supabase.from('tournaments').select('*', { count: 'exact', head: true });
      const { data: finishedTours } = await supabase.from('tournaments').select('prize_pool').eq('status', 'finished');
      const totalCash = finishedTours?.reduce((acc, t) => acc + (parseInt(t.prize_pool?.replace(/\D/g, '') || '0')), 0) || 0;

      setStats({ players: playerCount || 0, tournaments: tourCount || 0, cashPrize: totalCash });

      // Tournois actifs
      const { data: tours } = await supabase
        .from('tournaments')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (tours) setActiveTournaments(tours);
      
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <SEO />
      <Navbar />
      
      <section className="relative pt-8 pb-24 overflow-hidden min-h-[80vh] flex flex-col">
        {/* Vidéo d'arrière-plan */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/hero-video.webm" type="video/webm" />
        </video>

        <div className="absolute inset-0 bg-black/70 z-10" />

        <div className="absolute inset-0 z-20 opacity-30">
          <VSBackground />
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full relative z-30 pt-4 md:pt-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="inline-block"
          >
            <Logo size="md" />
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-30 flex-1 flex flex-col items-center justify-start pt-24 md:pt-32 text-center space-y-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-violet-600/20 backdrop-blur-md text-violet-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-violet-500/30"
          >
            L'Arène des Champions du Bénin
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}
            className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter leading-tight uppercase text-white"
          >
            Domine le jeu. <br />
            <span className="text-violet-500">Encaisse la victoire.</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto"
          >
            <div className="relative p-[1px] overflow-hidden rounded-2xl group w-full sm:w-auto">
              <div className="absolute inset-[-1000%] animate-border-rotate bg-[conic-gradient(from_90deg_at_50%_50%,#8A2BE2_0%,#4B0082_50%,#8A2BE2_100%)]" />
              <Button 
                onClick={() => navigate('/games')} 
                className="relative w-full sm:w-auto py-8 px-12 rounded-2xl bg-zinc-900 hover:bg-zinc-800 font-black text-xs uppercase tracking-widest shadow-2xl gap-3 text-white border border-white/5"
              >
                Explorer les tournois <ArrowRight size={18} strokeWidth={2} className="text-violet-500" />
              </Button>
            </div>

            <Button 
              variant="outline" 
              onClick={() => navigate('/leaderboard')} 
              className="w-full sm:w-auto py-8 px-12 rounded-2xl border-white/20 bg-white/5 backdrop-blur-sm text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Classement Elite
            </Button>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 space-y-24 -mt-12 relative z-40">
        {/* Ad Banner */}
        <AdBanner />

        {/* SECTION TOURNOIS - PREMIER ÉLÉMENT */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight uppercase italic">
              Tournois <span className="text-violet-500">En Cours</span>
            </h2>
            <Link to="/games" className="text-[10px] font-black uppercase tracking-widest text-violet-500 hover:underline">
              Voir tout →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 bg-card/50 animate-pulse rounded-[24px] border border-border" />
              ))
            ) : activeTournaments.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-card/30 rounded-[32px] border border-dashed border-border">
                <p className="text-muted-foreground text-sm font-bold italic">Aucun tournoi actif pour le moment.</p>
              </div>
            ) : (
              activeTournaments.map((t) => (
                <TournamentCard 
                  key={t.id} 
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
              ))
            )}
          </div>
        </section>

        {/* SECTION STATISTIQUES - ALLÉGÉE ET HORIZONTALE */}
        <section className="py-10 border-y border-border/50 bg-violet-600/5 rounded-[2.5rem]">
          <div className="max-w-4xl mx-auto flex flex-row justify-around items-center gap-4">
            <div className="text-center">
              <p className="text-xl font-light tracking-tighter text-violet-500">{stats.tournaments}</p>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">Tournois</p>
            </div>
            <div className="w-px h-8 bg-border/50" />
            <div className="text-center">
              <p className="text-xl font-light tracking-tighter text-violet-500">{stats.players}</p>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">Joueurs</p>
            </div>
            <div className="w-px h-8 bg-border/50" />
            <div className="text-center">
              <p className="text-xl font-light tracking-tighter text-violet-500">{stats.cashPrize.toLocaleString()}</p>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">CFA Gagnés</p>
            </div>
          </div>
        </section>

        {/* SECTION FEATURES */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-16 pt-12">
          <div className="space-y-4 text-center md:text-left">
            <Shield className="text-violet-500 mx-auto md:mx-0" size={32} strokeWidth={1.5} />
            <h3 className="text-sm font-black uppercase tracking-tight">Sécurité Totale</h3>
            <p className="text-muted-foreground text-[11px] leading-relaxed opacity-70">Paiements sécurisés via KKiaPay. Vos données et vos gains sont protégés.</p>
          </div>
          <div className="space-y-4 text-center md:text-left">
            <CreditCard className="text-violet-500 mx-auto md:mx-0" size={32} strokeWidth={1.5} />
            <h3 className="text-sm font-black uppercase tracking-tight">Paiements Rapides</h3>
            <p className="text-muted-foreground text-[11px] leading-relaxed opacity-70">Recevez vos gains directement sur Mobile Money sous 24h à 72h.</p>
          </div>
          <div className="space-y-4 text-center md:text-left">
            <Zap className="text-violet-500 mx-auto md:mx-0" size={32} strokeWidth={1.5} />
            <h3 className="text-sm font-black uppercase tracking-tight">Expérience Elite</h3>
            <p className="text-muted-foreground text-[11px] leading-relaxed opacity-70">Une plateforme fluide et un support réactif pour tous les joueurs.</p>
          </div>
        </section>

        <footer className="py-20 border-t border-border text-center space-y-10">
          <div className="flex items-center justify-center gap-12">
            <a href="https://wa.me/2290141790790" target="_blank" className="text-muted-foreground hover:text-violet-500 transition-colors"><MessageSquare size={20} strokeWidth={2} /></a>
            <Link to="/privacy" className="text-muted-foreground hover:text-violet-500 transition-colors"><Shield size={20} strokeWidth={2} /></Link>
            <Trophy size={20} strokeWidth={2} className="text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <p className="text-[9px] text-muted-foreground font-black tracking-[0.3em]">eGame Bénin • Plateforme de Compétition</p>
            <p className="text-[8px] text-muted-foreground/40 font-black uppercase tracking-[0.2em]">© 2026 • Tous droits réservés</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;