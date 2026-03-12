"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import PlayerBadge from '@/components/PlayerBadge';
import { motion } from 'framer-motion';
import { Trophy, Gamepad2, Users, Coins, ShieldCheck, CreditCard, MessageSquare, ArrowRight, Star, Zap, Target } from 'lucide-react';
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

      // Récupération des derniers champions
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
    <div className="min-h-screen bg-background text-foreground pb-24 relative">
      <SEO />
      <Navbar />
      
      <div className="absolute top-6 left-6 z-50">
        <Logo size="sm" />
      </div>
      
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-20 scale-105" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="h-px w-8 bg-violet-500/50" />
              <span className="text-violet-500 font-black uppercase tracking-[0.4em] text-[10px]">eGame Bénin Official</span>
              <span className="h-px w-8 bg-violet-500/50" />
            </div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/50">JOUE.</span>
              <span className="block text-violet-500">COMPÉTIS.</span>
              <span className="block">GAGNE.</span>
            </h1>

            <p className="text-sm md:text-lg text-muted-foreground mb-10 font-medium max-w-xl mx-auto leading-relaxed">
              Rejoins l'élite du gaming au Bénin. Participe aux tournois officiels et remporte des cash prizes réels.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={() => navigate('/games')} className="w-full sm:w-auto py-8 px-10 rounded-2xl bg-violet-600 hover:bg-violet-700 font-black text-lg text-white shadow-2xl shadow-violet-500/40 group transition-all">
                Entrer dans l'Arène
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
              <Button variant="outline" onClick={() => navigate('/leaderboard')} className="w-full sm:w-auto py-8 px-10 rounded-2xl border-border font-black text-lg hover:bg-muted transition-all">
                Voir le Classement
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 space-y-32">
        {/* Section Stats: Champion, Classement, Complet */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-20 -mt-20">
          <motion.div whileHover={{ y: -5 }} className="bg-card border border-border p-8 rounded-[32px] shadow-xl text-center group">
            <div className="w-14 h-14 bg-violet-600/10 rounded-2xl flex items-center justify-center text-violet-500 mx-auto mb-4 group-hover:scale-110 transition-transform"><Trophy size={28} /></div>
            <p className="text-4xl font-black mb-1">{stats.tournaments}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Tournois Complets</p>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="bg-card border border-border p-8 rounded-[32px] shadow-xl text-center group">
            <div className="w-14 h-14 bg-cyan-600/10 rounded-2xl flex items-center justify-center text-cyan-500 mx-auto mb-4 group-hover:scale-110 transition-transform"><Star size={28} /></div>
            <p className="text-4xl font-black mb-1">{stats.players}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Champions Inscrits</p>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="bg-card border border-border p-8 rounded-[32px] shadow-xl text-center group">
            <div className="w-14 h-14 bg-green-600/10 rounded-2xl flex items-center justify-center text-green-500 mx-auto mb-4 group-hover:scale-110 transition-transform"><Coins size={28} /></div>
            <p className="text-4xl font-black mb-1">{stats.cashPrize.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Cash Prizes Versés</p>
          </motion.div>
        </section>

        {/* Section Champions (Derniers Gagnants) */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black tracking-tight">Derniers Champions</h2>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em]">Ceux qui dominent l'arène actuellement</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 bg-muted animate-pulse rounded-[32px]" />)
            ) : lastWinners.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground italic">En attente des prochains champions...</div>
            ) : (
              lastWinners.map((w, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border p-8 rounded-[32px] shadow-sm flex flex-col items-center text-center relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full border-4 border-violet-600/10 overflow-hidden bg-muted shadow-inner">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${w.winner_name}`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      <PlayerBadge tournamentCount={w.tournamentCount} size="md" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black mb-1">{w.winner_name}</h3>
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-6">{w.title}</p>
                  <div className="bg-green-500/10 text-green-500 px-6 py-2 rounded-full font-black text-xs border border-green-500/20 shadow-sm">
                    +{w.prize_pool}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Section Features */}
        <section className="bg-violet-600 rounded-[48px] p-12 md:p-20 text-white shadow-2xl shadow-violet-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"><ShieldCheck size={32} /></div>
              <h3 className="text-xl font-black">100% Sécurisé</h3>
              <p className="text-violet-100 text-xs leading-relaxed">Paiements et retraits via Mobile Money certifiés par KKiaPay.</p>
            </div>
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"><CreditCard size={32} /></div>
              <h3 className="text-xl font-black">Retrait Rapide</h3>
              <p className="text-violet-100 text-xs leading-relaxed">Tes gains sont envoyés sur ton numéro en moins de 24 heures.</p>
            </div>
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"><Zap size={32} /></div>
              <h3 className="text-xl font-black">Compétition Élite</h3>
              <p className="text-violet-100 text-xs leading-relaxed">Affronte les meilleurs joueurs du Bénin et grimpe au sommet.</p>
            </div>
          </div>
        </section>

        <footer className="py-20 border-t border-border text-center space-y-10">
          <div className="flex items-center justify-center gap-8">
            <a href="https://wa.me/2290141790790" target="_blank" className="text-muted-foreground hover:text-green-500 transition-all hover:scale-110"><MessageSquare size={24} /></a>
            <Trophy size={24} className="text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">eGame Bénin • La Référence Gaming</p>
            <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">© 2026 • Tous droits réservés</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;