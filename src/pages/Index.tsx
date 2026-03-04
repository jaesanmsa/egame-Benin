"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import FinishedTournamentCard from '@/components/FinishedTournamentCard';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import NewUserGuide from '@/components/NewUserGuide';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Globe, MapPin, History, Star, ChevronRight, Gamepad2, Facebook, Shield, UserCheck, Save, Filter, Zap, Users, Award, ArrowRight, Activity, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { showSuccess, showError } from '@/utils/toast';

const CITIES = ["Cotonou", "Porto-Novo", "Parakou", "Ouidah", "Abomey-Calavi", "Autre"];
const GAMES = ["Blur", "COD Modern Warfare 4", "COD Mobile", "BombSquad", "Clash Royale"];

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [finishedTournaments, setFinishedTournaments] = useState<any[]>([]);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [myTournaments, setMyTournaments] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});
  
  const [userCount, setUserCount] = useState(0);
  const [totalTournaments, setTotalTournaments] = useState(0);
  const [totalPrizes, setTotalPrizes] = useState(0);
  const [myTournamentCount, setMyTournamentCount] = useState(0);
  
  const [filterType, setFilterType] = useState<'All' | 'Online' | 'Presentiel'>('All');
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedGame, setSelectedGame] = useState<string>("all");
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [tempCity, setTempCity] = useState("Autre");
  const [savingProfile, setSavingProfile] = useState(false);

  const navigate = useNavigate();

  const fetchData = async () => {
    const { data: allData } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allData) {
      const active = allData.filter(t => t.status === 'active');
      setTournaments(active);
      setFinishedTournaments(allData.filter(t => t.status === 'finished'));
      setTotalTournaments(allData.length);
      
      const prizesSum = allData
        .filter(t => t.status === 'finished' && t.prize_pool)
        .reduce((acc, t) => {
          const amount = parseInt(t.prize_pool.replace(/[^0-9]/g, '')) || 0;
          return acc + amount;
        }, 0);
      setTotalPrizes(prizesSum);
    }

    const { data: leaders } = await supabase
      .from('leaderboard')
      .select('*')
      .order('wins', { ascending: false })
      .limit(3);
    if (leaders) setTopPlayers(leaders);

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
      
      // Logique du guide : seulement si pas encore vu et profil incomplet
      const hasSeenGuide = localStorage.getItem('egame_guide_seen');
      if (!hasSeenGuide && (!data.username || !data.city)) {
        setShowGuide(true);
        setShowOnboarding(true);
        setTempUsername(data.username || "");
        setTempCity(data.city || "Autre");
      }
    }

    const { count } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'Réussi');
    setMyTournamentCount(count || 0);
  };

  const handleCloseGuide = () => {
    setShowGuide(false);
    localStorage.setItem('egame_guide_seen', 'true');
  };

  const handleSaveProfile = async () => {
    const username = tempUsername.trim();
    if (!username) return showError("Le pseudo est obligatoire");
    setSavingProfile(true);
    try {
      const { error } = await supabase.from('profiles').update({ username, city: tempCity }).eq('id', session.user.id);
      if (error) throw error;
      showSuccess("Profil mis à jour !");
      setShowOnboarding(false);
      handleCloseGuide();
      fetchProfile(session.user.id);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchMyTournaments = async (userId: string) => {
    const { data } = await supabase.from('payments').select('tournament_id, tournaments(*)').eq('user_id', userId).eq('status', 'Réussi');
    if (data) {
      const activeOnes = data.map((p: any) => p.tournaments).filter((t: any) => t && t.status === 'active');
      setMyTournaments(activeOnes);
    }
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
        fetchMyTournaments(session.user.id);
      }
      setLoading(false);
    };
    init();
    fetchData();
    fetchParticipantCounts();
    fetchUserCount();
  }, []);

  const getLevelInfo = (count: number) => {
    if (count < 5) return { level: 1, next: 5, label: "Novice", progress: (count / 5) * 100 };
    if (count < 10) return { level: 2, next: 10, label: "Guerrier", progress: ((count - 5) / 5) * 100 };
    if (count < 20) return { level: 3, next: 20, label: "Élite", progress: ((count - 10) / 10) * 100 };
    return { level: 4, next: 40, label: "Maître", progress: ((count - 20) / 20) * 100 };
  };

  const levelInfo = getLevelInfo(myTournamentCount);
  const filteredTournaments = tournaments.filter(t => {
    const matchesType = filterType === 'All' || t.type === filterType;
    const matchesCity = selectedCity === "all" || t.city === selectedCity;
    const matchesGame = selectedGame === "all" || t.game === selectedGame;
    return matchesType && matchesCity && matchesGame;
  });

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 pt-4 md:pt-24">
      <SEO />
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-6">
        
        <div className="flex items-center justify-between mb-8">
          <Logo size="md" />
          <Link to="/profile" className="md:hidden">
            <div className="w-10 h-10 rounded-full border-2 border-violet-600 overflow-hidden bg-muted">
              {profile?.avatar_url && <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />}
            </div>
          </Link>
        </div>

        {/* Progression de Niveau */}
        <motion.section 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-card border border-border p-4 rounded-[1.5rem] shadow-sm"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-violet-600/10 rounded-lg flex items-center justify-center text-violet-500">
                <Zap size={16} />
              </div>
              <div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Niveau {levelInfo.level}</p>
                <h3 className="font-black text-xs">{levelInfo.label}</h3>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Prochain</p>
              <p className="text-[10px] font-black text-violet-500">{myTournamentCount} / {levelInfo.next}</p>
            </div>
          </div>
          <Progress value={levelInfo.progress} className="h-1.5 bg-muted" />
        </motion.section>

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

        <section className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-card border border-border p-3 rounded-2xl text-center shadow-sm flex flex-col items-center justify-center">
            <Users size={14} className="text-violet-500 mb-1" />
            <p className="text-xs font-black text-foreground leading-none mb-1">{userCount}</p>
            <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">Joueurs</p>
          </div>
          <div className="bg-card border border-border p-3 rounded-2xl text-center shadow-sm flex flex-col items-center justify-center">
            <Trophy size={14} className="text-yellow-500 mb-1" />
            <p className="text-xs font-black text-foreground leading-none mb-1">{totalTournaments}</p>
            <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">Tournois</p>
          </div>
          <div className="bg-card border border-border p-3 rounded-2xl text-center shadow-sm flex flex-col items-center justify-center">
            <Award size={14} className="text-cyan-500 mb-1" />
            <p className="text-xs font-black text-foreground leading-none mb-1">{totalPrizes.toLocaleString('fr-FR')}</p>
            <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">Prix (FCFA)</p>
          </div>
        </section>

        <section className="mb-12 space-y-6">
          <div className="flex items-center gap-2"><Filter size={14} className="text-violet-500" /><h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Explorer</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex bg-card border border-border rounded-xl p-1 h-10">
              <button onClick={() => setFilterType('All')} className={`flex-1 rounded-lg text-[9px] font-bold transition-all ${filterType === 'All' ? 'bg-violet-600 text-white' : 'text-muted-foreground'}`}>Tous</button>
              <button onClick={() => setFilterType('Online')} className={`flex-1 rounded-lg text-[9px] font-bold transition-all flex items-center justify-center gap-1 ${filterType === 'Online' ? 'bg-cyan-600 text-white' : 'text-muted-foreground'}`}><Globe size={12} /> En ligne</button>
              <button onClick={() => setFilterType('Presentiel')} className={`flex-1 rounded-lg text-[9px] font-bold transition-all flex items-center justify-center gap-1 ${filterType === 'Presentiel' ? 'bg-orange-600 text-white' : 'text-muted-foreground'}`}><MapPin size={12} /> Local</button>
            </div>
            <Select value={selectedCity} onValueChange={setSelectedCity}><SelectTrigger className="bg-card border-border rounded-xl h-10 text-[11px] font-bold"><div className="flex items-center gap-2"><MapPin size={14} className="text-violet-500" /><SelectValue placeholder="Ville" /></div></SelectTrigger><SelectContent className="bg-card border-border"><SelectItem value="all">Toutes les villes</SelectItem>{CITIES.map(city => (<SelectItem key={city} value={city}>{city}</SelectItem>))}</SelectContent></Select>
            <Select value={selectedGame} onValueChange={setSelectedGame}><SelectTrigger className="bg-card border-border rounded-xl h-10 text-[11px] font-bold"><div className="flex items-center gap-2"><Gamepad2 size={14} className="text-violet-500" /><SelectValue placeholder="Jeu" /></div></SelectTrigger><SelectContent className="bg-card border-border"><SelectItem value="all">Tous les jeux</SelectItem>{GAMES.map(game => (<SelectItem key={game} value={game}>{game}</SelectItem>))}</SelectContent></Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filteredTournaments.map((t) => (
              <TournamentCard key={t.id} id={t.id} title={t.title} game={t.game} image={t.image_url} date={new Date(t.start_date).toLocaleDateString('fr-FR')} participants={`${participantCounts[t.id] || 0}/${t.max_participants}`} entryFee={t.entry_fee.toString()} type={t.type as any} />
            ))}
          </div>
        </section>

        {myTournaments.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-black flex items-center gap-2 mb-4 uppercase tracking-widest text-muted-foreground"><Gamepad2 className="text-violet-500" size={16} /> Mes Inscriptions</h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {myTournaments.map((t) => (
                <div key={t.id} onClick={() => navigate(`/tournament/${t.id}`)} className="flex-shrink-0 w-52 bg-card border border-border rounded-2xl p-2.5 flex items-center gap-3 cursor-pointer hover:border-violet-500/50 transition-all shadow-sm">
                  <div className="w-9 h-9 rounded-lg overflow-hidden"><img src={t.image_url} className="w-full h-full object-cover" alt="" /></div>
                  <div className="flex-1 min-w-0"><p className="font-bold text-[10px] truncate">{t.title}</p><p className="text-violet-500 text-[8px] font-black uppercase tracking-tighter">{t.game}</p></div>
                  <ChevronRight size={12} className="text-muted-foreground" />
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-12 py-12 border-t border-border text-center space-y-8">
          <div className="flex items-center justify-center gap-6">
            <a href="https://www.facebook.com/profile.php?id=61588439640775" target="_blank" className="w-10 h-10 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><Facebook size={20} /></a>
            <a href="https://wa.me/2290141790790" target="_blank" className="w-10 h-10 bg-green-600/10 rounded-full flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-all"><MessageSquare size={20} /></a>
            <Link to="/leaderboard" className="w-10 h-10 bg-zinc-900/10 rounded-full flex items-center justify-center text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all"><Trophy size={20} /></Link>
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