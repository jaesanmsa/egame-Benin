"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import NewUserGuide from '@/components/NewUserGuide';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Globe, MapPin, History, Star, ChevronRight, Gamepad2, Facebook, Shield, UserCheck, Save, Filter, Zap, Users, Award, ArrowRight, Activity, MessageSquare, SearchX } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { showSuccess, showError } from '@/utils/toast';

const CITIES = ["Cotonou", "Porto-Novo", "Parakou", "Ouidah", "Abomey-Calavi", "Autre"];
const GAMES = ["Blur", "COD Modern Warfare 4", "COD Mobile", "BombSquad", "Clash Royale"];

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});
  
  const [userCount, setUserCount] = useState(0);
  const [totalTournaments, setTotalTournaments] = useState(0);
  const [totalPrizes, setTotalPrizes] = useState(0);
  
  const [filterType, setFilterType] = useState<'All' | 'Online' | 'Presentiel'>('All');
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedGame, setSelectedGame] = useState<string>("all");
  
  const [showGuide, setShowGuide] = useState(false);

  const navigate = useNavigate();

  const fetchData = async () => {
    const { data: allData } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allData) {
      const active = allData.filter(t => t.status === 'active');
      setTournaments(active);
      setTotalTournaments(allData.length);
      
      const prizesSum = allData
        .filter(t => t.status === 'finished' && t.prize_pool)
        .reduce((acc, t) => {
          const amount = parseInt(t.prize_pool.replace(/[^0-9]/g, '')) || 0;
          return acc + amount;
        }, 0);
      setTotalPrizes(prizesSum);
    }

    const { data: activity } = await supabase
      .from('payments')
      .select('tournament_name, profiles(username)')
      .eq('status', 'Réussi')
      .order('created_at', { ascending: false })
      .limit(5);
    if (activity) setRecentActivity(activity);
  };

  const fetchUserCount = async () => {
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    if (count !== null) setUserCount(count);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (data) {
      setProfile(data);
      const hasSeenGuide = localStorage.getItem('egame_guide_seen');
      if (!hasSeenGuide && (!data.username || !data.city)) {
        setShowGuide(true);
      }
    }
  };

  const handleCloseGuide = () => {
    setShowGuide(false);
    localStorage.setItem('egame_guide_seen', 'true');
  };

  const fetchParticipantCounts = async () => {
    const { data } = await supabase.from('payments').select('tournament_id').eq('status', 'Réussi');
    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((p: any) => { counts[p.tournament_id] = (counts[p.tournament_id] || 0) + 1; });
      setParticipantCounts(counts);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };
    init();
    fetchData();
    fetchParticipantCounts();
    fetchUserCount();
  }, []);

  const filteredTournaments = tournaments.filter(t => {
    const matchesType = filterType === 'All' || t.type === filterType;
    const matchesCity = selectedCity === "all" || t.city === selectedCity;
    const matchesGame = selectedGame === "all" || t.game === selectedGame;
    return matchesType && matchesCity && matchesGame;
  });

  const featuredTournament = tournaments.find(t => t.is_featured) || tournaments[0];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 pt-4 md:pt-24">
      <SEO />
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-6">
        
        <div className="flex items-center justify-between mb-8">
          <Logo size="md" />
          <Link to="/profile" className="md:hidden">
            <div className="w-10 h-10 rounded-full border-2 border-violet-600 overflow-hidden bg-muted shadow-lg shadow-violet-500/10">
              {profile?.avatar_url && <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />}
            </div>
          </Link>
        </div>

        {featuredTournament && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-[40vh] md:h-[50vh] rounded-[2.5rem] overflow-hidden mb-10 group cursor-pointer"
            onClick={() => navigate(`/tournament/${featuredTournament.id}`)}
          >
            <img 
              src={featuredTournament.image_url} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
              alt="" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
            
            <div className="absolute bottom-8 left-8 right-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-violet-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">À la Une</div>
                <div className="bg-zinc-950/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">{featuredTournament.game}</div>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight leading-none">{featuredTournament.title}</h2>
              <div className="flex items-center gap-6 text-white/80 text-xs font-bold">
                <div className="flex items-center gap-2"><Trophy size={16} className="text-yellow-500" /> {featuredTournament.prize_pool}</div>
                <div className="flex items-center gap-2"><Users size={16} className="text-cyan-500" /> {participantCounts[featuredTournament.id] || 0} Joueurs</div>
                <div className="flex items-center gap-2"><Calendar size={16} className="text-violet-500" /> {new Date(featuredTournament.start_date).toLocaleDateString('fr-FR')}</div>
              </div>
            </div>
          </motion.section>
        )}

        {recentActivity.length > 0 && (
          <div className="mb-8 overflow-hidden bg-violet-600/5 border-y border-violet-500/5 py-1.5 -mx-6 px-6">
            <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-violet-500/80">
                  <Activity size={10} />
                  <span>{act.profiles?.username || "Joueur"} inscrit à {act.tournament_name}</span>
                  <span className="mx-4 text-muted-foreground/20">•</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>{showGuide && <NewUserGuide onClose={handleCloseGuide} />}</AnimatePresence>

        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3 mb-8"
        >
          <motion.div variants={itemVariants} className="bg-card border border-border p-4 rounded-2xl text-center shadow-sm flex flex-col items-center justify-center">
            <Users size={18} className="text-violet-500 mb-1" />
            <p className="text-sm font-black text-foreground leading-none mb-1">{loading ? <Skeleton className="h-3 w-8 mx-auto" /> : userCount}</p>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Joueurs</p>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-card border border-border p-4 rounded-2xl text-center shadow-sm flex flex-col items-center justify-center">
            <Trophy size={18} className="text-yellow-500 mb-1" />
            <p className="text-sm font-black text-foreground leading-none mb-1">{loading ? <Skeleton className="h-3 w-8 mx-auto" /> : totalTournaments}</p>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Tournois</p>
          </motion.div>
        </motion.section>

        <section className="mb-12 space-y-6">
          <div className="flex items-center gap-2"><Filter size={14} className="text-violet-500" /><h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Explorer l'Arène</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex bg-card border border-border rounded-xl p-1 h-10 shadow-sm">
              <button onClick={() => setFilterType('All')} className={`flex-1 rounded-lg text-[9px] font-bold transition-all ${filterType === 'All' ? 'bg-violet-600 text-white shadow-md' : 'text-muted-foreground'}`}>Tous</button>
              <button onClick={() => setFilterType('Online')} className={`flex-1 rounded-lg text-[9px] font-bold transition-all flex items-center justify-center gap-1 ${filterType === 'Online' ? 'bg-cyan-600 text-white shadow-md' : 'text-muted-foreground'}`}><Globe size={12} /> En ligne</button>
              <button onClick={() => setFilterType('Presentiel')} className={`flex-1 rounded-lg text-[9px] font-bold transition-all flex items-center justify-center gap-1 ${filterType === 'Presentiel' ? 'bg-orange-600 text-white shadow-md' : 'text-muted-foreground'}`}><MapPin size={12} /> Local</button>
            </div>
            <Select value={selectedCity} onValueChange={setSelectedCity}><SelectTrigger className="bg-card border-border rounded-xl h-10 text-[11px] font-bold shadow-sm"><div className="flex items-center gap-2"><MapPin size={14} className="text-violet-500" /><SelectValue placeholder="Ville" /></div></SelectTrigger><SelectContent className="bg-card border-border"><SelectItem value="all">Toutes les villes</SelectItem>{CITIES.map(city => (<SelectItem key={city} value={city}>{city}</SelectItem>))}</SelectContent></Select>
            <Select value={selectedGame} onValueChange={setSelectedGame}><SelectTrigger className="bg-card border-border rounded-xl h-10 text-[11px] font-bold shadow-sm"><div className="flex items-center gap-2"><Gamepad2 size={14} className="text-violet-500" /><SelectValue placeholder="Jeu" /></div></SelectTrigger><SelectContent className="bg-card border-border"><SelectItem value="all">Tous les jeux</SelectItem>{GAMES.map(game => (<SelectItem key={game} value={game}>{game}</SelectItem>))}</SelectContent></Select>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6"
          >
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-3xl overflow-hidden p-4 space-y-4">
                  <Skeleton className="aspect-video w-full rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : filteredTournaments.length === 0 ? (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground/30">
                  <SearchX size={40} />
                </div>
                <div>
                  <h3 className="text-lg font-black">Aucun tournoi trouvé</h3>
                  <p className="text-xs text-muted-foreground">Essayez de modifier vos filtres pour voir plus de résultats.</p>
                </div>
                <Button variant="outline" onClick={() => { setFilterType('All'); setSelectedCity('all'); setSelectedGame('all'); }} className="rounded-xl text-[10px] font-black uppercase tracking-widest">Réinitialiser</Button>
              </div>
            ) : (
              filteredTournaments.map((t) => (
                <motion.div key={t.id} variants={itemVariants}>
                  <TournamentCard id={t.id} title={t.title} game={t.game} image={t.image_url} date={new Date(t.start_date).toLocaleDateString('fr-FR')} participants={`${participantCounts[t.id] || 0}/${t.max_participants}`} entryFee={t.entry_fee.toString()} type={t.type as any} />
                </motion.div>
              ))
            )}
          </motion.div>
        </section>

        <footer className="mt-12 py-12 border-t border-border text-center space-y-8">
          <div className="flex items-center justify-center gap-6">
            <a href="https://www.facebook.com/profile.php?id=61588439640775" target="_blank" className="w-10 h-10 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Facebook size={20} /></a>
            <a href="https://wa.me/2290141790790" target="_blank" className="w-10 h-10 bg-green-600/10 rounded-full flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm"><MessageSquare size={20} /></a>
            <Link to="/leaderboard" className="w-10 h-10 bg-zinc-900/10 rounded-full flex items-center justify-center text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all shadow-sm"><Trophy size={20} /></Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <Link to="/privacy" className="hover:text-violet-500 transition-colors underline decoration-violet-500/30 underline-offset-4">Privacy</Link>
            <Link to="/contact" className="hover:text-violet-500 transition-colors underline decoration-violet-500/30 underline-offset-4">Aide</Link>
            <Link to="/leaderboard" className="hover:text-violet-500 transition-colors underline decoration-violet-500/30 underline-offset-4">Classement</Link>
          </div>
          <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest">© 2026 eGame Bénin • Tous droits réservés</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;