"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import PlayerBadge from '@/components/PlayerBadge';
import { motion } from 'framer-motion';
import { Trophy, Gamepad2, Users, Coins, ShieldCheck, CreditCard, MessageSquare, ArrowRight, Star, Zap, Shield } from 'lucide-react';
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
    <div className="min-h-screen bg-background text-foreground pb-32 relative">
      <SEO />
      <Navbar />
      
      <div className="absolute top-8 left-8 z-50">
        <Logo size="md" />
      </div>
      
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
          <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-10 scale-110" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 mb-8 rounded-full border border-primary/30 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.3em] neon-glow"
            >
              L'Arène des Champions du Bénin
            </motion.div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] uppercase italic">
              Domine le jeu.<br />
              <span className="text-primary neon-text">Encaisse la victoire.</span>
            </h1>

            <p className="text-sm md:text-lg text-muted-foreground mb-12 font-medium max-w-2xl mx-auto leading-relaxed">
              Rejoins l'élite du gaming au Bénin. Participe aux tournois les plus prestigieux, 
              affronte les meilleurs et repars avec des cash prizes réels.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button 
                onClick={() => navigate('/games')} 
                className="w-full sm:w-auto py-8 px-12 rounded-none bg-primary hover:bg-primary/90 font-black text-lg text-background shadow-[0_0_30px_rgba(0,240,255,0.3)] group transition-all uppercase italic"
              >
                Entrer dans l'Arène
                <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={20} />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/leaderboard')} 
                className="w-full sm:w-auto py-8 px-12 rounded-none border-primary/50 text-primary font-black text-lg hover:bg-primary/10 transition-all uppercase italic"
              >
                Hall of Fame
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 space-y-32">
        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-20 -mt-24">
          <motion.div whileHover={{ y: -10 }} className="bg-card border border-border p-10 rounded-none shadow-2xl text-center group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <Trophy className="text-primary mx-auto mb-6 opacity-50 group-hover:opacity-100 transition-opacity" size={32} />
            <p className="text-5xl font-black mb-2 italic">{stats.tournaments}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">Tournois Organisés</p>
          </motion.div>
          <motion.div whileHover={{ y: -10 }} className="bg-card border border-border p-10 rounded-none shadow-2xl text-center group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <Users className="text-primary mx-auto mb-6 opacity-50 group-hover:opacity-100 transition-opacity" size={32} />
            <p className="text-5xl font-black mb-2 italic">{stats.players}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">Joueurs Actifs</p>
          </motion.div>
          <motion.div whileHover={{ y: -10 }} className="bg-card border border-border p-10 rounded-none shadow-2xl text-center group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <Coins className="text-primary mx-auto mb-6 opacity-50 group-hover:opacity-100 transition-opacity" size={32} />
            <p className="text-5xl font-black mb-2 italic">{stats.cashPrize.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">CFA Versés</p>
          </motion.div>
        </section>

        {/* Winners Section */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">Légendes Actuelles</h2>
            <div className="w-24 h-1 bg-primary mx-auto neon-glow" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-80 bg-card animate-pulse border border-border" />)
            ) : (
              lastWinners.map((w, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="bg-card border border-border p-8 rounded-none shadow-xl flex flex-col items-center text-center group hover:border-primary/50 transition-colors"
                >
                  <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-full border-2 border-primary/20 p-1 group-hover:border-primary transition-colors">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${w.winner_name}`} alt="" className="w-full h-full object-cover rounded-full bg-muted" />
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      <PlayerBadge tournamentCount={w.tournamentCount} size="md" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mb-1 uppercase italic">{w.winner_name}</h3>
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-6">{w.title}</p>
                  <div className="bg-primary/10 text-primary px-6 py-2 border border-primary/20 font-black text-sm italic">
                    +{w.prize_pool}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-card border border-border p-12 md:p-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
            <div className="space-y-6 text-center md:text-left">
              <ShieldCheck className="text-primary mx-auto md:mx-0" size={40} />
              <h3 className="text-2xl font-black uppercase italic">Sécurité Totale</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Paiements et retraits via Mobile Money certifiés par KKiaPay. Tes fonds sont en sécurité.</p>
            </div>
            <div className="space-y-6 text-center md:text-left">
              <CreditCard className="text-primary mx-auto md:mx-0" size={40} />
              <h3 className="text-2xl font-black uppercase italic">Retraits Instantanés</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Pas d'attente interminable. Tes gains sont transférés sur ton compte en un temps record.</p>
            </div>
            <div className="space-y-6 text-center md:text-left">
              <Zap className="text-primary mx-auto md:mx-0" size={40} />
              <h3 className="text-2xl font-black uppercase italic">Compétition Pro</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Une infrastructure pensée pour les joueurs sérieux. Anti-cheat et arbitrage rigoureux.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-24 border-t border-border text-center space-y-12">
          <div className="flex items-center justify-center gap-10">
            <a href="https://wa.me/2290141790790" target="_blank" className="text-muted-foreground hover:text-primary transition-all hover:scale-125"><MessageSquare size={24} /></a>
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-all hover:scale-125"><Shield size={24} /></Link>
            <Trophy size={24} className="text-muted-foreground" />
          </div>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.5em]">eGame Bénin • Domine le jeu</p>
            <p className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-widest">© 2026 • L'élite du eSport Béninois</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;