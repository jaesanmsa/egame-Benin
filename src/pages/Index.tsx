"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import { motion } from 'framer-motion';
import { Zap, Mail, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
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
    },
    {
      id: "bombsquad",
      title: "BombSquad Party: Parakou",
      game: "BombSquad",
      image: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?q=80&w=2070&auto=format&fit=crop",
      date: "20 Juin, 2024",
      participants: "8/16",
      entryFee: "1500",
      type: "Presentiel" as const
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 md:pb-0 md:pt-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <section className="relative rounded-[2.5rem] overflow-hidden mb-12 bg-gradient-to-br from-violet-900/40 to-zinc-900 border border-violet-500/20 p-8 md:p-16">
          <div className="relative z-10 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-violet-500/20 text-violet-400 px-4 py-2 rounded-full text-sm font-bold mb-6"
            >
              <Zap size={16} />
              <span>NOUVEAU TOURNOI DISPONIBLE</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black mb-6 leading-tight"
            >
              DOMINEZ LA SCÈNE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">GAMING AU BÉNIN</span>
            </motion.h1>
            <p className="text-zinc-400 text-lg mb-8">
              Participez aux tournois de COD, Blur, Clash Royale et BombSquad. Gagnez des prix en FCFA.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/auth">
                <button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-violet-500/20 flex items-center gap-2">
                  <LogIn size={20} />
                  Se connecter maintenant
                </button>
              </Link>
              <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-2xl font-bold transition-all">
                Explorer les tournois
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Tournois Actifs</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tournaments.map((t, i) => (
              <TournamentCard key={i} {...t} />
            ))}
          </div>
        </section>

        {/* Support Section */}
        <section className="mt-20 p-8 bg-zinc-900 rounded-[2rem] border border-zinc-800 text-center">
          <h2 className="text-2xl font-bold mb-4">Besoin d'aide ?</h2>
          <p className="text-zinc-400 mb-6">Notre équipe de support est disponible pour vous aider.</p>
          <a 
            href="mailto:support@egamebenin.com" 
            className="inline-flex items-center gap-3 bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-xl font-bold transition-colors"
          >
            <Mail size={20} className="text-violet-500" />
            support@egamebenin.com
          </a>
        </section>
      </main>
    </div>
  );
};

export default Index;