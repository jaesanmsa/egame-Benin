"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import FinishedTournamentCard from '@/components/FinishedTournamentCard';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import { Search, Trophy, Globe, MapPin, PlusCircle, History, Star, ChevronRight, Gamepad2, Facebook, Shield } from 'lucide-react';
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

  const featuredTournament = filteredTournaments.find(t => t.is_featured) || filteredTournaments[0];

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
        <footer className="py-10 text-center space-y-4">
          <div className="flex flex-col items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <Link to="/privacy" className="hover:text-violet-500 transition-colors flex items-center gap-1 underline decoration-violet-500/30 underline-offset-4">
              <Shield size={12} /> Politique de Confidentialité
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-violet-500 transition-colors">Conditions d'Utilisation</Link>
              <Link to="/contact" className="hover:text-violet-500 transition-colors">Aide</Link>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest mt-4">© 2026 eGame Bénin</p>
        </footer>
      </div>
    );
  }

  const userName = session.user.user_metadata?.username || session.user.email?.split('@')[0];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 pt-4 md:pt-24">
      <SEO />
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-6">
        <header className="mb-8">
          <p className="text-violet-500 font-bold text-xs uppercase tracking-widest mb-1">Salut, {userName}</p>
          <h1 className="text-2xl md:text-3xl font-black">Prêt pour la victoire ?</h1>
        </header>

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

        {featuredTournament && (
          <section className="mb-10">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              onClick={() => navigate(`/tournament/${featuredTournament.id}`)}
              className="relative h-[180px] md:h-[300px] rounded-[2rem] overflow-hidden cursor-pointer group shadow-xl"
            >
              <img src={featuredTournament.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="bg-violet-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest mb-2 inline-block">À la une</span>
                <h2 className="text-xl md:text-3xl font-black mb-1 text-white">{featuredTournament.title}</h2>
                <div className="flex items-center gap-3 text-zinc-200 text-xs">
                  <div className="flex items-center gap-1"><Trophy size={14} className="text-yellow-500" /> {featuredTournament.prize_pool}</div>
                  <div className="flex items-center gap-1"><Globe size={14} className="text-cyan-500" /> {featuredTournament.type === 'Online' ? 'En ligne' : 'Présentiel'}</div>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button onClick={() => setFilterType('All')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterType === 'All' ? 'bg-violet-600 text-white' : 'bg-card text-muted-foreground border border-border'}`}>Tous</button>
              <button onClick={() => setFilterType('Online')} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${filterType === 'Online' ? 'bg-cyan-600 text-white' : 'bg-card text-muted-foreground border border-border'}`} title="En ligne"><Globe size={16} /></button>
              <button onClick={() => setFilterType('Presentiel')} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${filterType === 'Presentiel' ? 'bg-orange-600 text-white' : 'bg-card text-muted-foreground border border-border'}`} title="Présentiel"><MapPin size={16} /></button>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input placeholder="Rechercher..." className="pl-9 h-10 text-sm bg-card border-border rounded-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        <section className="mb-12">
          <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-black mb-2">Rejoignez la communauté !</h2>
              <p className="text-muted-foreground text-sm max-w-md">Suivez-nous sur Facebook pour ne rien rater des actualités et des lives.</p>
            </div>
            <button 
              onClick={() => window.open("https://www.facebook.com/profile.php?id=61588439640775", "_blank")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-blue-500/20 transition-all text-sm"
            >
              <Facebook size={20} />
              Voir notre Facebook
            </button>
          </div>
        </section>

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
              <Shield size={12} /> Politique de Confidentialité
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-violet-500 transition-colors">Conditions d'Utilisation</Link>
              <Link to="/contact" className="hover:text-violet-500 transition-colors">Aide & Support</Link>
            </div>
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