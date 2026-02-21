"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import FinishedTournamentCard from '@/components/FinishedTournamentCard';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import { Search, Trophy, Globe, MapPin, PlusCircle, History, Star, ChevronRight, Gamepad2, Facebook } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [finishedTournaments, setFinishedTournaments] = useState<any[]>([]);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [myTournaments, setMyTournaments] = useState<any[]>([]);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<'All' | 'Online' | 'Presentiel'>('All');
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
      if (session?.user) fetchMyTournaments(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchMyTournaments(session.user.id);
    });

    fetchData();
    fetchParticipantCounts();

    return () => subscription.unsubscribe();
  }, []);

  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.game.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  // On cherche d'abord le tournoi marqué "is_featured", sinon on prend le premier
  const featuredTournament = filteredTournaments.find(t => t.is_featured) || filteredTournaments[0];

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;

  if (!session) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col pt-12">
        <SEO />
        <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8">
            <Logo size="lg" showText={false} />
          </motion.div>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl font-black mb-4">eGame <span className="text-violet-500">Bénin</span></motion.h1>
          <motion.p className="text-muted-foreground text-lg mb-12 max-w-xs">L'arène ultime pour les gamers béninois. Relevez le défi et gagnez des prix.</motion.p>
          <div className="w-full max-w-xs space-y-4">
            <Link to="/auth" className="block"><button className="w-full bg-violet-600 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-violet-500/20 text-white">Se connecter</button></Link>
            <Link to="/auth" className="block"><button className="w-full bg-card py-5 rounded-2xl font-bold text-lg border border-border">Créer un compte</button></Link>
          </div>
          <button 
            onClick={() => window.open("https://www.facebook.com/profile.php?id=61588439640775", "_blank")}
            className="mt-12 flex items-center gap-2 text-blue-500 font-bold hover:underline"
          >
            <Facebook size={18} /> Suivez-nous sur Facebook
          </button>
        </main>
      </div>
    );
  }

  const userName = session.user.user_metadata?.username || session.user.email?.split('@')[0];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 pt-4 md:pt-24">
      <SEO />
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-10">
          <p className="text-violet-500 font-bold text-sm uppercase tracking-widest mb-1">Salut, {userName}</p>
          <h1 className="text-3xl font-black">Prêt pour la victoire ?</h1>
        </header>

        {myTournaments.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-black flex items-center gap-2 mb-6"><Gamepad2 className="text-violet-500" size={20} /> Mes Inscriptions</h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
              {myTournaments.map((t) => (
                <motion.div 
                  key={t.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/tournament/${t.id}`)}
                  className="flex-shrink-0 w-64 bg-card border border-border rounded-3xl p-4 flex items-center gap-4 cursor-pointer hover:border-violet-500 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl overflow-hidden">
                    <img src={t.image_url} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{t.title}</p>
                    <p className="text-violet-400 text-[10px] font-bold uppercase">{t.game}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {topPlayers.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black flex items-center gap-2"><Star className="text-yellow-500" size={20} /> Top Joueurs</h2>
              <Link to="/leaderboard" className="text-xs font-bold text-muted-foreground hover:text-violet-400 flex items-center gap-1 uppercase tracking-widest">Voir tout <ChevronRight size={14} /></Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {topPlayers.map((p, i) => (
                <div key={i} className="bg-card border border-border p-4 rounded-3xl text-center relative overflow-hidden group shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 border-2 border-violet-500/20 overflow-hidden">
                    <img src={p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <p className="font-bold text-xs truncate">{p.username}</p>
                  <p className="text-[10px] text-violet-500 font-black">{p.wins} PTS</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {featuredTournament && (
          <section className="mb-12">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              onClick={() => navigate(`/tournament/${featuredTournament.id}`)}
              className="relative h-[250px] md:h-[400px] rounded-[2.5rem] overflow-hidden cursor-pointer group shadow-xl"
            >
              <img src={featuredTournament.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <span className="bg-violet-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">À la une</span>
                <h2 className="text-2xl md:text-4xl font-black mb-2 text-white">{featuredTournament.title}</h2>
                <div className="flex items-center gap-4 text-zinc-200 text-sm">
                  <div className="flex items-center gap-1"><Trophy size={16} className="text-yellow-500" /> {featuredTournament.prize_pool}</div>
                  <div className="flex items-center gap-1"><Globe size={16} className="text-cyan-500" /> {featuredTournament.type === 'Online' ? 'En ligne' : 'Présentiel'}</div>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              <button onClick={() => setFilterType('All')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filterType === 'All' ? 'bg-violet-600 text-white' : 'bg-card text-muted-foreground border border-border'}`}>Tous</button>
              <button onClick={() => setFilterType('Online')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filterType === 'Online' ? 'bg-cyan-600 text-white' : 'bg-card text-muted-foreground border border-border'}`}><Globe size={16} /> En ligne</button>
              <button onClick={() => setFilterType('Presentiel')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filterType === 'Presentiel' ? 'bg-orange-600 text-white' : 'bg-card text-muted-foreground border border-border'}`}><MapPin size={16} /> Présentiel</button>
            </div>
            <div className="relative w-full md:w-72">
              <Input placeholder="Rechercher..." className="pl-10 bg-card border-border rounded-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((t) => (
              <TournamentCard 
                key={t.id} id={t.id} title={t.title} game={t.game} image={t.image_url}
                date={new Date(t.start_date || Date.now()).toLocaleDateString('fr-FR')}
                participants={`${participantCounts[t.id] || 0}/${t.max_participants || 40}`}
                entryFee={t.entry_fee.toString()} type={t.type === 'Online' ? 'Online' : 'Presentiel'}
              />
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-black mb-4">Rejoignez la communauté !</h2>
              <p className="text-muted-foreground max-w-md">Suivez-nous sur Facebook pour ne rien rater des actualités, des lives et des résultats des tournois.</p>
            </div>
            <button 
              onClick={() => window.open("https://www.facebook.com/profile.php?id=61588439640775", "_blank")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-blue-500/20 transition-all"
            >
              <Facebook size={24} />
              Voir notre Facebook
            </button>
          </div>
        </section>

        {finishedTournaments.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xl font-black mb-8 flex items-center gap-2"><History size={20} className="text-muted-foreground" /> Tournois Terminés</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {finishedTournaments.map((t) => (
                <FinishedTournamentCard 
                  key={t.id} title={t.title} game={t.game} image={t.image_url}
                  prizePool={t.prize_pool} winnerName={t.winner_name || "Inconnu"} winnerAvatar={t.winner_avatar}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;