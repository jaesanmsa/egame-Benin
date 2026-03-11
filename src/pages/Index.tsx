"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import PlayerBadge from '@/components/PlayerBadge';
import { motion } from 'framer-motion';
import { Trophy, Gamepad2, Users, Coins, ShieldCheck, CreditCard, MessageSquare, SearchX, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [stats, setStats] = useState({ players: 0, tournaments: 0, cashPrize: 0 });
  const [lastWinners, setLastWinners] = useState<any[]>([]);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});
  
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    
    const { data: tours } = await supabase
      .from('tournaments')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (tours) setTournaments(tours);

    const { count: playerCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: tourCount } = await supabase.from('tournaments').select('*', { count: 'exact', head: true });
    
    const { data: finishedTours } = await supabase
      .from('tournaments')
      .select('prize_pool')
      .eq('status', 'finished');
    
    const totalCash = finishedTours?.reduce((acc, t) => acc + (parseInt(t.prize_pool?.replace(/\D/g, '') || '0')), 0) || 0;

    setStats({
      players: playerCount || 0,
      tournaments: tourCount || 0,
      cashPrize: totalCash
    });

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

    const { data: participants } = await supabase.from('payments').select('tournament_id').eq('status', 'Réussi');
    if (participants) {
      const counts: Record<string, number> = {};
      participants.forEach((p: any) => { counts[p.tournament_id] = (counts[p.tournament_id] || 0) + 1; });
      setParticipantCounts(counts);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <SEO />
      <Navbar />
      
      {/* Hero Section - Affinée */}
      <section className="relative h-[65vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-20 scale-105" 
            alt="Gaming Background" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Logo size="md" className="mx-auto mb-6" showText={false} />
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-tight">
              Joue. Compétis. <span className="text-violet-500">Gagne.</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mb-8 font-medium max-w-xl mx-auto leading-relaxed">
              Rejoins la communauté gaming #1 au Bénin. Participe aux tournois officiels et remporte des cash prizes réels.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button 
                onClick={() => navigate('/auth')} 
                className="w-full sm:w-auto py-6 px-8 rounded-xl bg-violet-600 hover:bg-violet-700 text-sm font-bold shadow-xl shadow-violet-500/20 text-white"
              >
                Rejoindre maintenant
              </Button>
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('tournaments')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto py-6 px-8 rounded-xl border-border text-sm font-bold"
              >
                Voir les tournois
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 space-y-24">
        
        {/* Stats Section - Corrigée et Affinée */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-20 -mt-12">
          <div className="bg-card border border-border p-6 rounded-[20px] shadow-sm text-center group hover:border-violet-500/30 transition-colors">
            <div className="w-10 h-10 bg-violet-600/10 rounded-xl flex items-center justify-center text-violet-500 mx-auto mb-3">
              <Gamepad2 size={20} />
            </div>
            <p className="text-3xl font-black mb-0.5">{stats.tournaments}</p>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Tournois organisés</p>
          </div>
          <div className="bg-card border border-border p-6 rounded-[20px] shadow-sm text-center group hover:border-cyan-500/30 transition-colors">
            <div className="w-10 h-10 bg-cyan-600/10 rounded-xl flex items-center justify-center text-cyan-500 mx-auto mb-3">
              <Users size={20} />
            </div>
            <p className="text-3xl font-black mb-0.5">{stats.players}</p>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Joueurs inscrits</p>
          </div>
          <div className="bg-card border border-border p-6 rounded-[20px] shadow-sm text-center group hover:border-green-500/30 transition-colors">
            <div className="w-10 h-10 bg-green-600/10 rounded-xl flex items-center justify-center text-green-500 mx-auto mb-3">
              <Coins size={20} />
            </div>
            <p className="text-3xl font-black mb-0.5">{stats.cashPrize.toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Cash Prizes (FCFA)</p>
          </div>
        </section>

        {/* Tournaments Section */}
        <section id="tournaments" className="space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black tracking-tight mb-1">Tournois Actifs</h2>
            <p className="text-xs text-muted-foreground font-medium">Entre dans l'arène et prouve ta valeur.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-[24px] overflow-hidden p-3 space-y-3">
                  <Skeleton className="h-40 w-full rounded-2xl" />
                  <div className="space-y-2 px-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : tournaments.length === 0 ? (
              <div className="col-span-full py-16 text-center space-y-4 bg-muted/10 rounded-[24px] border border-dashed border-border">
                <SearchX size={40} className="mx-auto text-muted-foreground/20" />
                <div>
                  <h3 className="text-lg font-black">Aucun tournoi trouvé</h3>
                  <p className="text-xs text-muted-foreground">Reviens plus tard pour de nouvelles compétitions.</p>
                </div>
              </div>
            ) : (
              tournaments.map((t) => (
                <TournamentCard 
                  key={t.id} 
                  id={t.id} 
                  title={t.title} 
                  game={t.game} 
                  image={t.image_url} 
                  date={new Date(t.start_date).toLocaleDateString('fr-FR')} 
                  participants={`${participantCounts[t.id] || 0}/${t.max_participants}`} 
                  entryFee={t.entry_fee.toString()} 
                  type={t.type as any} 
                />
              ))
            )}
          </div>
        </section>

        {/* Winners Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tight">Champions</h2>
            <Link to="/leaderboard" className="text-violet-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:underline">
              Classement complet <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lastWinners.length === 0 ? (
              <div className="col-span-full py-8 text-center text-muted-foreground text-xs italic">L'histoire est en train de s'écrire...</div>
            ) : (
              lastWinners.map((w, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -3 }}
                  className="bg-card border border-border p-6 rounded-[24px] shadow-sm flex flex-col items-center text-center"
                >
                  <div className="relative mb-4">
                    <div className="w-16 h-16 rounded-full border-2 border-violet-600/20 overflow-hidden bg-muted">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${w.winner_name}`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      <PlayerBadge tournamentCount={w.tournamentCount} size="sm" />
                    </div>
                  </div>
                  <h3 className="text-lg font-black mb-0.5">{w.winner_name}</h3>
                  <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mb-3">{w.title}</p>
                  <div className="bg-green-500/10 text-green-500 px-4 py-1 rounded-full font-black text-[10px] border border-green-500/20">
                    +{w.prize_pool}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-violet-600 rounded-[32px] p-10 md:p-16 text-white shadow-xl shadow-violet-500/10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">Pourquoi eGame Bénin ?</h2>
            <p className="text-violet-100 text-xs font-medium max-w-lg mx-auto">La plateforme de référence pour l'esport au Bénin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-black">Sécurisé</h3>
              <p className="text-violet-100 text-[11px] leading-relaxed">Inscris-toi via MTN et Moov Money grâce à notre partenaire KKiaPay.</p>
            </div>
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CreditCard size={24} />
              </div>
              <h3 className="text-lg font-black">Automatique</h3>
              <p className="text-violet-100 text-[11px] leading-relaxed">Les cash prizes sont versés directement sur ton compte Mobile Money.</p>
            </div>
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-black">Communauté</h3>
              <p className="text-violet-100 text-[11px] leading-relaxed">Rejoins des milliers de joueurs passionnés au Bénin.</p>
            </div>
          </div>
        </section>

        <footer className="py-16 border-t border-border text-center space-y-8">
          <div className="flex items-center justify-center gap-6">
            <a href="https://wa.me/2290141790790" target="_blank" className="text-muted-foreground hover:text-green-500 transition-colors"><MessageSquare size={20} /></a>
            <Link to="/leaderboard" className="text-muted-foreground hover:text-yellow-500 transition-colors"><Trophy size={20} /></Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-violet-500 transition-colors"><ShieldCheck size={20} /></Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
            <Link to="/privacy" className="hover:text-violet-500 transition-colors">Privacy</Link>
            <Link to="/contact" className="hover:text-violet-500 transition-colors">Aide</Link>
            <Link to="/leaderboard" className="hover:text-violet-500 transition-colors">Classement</Link>
            <Link to="/games" className="hover:text-violet-500 transition-colors">Jeux</Link>
          </div>
          <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest">© 2026 eGame Bénin • v1.0</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;