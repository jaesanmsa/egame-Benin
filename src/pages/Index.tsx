"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import Logo from '@/components/Logo';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Zap, Star, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});

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
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <Logo size="lg" showText={false} />
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black mb-4 leading-tight"
          >
            eGame <span className="text-violet-500">Bénin</span>
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg mb-12 max-w-xs"
          >
            L'arène ultime pour les gamers béninois. Relevez le défi et gagnez des prix.
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-xs space-y-4"
          >
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

          <div className="mt-16 grid grid-cols-3 gap-8 opacity-30">
            <div className="flex flex-col items-center gap-2">
              <Zap size={24} />
              <span className="text-[10px] font-bold uppercase">Rapide</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Target size={24} />
              <span className="text-[10px] font-bold uppercase">Précis</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Star size={24} />
              <span className="text-[10px] font-bold uppercase">Élite</span>
            </div>
          </div>
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
        <div className="flex justify-center mb-8 md:hidden">
          <Logo size="sm" />
        </div>

        <header className="mb-10">
          <p className="text-violet-500 font-bold text-sm uppercase tracking-widest mb-1">Bienvenue, {userName}</p>
          <h1 className="text-3xl font-black leading-tight">
            Prêt à dominer l'arène ? <br />
            <span className="text-zinc-500 text-xl font-medium">L'heure de la gloire a sonné !</span>
          </h1>
        </header>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Tournois Disponibles</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((t) => (
              <TournamentCard key={t.id} {...t} />
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-auto p-8 text-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
        eGame Benin @2026 • v1.0
      </footer>
    </div>
  );
};

export default Index;