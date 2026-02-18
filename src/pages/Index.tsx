"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import Logo from '@/components/Logo';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Zap, Star, Target, Search, Trophy, Globe, MapPin, CheckCircle2, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<'All' | 'Online' | 'Presentiel'>('All');
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const fetchParticipantCounts = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('tournament_id')
      .eq('status', 'Réussi');
    
    if (!error && data) {
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

    fetchParticipantCounts();

    const channel = supabase
      .channel('public-payments-index')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => {
          fetchParticipantCounts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const tournaments = [
    {
      id: "pubg-mobile",
      title: "PUBG Mobile: Battle of Benin",
      game: "PUBG Mobile",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
      date: today,
      participants: `${participantCounts['pubg-mobile'] || 0}/40`,
      entryFee: "1500",
      type: "Online" as const
    },
    {
      id: "cod-mw4",
      title: "Bénin Pro League: COD MW4 (Cotonou)",
      game: "COD MW4",
      image: "/images/games/COD.jpg",
      date: today,
      participants: `${participantCounts['cod-mw4'] || 0}/40`,
      entryFee: "2000",
      type: "Presentiel" as const
    },
    {
      id: "blur",
      title: "Blur Racing Cup: Cotonou",
      game: "Blur",
      image: "/images/games/blur.jpg",
      date: today,
      participants: `${participantCounts['blur'] || 0}/40`,
      entryFee: "2000",
      type: "Presentiel" as const
    },
    {
      id: "clash-royale",
      title: "Clash Royale: King of Benin",
      game: "Clash Royale",
      image: "/images/games/clash-royale.jpg",
      date: today,
      participants: `${participantCounts['clash-royale'] || 0}/50`,
      entryFee: "1000",
      type: "Online" as const
    },
    {
      id: "bombsquad",
      title: "BombSquad Party: Cotonou",
      game: "BombSquad",
      image: "/images/games/bombsquad.png",
      date: today,
      participants: `${participantCounts['bombsquad'] || 0}/40`,
      entryFee: "1500",
      type: "Presentiel" as const
    }
  ];

  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.game.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const featuredTournament = tournaments[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col pt-12">
        <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8">
            <Logo size="lg" showText={false} />
          </motion.div>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-4xl font-black mb-4 leading-tight">
            eGame <span className="text-violet-500">Bénin</span>
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-zinc-400 text-lg mb-12 max-w-xs">
            L'arène ultime pour les gamers béninois. Relevez le défi et gagnez des prix.
          </motion.p>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="w-full max-w-xs space-y-4">
            <Link to="/auth" className="block">
              <button className="w-full bg-violet-600 hover:bg-violet-700 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-violet-500/20 flex items-center justify-center gap-3 transition-all active:scale-95">
                <LogIn size={22} />
                Se connecter
              </button>
            </Link>
            <Link to="/auth" className="block">
              <button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-5 rounded-2xl font-bold text-lg border border-zinc-800 flex items-center justify-center gap-3 transition-all active:scale-95">
                <UserPlus size={22} />
                Créer un compte
              </button>
            </Link>
          </motion.div>
        </main>
        <footer className="p-8 text-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
          eGame Benin @2026 • v1.0
        </footer>
      </div>
    );
  }

  const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 pt-4 md:pt-24">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-10">
          <p className="text-violet-500 font-bold text-sm uppercase tracking-widest mb-1">Bienvenue, {userName}</p>
          <h1 className="text-3xl font-black leading-tight">
            Prêt à dominer l'arène ? <br />
            <span className="text-zinc-500 text-xl font-medium">L'heure de la gloire a sonné !</span>
          </h1>
        </header>

        <section className="mb-12">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            onClick={() => navigate(`/tournament/${featuredTournament.id}`)}
            className="relative h-[300px] md:h-[400px] rounded-[2.5rem] overflow-hidden cursor-pointer group"
          >
            <img src={featuredTournament.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-violet-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">À la une</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black mb-2">{featuredTournament.title}</h2>
              <div className="flex items-center gap-4 text-zinc-300 text-sm">
                <div className="flex items-center gap-1"><Trophy size={16} className="text-yellow-500" /> 35.000 FCFA</div>
                <div className="flex items-center gap-1"><Globe size={16} className="text-cyan-500" /> {featuredTournament.type}</div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              <button onClick={() => setFilterType('All')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filterType === 'All' ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}>Tous</button>
              <button onClick={() => setFilterType('Online')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${filterType === 'Online' ? 'bg-cyan-600 text-white' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}><Globe size={16} /> En ligne</button>
              <button onClick={() => setFilterType('Presentiel')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${filterType === 'Presentiel' ? 'bg-orange-600 text-white' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}><MapPin size={16} /> Présentiel</button>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-3 text-zinc-500" size={18} />
              <Input placeholder="Rechercher un tournoi..." className="pl-10 bg-zinc-900 border-zinc-800 rounded-xl focus:ring-violet-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((t) => (
              <TournamentCard key={t.id} {...t} />
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-500">
              <CheckCircle2 size={20} />
            </div>
            <h2 className="text-xl font-bold">Tournois Terminés</h2>
          </div>
          <div className="text-center py-12 bg-zinc-900/30 rounded-[2rem] border border-zinc-800 border-dashed">
            <p className="text-zinc-500 text-sm">Les résultats des tournois s'afficheront ici prochainement.</p>
          </div>
        </section>
      </main>

      <footer className="mt-auto p-12 border-t border-zinc-900 flex flex-col items-center gap-6">
        <Logo size="sm" />
        <div className="flex items-center gap-8 text-zinc-500 text-xs font-bold uppercase tracking-widest">
          <Link to="/contact" className="hover:text-white transition-colors">Aide</Link>
          <Link to="/leaderboard" className="hover:text-white transition-colors">Classement</Link>
          <Link to="/download-logo" className="flex items-center gap-2 hover:text-white transition-colors"><Download size={14} /> Logo</Link>
        </div>
        <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">eGame Benin @2026 • v1.0</p>
      </footer>
    </div>
  );
};

export default Index;