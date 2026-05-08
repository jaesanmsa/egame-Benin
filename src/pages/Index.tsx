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
    <div className="min-h-screen bg-background text-foreground pb-32">
      <SEO />
      <Navbar />
      
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-600/30 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-violet-600/10 text-violet-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-violet-500/20"
            >
              L'élite du gaming au Bénin
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.95]"
            >
              Domine le jeu.<br />
              <span className="text-violet-600">Encaisse la victoire.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto font-medium"
            >
              Rejoins la communauté gaming #1 au Bénin. Participe aux tournois, 
              affronte les meilleurs et gagne des cash prizes réels.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <Button 
                onClick={() => navigate('/games')} 
                className="w-full sm:w-auto py-7 px-10 rounded-2xl bg-violet-600 hover:bg-violet-700 font-black text-base shadow-xl shadow-violet-500/20 gap-2 text-white"
              >
                Voir les tournois <ArrowRight size={20} />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/leaderboard')} 
                className="w-full sm:w-auto py-7 px-10 rounded-2xl border-border font-black text-base hover:bg-muted transition-all"
              >
                Classement
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 space-y-32">
        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm text-center space-y-2">
            <Trophy className="text-violet-500 mx-auto mb-4" size={32} />
            <p className="text-4xl font-black">{stats.tournaments}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Tournois</p>
          </div>
          <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm text-center space-y-2">
            <Users className="text-violet-500 mx-auto mb-4" size={32} />
            <p className="text-4xl font-black">{stats.players}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Joueurs</p>
          </div>
          <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm text-center space-y-2">
            <Coins className="text-violet-500 mx-auto mb-4" size={32} />
            <p className="text-4xl font-black">{stats.cashPrize.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">CFA Gagnés</p>
          </div>
        </section>

        {/* Winners Section */}
        <section className="space-y-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight">Derniers Vainqueurs</h2>
            <Link to="/leaderboard" className="text-xs font-black text-violet-500 uppercase tracking-widest hover:underline">Voir tout →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 bg-card rounded-[2.5rem] animate-pulse border border-border" />)
            ) : (
              lastWinners.map((w, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center"
                >
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full border-2 border-violet-500/20 p-1">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${w.winner_name}`} alt="" className="w-full h-full object-cover rounded-full bg-muted" />
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      <PlayerBadge tournamentCount={w.tournamentCount} size="md" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black mb-1">{w.winner_name}</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-4">{w.title}</p>
                  <div className="bg-green-500/10 text-green-500 px-4 py-1.5 rounded-full font-black text-xs">
                    +{w.prize_pool}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 py-12">
          <div className="space-y-4 text-center md:text-left">
            <ShieldCheck className="text-violet-500 mx-auto md:mx-0" size={40} />
            <h3 className="text-xl font-black">Sécurisé</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Paiements via KKiaPay (MTN, Moov, Celtiis). Vos transactions sont 100% protégées.</p>
          </div>
          <div className="space-y-4 text-center md:text-left">
            <CreditCard className="text-violet-500 mx-auto md:mx-0" size={40} />
            <h3 className="text-xl font-black">Retraits Rapides</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Gagnez et recevez vos prix directement sur votre compte Mobile Money sous 24h.</p>
          </div>
          <div className="space-y-4 text-center md:text-left">
            <Zap className="text-violet-500 mx-auto md:mx-0" size={40} />
            <h3 className="text-xl font-black">Compétitif</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Affrontez les meilleurs joueurs du Bénin et grimpez dans le Hall of Fame.</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-20 border-t border-border text-center space-y-8">
          <div className="flex items-center justify-center gap-8">
            <a href="https://wa.me/2290141790790" target="_blank" className="text-muted-foreground hover:text-violet-500 transition-colors"><MessageSquare size={24} /></a>
            <Link to="/privacy" className="text-muted-foreground hover:text-violet-500 transition-colors"><Shield size={24} /></Link>
            <Trophy size={24} className="text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">eGame Bénin • Domine le jeu</p>
            <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest">© 2026 • Tous droits réservés</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;