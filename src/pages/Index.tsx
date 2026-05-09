"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import VSBackground from '@/components/VSBackground';
import PlayerBadge from '@/components/PlayerBadge';
import { motion } from 'framer-motion';
import { Trophy, Users, Activity, Shield, CreditCard, Zap, ArrowRight, MessageSquare } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [stats, setStats] = useState({ players: 0, tournaments: 0, cashPrize: 0 });
  const [lastWinners, setLastWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { count: playerCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: tourCount } = await supabase.from('tournaments').select('*', { count: 'exact', head: true });
      const { data: finishedTours } = await supabase.from('tournaments').select('prize_pool').eq('status', 'finished');
      const totalCash = finishedTours?.reduce((acc, t) => acc + (parseInt(t.prize_pool?.replace(/\D/g, '') || '0')), 0) || 0;

      setStats({ players: playerCount || 0, tournaments: tourCount || 0, cashPrize: totalCash });

      const { data: winners } = await supabase
        .from('tournaments')
        .select('winner_name, winner_avatar, prize_pool, title')
        .eq('status', 'finished')
        .order('updated_at', { ascending: false })
        .limit(3);
      
      if (winners) {
        const winnersWithBadges = await Promise.all(winners.map(async (w) => {
          const { data: prof } = await supabase.from('profiles').select('id').eq('username', w.winner_name).maybeSingle();
          let tCount = 0;
          if (prof) {
            const { count } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('user_id', prof.id).eq('status', 'Réussi');
            tCount = count || 0;
          }
          return { ...w, tournamentCount: tCount };
        }));
        setLastWinners(winnersWithBadges);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <SEO />
      <Navbar />
      
      <section className="relative pt-8 pb-32 overflow-hidden min-h-[85vh] flex flex-col">
        {/* Vidéo d'arrière-plan - Couche la plus basse */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/hero-video.webm" type="video/webm" />
        </video>

        {/* Overlay sombre - Couche intermédiaire */}
        <div className="absolute inset-0 bg-black/70 z-10" />

        {/* VSBackground - Couche décorative */}
        <div className="absolute inset-0 z-20 opacity-30">
          <VSBackground />
        </div>

        {/* Barre de Logo (Haut de page) */}
        <div className="max-w-7xl mx-auto px-6 w-full relative z-30 pt-4 md:pt-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="inline-block"
          >
            <Logo size="md" />
          </motion.div>
        </div>

        {/* Contenu Héro (Positionné plus bas) */}
        <div className="max-w-7xl mx-auto px-6 relative z-30 flex-1 flex flex-col items-center justify-start pt-24 md:pt-32 text-center space-y-12">
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
            className="text-lg sm:text-2xl md:text-4xl font-black tracking-tighter leading-tight uppercase whitespace-nowrap text-white"
          >
            Domine le jeu. <span className="text-violet-500">Encaisse la victoire.</span>
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

      <main className="max-w-7xl mx-auto px-6 space-y-40">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card border border-border p-10 rounded-[2.5rem] text-center space-y-4 shadow-sm">
            <Trophy className="text-violet-500 mx-auto" size={32} strokeWidth={2} />
            <p className="text-4xl font-black tracking-tighter">{stats.tournaments}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">Tournois Actifs</p>
          </div>
          <div className="bg-card border border-border p-10 rounded-[2.5rem] text-center space-y-4 shadow-sm">
            <Users className="text-violet-500 mx-auto" size={32} strokeWidth={2} />
            <p className="text-4xl font-black tracking-tighter">{stats.players}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">Joueurs Vérifiés</p>
          </div>
          <div className="bg-card border border-border p-10 rounded-[2.5rem] text-center space-y-4 shadow-sm">
            <Activity className="text-violet-500 mx-auto" size={32} strokeWidth={2} />
            <p className="text-4xl font-black tracking-tighter">{stats.cashPrize.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">CFA Distribués</p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6 text-center md:text-left">
            <Shield className="text-violet-500 mx-auto md:mx-0" size={40} strokeWidth={2} />
            <h3 className="text-xl font-black uppercase tracking-tight">Sécurité Totale</h3>
            <p className="text-muted-foreground text-sm leading-relaxed opacity-70">Paiements sécurisés via KKiaPay. Vos données et vos gains sont protégés par nos protocoles.</p>
          </div>
          <div className="space-y-6 text-center md:text-left">
            <CreditCard className="text-violet-500 mx-auto md:mx-0" size={40} strokeWidth={2} />
            <h3 className="text-xl font-black uppercase tracking-tight">Paiements Rapides</h3>
            <p className="text-muted-foreground text-sm leading-relaxed opacity-70">Recevez vos gains directement sur votre compte Mobile Money (MTN, Moov, Celtiis) sous 24h.</p>
          </div>
          <div className="space-y-6 text-center md:text-left">
            <Zap className="text-violet-500 mx-auto md:mx-0" size={40} strokeWidth={2} />
            <h3 className="text-xl font-black uppercase tracking-tight">Expérience Elite</h3>
            <p className="text-muted-foreground text-sm leading-relaxed opacity-70">Une plateforme fluide, des classements en temps réel et un support réactif pour les joueurs.</p>
          </div>
        </section>

        <footer className="py-24 border-t border-border text-center space-y-10">
          <div className="flex items-center justify-center gap-12">
            <a href="https://wa.me/2290141790790" target="_blank" className="text-muted-foreground hover:text-violet-500 transition-colors"><MessageSquare size={24} strokeWidth={2} /></a>
            <Link to="/privacy" className="text-muted-foreground hover:text-violet-500 transition-colors"><Shield size={24} strokeWidth={2} /></Link>
            <Trophy size={24} strokeWidth={2} className="text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <p className="text-[10px] text-muted-foreground font-black tracking-[0.3em]">eGame Bénin • Plateforme de Compétition</p>
            <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.2em]">© 2026 • Tous droits réservés</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;