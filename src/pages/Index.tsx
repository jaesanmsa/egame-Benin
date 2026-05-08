"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import PlayerBadge from '@/components/PlayerBadge';
import { motion } from 'framer-motion';
import { Award, Users, Activity, Shield, CreditCard, Zap, ArrowRight, MessageSquare } from 'lucide-react';
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
      
      <section className="relative pt-12 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#00F0FF]/20 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex justify-start mb-16">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Logo size="md" />
            </motion.div>
          </div>

          <div className="flex flex-col items-center text-center space-y-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#00F0FF]/5 text-[#00F0FF] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-[#00F0FF]/20"
            >
              Elite Gaming Infrastructure
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter leading-tight uppercase"
            >
              Domine le jeu. <br />
              <span className="text-[#00F0FF]">Encaisse la victoire.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto font-medium opacity-80"
            >
              La plateforme de compétition eSport de référence au Bénin. 
              Infrastructures de tournois automatisées et cash prizes garantis.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto"
            >
              <div className="relative p-[1px] overflow-hidden rounded-2xl group w-full sm:w-auto">
                <div className="absolute inset-[-1000%] animate-border-rotate bg-[conic-gradient(from_90deg_at_50%_50%,#00F0FF_0%,#0000FF_50%,#00F0FF_100%)]" />
                <Button 
                  onClick={() => navigate('/games')} 
                  className="relative w-full sm:w-auto py-8 px-12 rounded-2xl bg-zinc-900 hover:bg-zinc-800 font-black text-xs uppercase tracking-widest shadow-2xl gap-3 text-white border border-white/5"
                >
                  Explorer les tournois <ArrowRight size={18} strokeWidth={2} className="text-[#00F0FF]" />
                </Button>
              </div>

              <Button 
                variant="outline" 
                onClick={() => navigate('/leaderboard')} 
                className="w-full sm:w-auto py-8 px-12 rounded-2xl border-border font-black text-xs uppercase tracking-widest hover:bg-muted transition-all"
              >
                Classement Elite
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 space-y-40">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-900/50 border border-border p-10 rounded-[2.5rem] text-center space-y-4">
            <Award className="text-[#00F0FF] mx-auto" size={32} strokeWidth={2} />
            <p className="text-4xl font-black tracking-tighter">{stats.tournaments}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">Tournois Actifs</p>
          </div>
          <div className="bg-zinc-900/50 border border-border p-10 rounded-[2.5rem] text-center space-y-4">
            <Users className="text-[#00F0FF] mx-auto" size={32} strokeWidth={2} />
            <p className="text-4xl font-black tracking-tighter">{stats.players}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">Joueurs Vérifiés</p>
          </div>
          <div className="bg-zinc-900/50 border border-border p-10 rounded-[2.5rem] text-center space-y-4">
            <Activity className="text-[#00F0FF] mx-auto" size={32} strokeWidth={2} />
            <p className="text-4xl font-black tracking-tighter">{stats.cashPrize.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">CFA Distribués</p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6 text-center md:text-left">
            <Shield className="text-[#00F0FF] mx-auto md:mx-0" size={40} strokeWidth={2} />
            <h3 className="text-xl font-black uppercase tracking-tight">Infrastructure Sécurisée</h3>
            <p className="text-muted-foreground text-sm leading-relaxed opacity-70">Protocoles de paiement KKiaPay certifiés. Protection intégrale des données et des transactions.</p>
          </div>
          <div className="space-y-6 text-center md:text-left">
            <CreditCard className="text-[#00F0FF] mx-auto md:mx-0" size={40} strokeWidth={2} />
            <h3 className="text-xl font-black uppercase tracking-tight">Liquidation Instantanée</h3>
            <p className="text-muted-foreground text-sm leading-relaxed opacity-70">Système de retrait automatisé vers Mobile Money. Réception des gains sous 24h ouvrées.</p>
          </div>
          <div className="space-y-6 text-center md:text-left">
            <Zap className="text-[#00F0FF] mx-auto md:mx-0" size={40} strokeWidth={2} />
            <h3 className="text-xl font-black uppercase tracking-tight">Performance Elite</h3>
            <p className="text-muted-foreground text-sm leading-relaxed opacity-70">Classements en temps réel et matchmaking basé sur le niveau de compétence.</p>
          </div>
        </section>

        <footer className="py-24 border-t border-border text-center space-y-10">
          <div className="flex items-center justify-center gap-12">
            <a href="https://wa.me/2290141790790" target="_blank" className="text-muted-foreground hover:text-[#00F0FF] transition-colors"><MessageSquare size={24} strokeWidth={2} /></a>
            <Link to="/privacy" className="text-muted-foreground hover:text-[#00F0FF] transition-colors"><Shield size={24} strokeWidth={2} /></Link>
            <Award size={24} strokeWidth={2} className="text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">eGame Bénin • Competitive Gaming Platform</p>
            <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.2em]">© 2026 • All Rights Reserved</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;