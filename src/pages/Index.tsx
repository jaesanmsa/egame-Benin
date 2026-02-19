"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import FinishedTournamentCard from '@/components/FinishedTournamentCard';
import Logo from '@/components/Logo';
import { motion } from 'framer-motion';
import { Search, Trophy, Globe, MapPin, PlusCircle, History, Star, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [finishedTournaments, setFinishedTournaments] = useState<any[]>([]);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
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

    // Top 3 joueurs pour l'accueil
    const { data: leaders } = await supabase
      .from('leaderboard')
      .select('*')
      .order('wins', { ascending: false })
      .limit(3);
    if (leaders) setTopPlayers(leaders);
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
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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

  const featuredTournament = filteredTournaments[0];

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col pt-12">
        <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8">
            <Logo size="lg" showText={false} />
          </motion.div>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl font-black mb-4">eGame <span className="text-violet-500">Bénin</span></motion.h1>
          <motion.p className="text-zinc-400 text-lg mb-12 max-w-xs">L'arène ultime pour les gamers béninois. Relevez le défi et gagnez des prix.</motion.p>
          <div className="w-full max-w-xs space-y-4">
            <Link to="/auth" className="block"><button className="w-full bg-violet-600 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-violet-500/20">Se connecter</button></Link>
            <Link to="/auth" className="block"><button className="w-full bg-zinc-900 py-5 rounded-2xl font-bold text-lg border border-zinc-800">Créer un compte</button></Link>
          </div>
        </main>
      </div>
    );
  }

  const userName = session.user.user_metadata?.username || session.user.email?.split('@')[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 pt-4 md:pt-24">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-10">
          <p className="text-violet-500 font-bold text-sm uppercase tracking-widest mb-1">Salut, {userName}</p>
          <h1 className="text-3xl font-black">Prêt pour la victoire ?</h1>
        </header>

        {/* Top Players Mini-Section */}
        {topPlayers.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black flex items-center gap-2"><Star className="text-yellow-500" size={20} /> Top Joueurs</h2>
              <Link to="/leaderboard" className="text-xs font-bold text-zinc-500 hover:text-violet-400 flex items-center gap-1 uppercase tracking-widest">Voir tout <ChevronRight size={14} /></Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {topPlayers.map((p, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-3xl text-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 rounded-full bg-zinc-800 mx-auto mb-3 border-2 border-violet-500/20 overflow-hidden">
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
              className="relative h-[250px] md:h-[400px] rounded-[2.5rem] overflow-hidden cursor-pointer group"
            >
              <img src={featuredTournament.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <span className="bg-violet-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">À la une</span>
                <h2 className="text-2xl md:text-4xl font-black mb-2">{featuredTournament.title}</h2>
                <div className="flex items-center gap-4 text-zinc-300 text-sm">
                  <div className="flex items-center gap-1"><Trophy size={16} className="text-yellow-500" /> {featuredTournament.prize_pool}</div>
                  <div className="flex items-center gap-1"><Globe size={16} className="text-cyan-500" /> {featuredTournament.type}</div>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              <button onClick={() => setFilterType('All')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filterType === 'All' ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-500'}`}>Tous</button>
              <button onClick={() => setFilterType('Online')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filterType === 'Online' ? 'bg-cyan-600 text-white' : 'bg-zinc-900 text-zinc-500'}`}><Globe size={16} /> En ligne</button>
              <button onClick={() => setFilterType('Presentiel')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filterType === 'Presentiel' ? 'bg-orange-600 text-white' : 'bg-zinc-900 text-zinc-500'}`}><MapPin size={16} /> Présentiel</button>
            </div>
            <div className="relative w-full md:w-72">
              <Input placeholder="Rechercher..." className="pl-10 bg-zinc-900 border-zinc-800 rounded-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((t) => (
              <TournamentCard 
                key={t.id} id={t.id} title={t.title} game={t.game} image={t.image_url}
                date={new Date(t.start_date || Date.now()).toLocaleDateString('fr-FR')}
                participants={`${participantCounts[t.id] || 0}/${t.max_participants || 40}`}
                entryFee={t.entry_fee.toString()} type={t.type}
              />
            ))}
          </div>
        </section>

        {finishedTournaments.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xl font-black mb-8 flex items-center gap-2"><History size={20} className="text-zinc-500" /> Tournois Terminés</h2>
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