"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import { motion } from 'framer-motion';
import { Trophy, LogIn, UserPlus, Zap, Star, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const tournaments = [
    {
      id: "cod-mw4",
      title: "Bénin Pro League: COD MW4",
      game: "COD MW4",
      image: "https://images.unsplash.com/photo-1552824236-0776282ffdee?q=80&w=2070&auto=format&fit=crop",
      date: "25 Mai, 2024",
      participants: "12/64",
      entryFee: "2000",
      type: "Presentiel" as const
    },
    {
      id: "blur",
      title: "Blur Racing Cup: Cotonou",
      game: "Blur",
      image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=2070&auto=format&fit=crop",
      date: "02 Juin, 2024",
      participants: "45/100",
      entryFee: "2500",
      type: "Online" as const
    },
    {
      id: "clash-royale",
      title: "Clash Royale: King of Benin",
      game: "Clash Royale",
      image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=2071&auto=format&fit=crop",
      date: "15 Juin, 2024",
      participants: "20/32",
      entryFee: "1000",
      type: "Online" as const
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // VUE NON CONNECTÉE (Mur d'accueil)
  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-violet-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-violet-500/40"
          >
            <Trophy size={48} className="text-white" />
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
              <span className="text-[10px] font-bold uppercase">Elite</span>
            </div>
          </div>
        </main>
        
        <footer className="p-8 text-center text-zinc-600 text-xs font-medium">
          © 2024 eGame Bénin • Version 1.0.0
        </footer>
      </div>
    );
  }

  // VUE CONNECTÉE (Tableau de bord)
  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 md:pt-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-10">
          <p className="text-violet-500 font-bold text-sm uppercase tracking-widest mb-1">Bienvenue, Joueur</p>
          <h1 className="text-3xl font-black">Tableau de bord</h1>
        </header>

        <section className="relative rounded-[2.5rem] overflow-hidden mb-12 bg-gradient-to-br from-violet-900/40 to-zinc-900 border border-violet-500/20 p-8">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-violet-500/20 text-violet-400 px-4 py-2 rounded-full text-xs font-bold mb-4">
              <Zap size={14} />
              <span>OFFRE SPÉCIALE</span>
            </div>
            <h2 className="text-2xl font-black mb-4">Prêt pour la compétition ?</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-md">
              Inscrivez-vous à votre premier tournoi aujourd'hui et recevez un bonus de bienvenue.
            </p>
            <button className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95">
              Voir les offres
            </button>
          </div>
        </header>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Tournois Disponibles</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((t, i) => (
              <TournamentCard key={i} {...t} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;