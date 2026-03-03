"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import FinishedTournamentCard from '@/components/FinishedTournamentCard';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import NewUserGuide from '@/components/NewUserGuide';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Globe, MapPin, History, Star, ChevronRight, Gamepad2, Facebook, Shield, UserCheck, Save, Filter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
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
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});
  
  // Filtres
  const [filterType, setFilterType] = useState<'All' | 'Online' | 'Presentiel'>('All');
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedGame, setSelectedGame] = useState<string>("all");
  
  // Finalisation profil & Guide
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
      setTournaments(allData.filter(t => t.status === 'active'));
      setFinishedTournaments(allData.filter(t => t.status === 'finished'));
    }

    const { data: leaders } = await supabase
      .from('leaderboard')
      .select('*')
      .order('wins', { ascending: false })
      .limit(3);
    if (leaders) setTopPlayers(leaders);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (data) {
      setProfile(data);
      if (!data.username || !data.city) {
        setShowOnboarding(true);
        setShowGuide(true);
        setTempUsername(data.username || "");
        setTempCity(data.city || "Autre");
      }
    }
  };

  const handleSaveProfile = async () => {
    const username = tempUsername.trim();
    if (!username) return showError("Le pseudo est obligatoire");
    if (username.length < 3) return showError("Le pseudo doit faire au moins 3 caractères");
    
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username: username, 
          city: tempCity,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);
      
      if (error) {
        if (error.code === '23505') {
          throw new Error("Ce pseudo est déjà utilisé par un autre joueur.");
        }
        throw error;
      }

      showSuccess("Profil mis à jour !");
      setShowOnboarding(false);
      fetchProfile(session.user.id);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchMyTournaments = async (userId: string) => {
    const { data } = await supabase
      .from('payments')
      .select('tournament_id, tournaments(*)')
      .eq('user_id', userId)
      .eq('status', 'Réussi');
    
    if (data) {
      const activeOnes = data
        .map((p: any) => p.tournaments)
        .filter((t: any) => t && t.status === 'active');
      setMyTournaments(activeOnes);
    }
  };

  const fetchParticipantCounts = async () => {
    const { data } = await supabase
      .from('payments')
      .select('tournament_id')
      .eq('status', 'Réussi');
    
    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((p: any) => {
        counts[p.tournament_id] = (counts[p.tournament_id] || 0) + 1;
      });
      setParticipantCounts(counts);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchMyTournaments(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchMyTournaments(session.user.id);
      }
    });

    fetchData();
    fetchParticipantCounts();

    return () => subscription.unsubscribe();
  }, []);

  const filteredTournaments = tournaments.filter(t => {
    const matchesType = filterType === 'All' || t.type === filterType;
    const matchesCity = selectedCity === "all" || t.city === selectedCity;
    const matchesGame = selectedGame === "all" || t.game === selectedGame;
    return matchesType && matchesCity && matchesGame;
  });

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;

  if (!session) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col pt-6">
        <SEO />
        <main className="flex-1 flex flex-col items-center justify-start pt-16 md:justify-center md:pt-0 px-8 text-center">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-6">
            <Logo size="lg" showText={false} />
          </motion.div>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl font-black mb-4">eGame <span className="text-violet-500">Bénin</span></motion.h1>
          <motion.p className="text-muted-foreground text-lg mb-10 max-w-xs">L'arène ultime pour les gamers béninois. Relevez le défi et gagnez des prix.</motion.p>
          <div className="w-full max-w-xs space-y-4">
            <Link to="/auth" className="block"><button className="w-full bg-violet-600 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-violet-500/20 text-white">Se connecter</button></Link>
            <Link to="/auth" className="block"><button className="w-full bg-card py-5 rounded-2xl font-bold text-lg border border-border">Créer un compte</button></Link>
          </div>
        </main>
      </div>
    );
  }

  const userName = profile?.username || session.user.email?.split('@')[0];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 pt-4 md:pt-24">
      <SEO />
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-6">
        
        {/* Mobile Logo Header - Aligned Left */}
        <div className="flex items-center justify-start mb-8 md:hidden">
          <Logo size="md" />
        </div>

        <AnimatePresence>
          {showGuide && (
            <NewUserGuide onClose={() => setShowGuide(false)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showOnboarding && (
            <motion.section 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-10 overflow-hidden"
            >
              <div className="bg-violet-600/10 border border-violet-500/30 rounded-[2.5rem] p-8">
                <div className="flex items-center gap-3 mb-6">
                  <UserCheck className="text-violet-500" size={24} />
                  <h2 className="text-xl font-black">Finalisez votre profil</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-2">Votre Pseudo Unique</label>
                    <Input 
                      placeholder="Ex: ProGamer229" 
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                      className="bg-card border-border rounded-2xl h-14"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-2">Votre Ville</label>
                    <Select value={tempCity} onValueChange={setTempCity}>
                      <SelectTrigger className="bg-card border-border rounded-2xl h-14">
                        <SelectValue placeholder="Choisir une ville" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {CITIES.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={savingProfile}
                      className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold gap-2"
                    >
                      <Save size={20} />
                      {savingProfile ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-4 ml-2 italic">Le pseudo est définitif et doit être unique.</p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <header className="mb-8">
          <p className="text-violet-500 font-bold text-xs uppercase tracking-widest mb-1">Salut, {userName}</p>
        </header>

        {/* Filtres Améliorés et Compacts */}
        <section className="mb-12 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={16} className="text-violet-500" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Filtres</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Type (En ligne / Présentiel) */}
            <div className="flex bg-card border border-border rounded-xl p-1 h-10">
              <button 
                onClick={() => setFilterType('All')} 
                className={`flex-1 rounded-lg text-[9px] font-bold transition-all ${filterType === 'All' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Tous
              </button>
              <button 
                onClick={() => setFilterType('Online')} 
                className={`flex-1 rounded-lg text-[9px] font-bold transition-all flex items-center justify-center gap-1 ${filterType === 'Online' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Globe size={12} /> En ligne
              </button>
              <button 
                onClick={() => setFilterType('Presentiel')} 
                className={`flex-1 rounded-lg text-[9px] font-bold transition-all flex items-center justify-center gap-1 ${filterType === 'Presentiel' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <MapPin size={12} /> Présentiel
              </button>
            </div>

            {/* Ville */}
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="bg-card border-border rounded-xl h-10 text-[11px] font-bold">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-violet-500" />
                  <SelectValue placeholder="Ville" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Toutes les villes</SelectItem>
                {CITIES.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Jeu */}
            <Select value={selectedGame} onValueChange={setSelectedGame}>
              <SelectTrigger className="bg-card border-border rounded-xl h-10 text-[11px] font-bold">
                <div className="flex items-center gap-2">
                  <Gamepad2 size={14} className="text-violet-500" />
                  <SelectValue placeholder="Jeu" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Tous les jeux</SelectItem>
                {GAMES.map(game => (
                  <SelectItem key={game} value={game}>{game}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filteredTournaments.length > 0 ? (
              filteredTournaments.map((t) => (
                <TournamentCard 
                  key={t.id} id={t.id} title={t.title} game={t.game} image={t.image_url}
                  date={new Date(t.start_date || Date.now()).toLocaleDateString('fr-FR')}
                  participants={`${participantCounts[t.id] || 0}/${t.max_participants || 40}`}
                  entryFee={t.entry_fee.toString()} type={t.type === 'Online' ? 'Online' : 'Presentiel'}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-card/50 rounded-[2.5rem] border border-border border-dashed">
                <Trophy size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground font-bold">Aucun tournoi ne correspond à vos critères.</p>
              </div>
            )}
          </div>
        </section>

        {/* Mes Inscriptions */}
        {myTournaments.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-black flex items-center gap-2 mb-4"><Gamepad2 className="text-violet-500" size={18} /> Mes Inscriptions</h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {myTournaments.map((t) => (
                <motion.div 
                  key={t.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/tournament/${t.id}`)}
                  className="flex-shrink-0 w-56 bg-card border border-border rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:border-violet-500 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden">
                    <img src={t.image_url} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs truncate">{t.title}</p>
                    <p className="text-violet-400 text-[9px] font-bold uppercase">{t.game}</p>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Top Joueurs */}
        {topPlayers.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black flex items-center gap-2"><Star className="text-yellow-500" size={18} /> Top Joueurs</h2>
              <Link to="/leaderboard" className="text-[10px] font-bold text-muted-foreground hover:text-violet-400 flex items-center gap-1 uppercase tracking-widest">Voir tout <ChevronRight size={12} /></Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {topPlayers.map((p, i) => (
                <div key={i} className="bg-card border border-border p-3 rounded-2xl text-center relative overflow-hidden group shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-muted mx-auto mb-2 border-2 border-violet-500/20 overflow-hidden">
                    <img src={p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <p className="font-bold text-[10px] truncate">{p.username}</p>
                  <p className="text-[9px] text-violet-500 font-black">{p.wins} PTS</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tournois Terminés */}
        {finishedTournaments.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-black mb-6 flex items-center gap-2"><History size={18} className="text-muted-foreground" /> Tournois Terminés</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {finishedTournaments.map((t) => (
                <FinishedTournamentCard 
                  key={t.id} title={t.title} game={t.game} image={t.image_url}
                  prizePool={t.prize_pool} winnerName={t.winner_name || "Inconnu"} winnerAvatar={t.winner_avatar}
                />
              ))}
            </div>
          </section>
        )}

        <footer className="mt-12 py-12 border-t border-border text-center space-y-4">
          <div className="flex flex-col items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <Link to="/privacy" className="hover:text-violet-500 transition-colors flex items-center gap-1 underline decoration-violet-500/30 underline-offset-4">
              <Shield size={12} /> Privacy
            </Link>
          </div>
          <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest mt-4">
            © 2026 eGame Bénin • Tous droits réservés
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;