"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import PlayerBadge from '@/components/PlayerBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Globe, MapPin, Star, ChevronRight, Gamepad2, Users, Award, ArrowRight, Activity, SearchX, Coins, ShieldCheck, CreditCard, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";

const CITIES = ["Cotonou", "Abomey-Calavi", "Porto-Novo", "Parakou", "Ouidah", "Autre"];

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [stats, setStats] = useState({ players: 0, tournaments: 0, cashPrize: 0 });
  const [lastWinners, setLastWinners] = useState<any[]>([]);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});
  
  const [selectedCity, setSelectedCity] = useState<string>("all");
  
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

  const filteredTournaments = tournaments.filter(t => {
    return selectedCity === "all" || t.city === selectedCity;
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <SEO />
      <Navbar />
      
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-30 scale-105" 
            alt="Gaming Background" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Logo size="lg" className="mx-auto mb-8" showText={false} />
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 leading-none">
              Joue. Compétis. <span className="text-violet-500">Gagne.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 font-medium max-w-2xl mx-auto">
              Rejoins la communauté gaming #1 au Bénin. Participe aux tournois officiels et remporte des cash prizes réels.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={() => navigate('/auth')} 
                className="w-full sm:w-auto py-8 px-10 rounded-2xl bg-violet-600 hover:bg-violet-700 text-lg font-black shadow-2xl shadow-violet-500/40 text-white"
              >
                Rejoindre maintenant
              </Button>
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('tournaments')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto py-8 px-10 rounded-2xl border-border text-lg font-black"
              >
                Voir les tournois
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 space-y-32">
        
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-20 relative z-20">
          <motion.div whileHover={{ y: -5 }} className="bg-card border border-border p-8 rounded-[2.5rem] shadow-xl text-center">
            <div className="w-12 h-12 bg-violet-600/10 rounded-2xl flex items-center justify-center text-violet-500 mx-auto mb-4">
              <Gamepad2 size={24} />
            </div>
            <p className="text-4xl font-black mb-1">{stats.tournaments}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Tournois organisés</p>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="bg-card border border-border p-8 rounded-[2.5rem] shadow-xl text-center">
            <div className="w-12 h-12 bg-cyan-600/10 rounded-2xl flex items-center justify-center text-cyan-500 mx-auto mb-4">
              <Users size={24} />
            </div>
            <p className="text-4xl font-black mb-1">{stats.players}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Joueurs inscrits</p>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="bg-card border border-border p-8 rounded-[2.5rem] shadow-xl text-center">
            <div className="w-12 h-12 bg-green-600/10 rounded-2xl flex items-center justify-center text-green-500 mx-auto mb-4">
              <Coins size={24} />
            </div>
            <p className="text-4xl font-black mb-1">{stats.cashPrize.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Cash Prizes versés (FCFA)</p>
          </motion.div>
        </section>

        <section id="tournaments" className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h2 className="text-4xl font-black tracking-tight mb-2">Tournois Actifs</h2>
              <p className="text-muted-foreground font-medium">Entre dans l'arène et prouve ta valeur.</p>
            </div>
            
            <div className="w-full md:w-64">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="bg-card border-border rounded-xl h-12 text-[11px] font-bold shadow-sm">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-violet-500" />
                    <SelectValue placeholder="Filtrer par ville" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  {CITIES.map(city => (<SelectItem key={city} value={city}>{city}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-[2.5rem] overflow-hidden p-4 space-y-4">
                  <Skeleton className="h-48 w-full rounded-3xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))
            ) : filteredTournaments.length === 0 ? (
              <div className="col-span-full py-20 text-center space-y-6 bg-muted/20 rounded-[3rem] border border-dashed border-border">
                <SearchX size={48} className="mx-auto text-muted-foreground/30" />
                <div>
                  <h3 className="text-xl font-black">Aucun tournoi trouvé</h3>
                  <p className="text-sm text-muted-foreground">Modifie tes filtres pour voir d'autres opportunités.</p>
                </div>
                <Button variant="outline" onClick={() => setSelectedCity('all')} className="rounded-xl font-black uppercase tracking-widest text-[10px]">Réinitialiser</Button>
              </div>
            ) : (
              filteredTournaments.map((t) => (
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

        <section className="space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black tracking-tight">Derniers Champions</h2>
            <Link to="/leaderboard" className="text-violet-500 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:underline">
              Voir tout le classement <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {lastWinners.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground italic font-medium">L'histoire est en train de s'écrire...</div>
            ) : (
              lastWinners.map((w, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -5 }}
                  className="bg-card border border-border p-8 rounded-[2.5rem] shadow-xl flex flex-col items-center text-center"
                >
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full border-4 border-violet-600/20 overflow-hidden bg-muted">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${w.winner_name}`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      <PlayerBadge tournamentCount={w.tournamentCount} size="sm" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black mb-1">{w.winner_name}</h3>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-4">{w.title}</p>
                  <div className="bg-green-500/10 text-green-500 px-6 py-2 rounded-full font-black text-sm border border-green-500/20">
                    +{w.prize_pool}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        <section className="bg-violet-600 rounded-[3rem] p-12 md:p-20 text-white shadow-2xl shadow-violet-500/20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Pourquoi eGame Bénin ?</h2>
            <p className="text-violet-100 font-medium max-w-2xl mx-auto">La plateforme de référence pour l'esport au Bénin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-black">Paiement Sécurisé</h3>
              <p className="text-violet-100 text-sm leading-relaxed">Inscris-toi en toute confiance via MTN et Moov Money grâce à notre partenaire KKiaPay.</p>
            </div>
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CreditCard size={32} />
              </div>
              <h3 className="text-xl font-black">Paiements Automatiques</h3>
              <p className="text-violet-100 text-sm leading-relaxed">Les cash prizes sont versés directement sur ton compte Mobile Money après chaque tournoi.</p>
            </div>
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-black">Communauté #1</h3>
              <p className="text-violet-100 text-sm leading-relaxed">Rejoins des milliers de joueurs passionnés et participe à l'essor du gaming au Bénin.</p>
            </div>
          </div>
        </section>

        <footer className="py-20 border-t border-border text-center space-y-10">
          <div className="flex items-center justify-center gap-8">
            <a href="https://wa.me/2290141790790" target="_blank" className="text-muted-foreground hover:text-green-500 transition-colors"><MessageSquare size={24} /></a>
            <Link to="/leaderboard" className="text-muted-foreground hover:text-yellow-500 transition-colors"><Trophy size={24} /></Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-violet-500 transition-colors"><ShieldCheck size={24} /></Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <Link to="/privacy" className="hover:text-violet-500 transition-colors">Privacy</Link>
            <Link to="/contact" className="hover:text-violet-500 transition-colors">Aide</Link>
            <Link to="/leaderboard" className="hover:text-violet-500 transition-colors">Classement</Link>
            <Link to="/games" className="hover:text-violet-500 transition-colors">Jeux</Link>
          </div>
          <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest">© 2026 eGame Bénin • Tous droits réservés</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;