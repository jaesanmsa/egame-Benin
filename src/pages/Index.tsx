"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import { motion } from 'framer-motion';
import { Trophy, Gamepad2, Zap, Target } from 'lucide-react';

const Index = () => {
  const tournaments = [
    {
      title: "Bénin Pro League FIFA 24",
      game: "FIFA 24",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
      date: "25 Mai, 2024",
      participants: "12/64",
      entryFee: "10.00",
      type: "Presentiel" as const
    },
    {
      title: "Call of Duty Mobile: Cotonou Cup",
      game: "COD Mobile",
      image: "https://images.unsplash.com/photo-1552824236-0776282ffdee?q=80&w=2070&auto=format&fit=crop",
      date: "02 Juin, 2024",
      participants: "45/100",
      entryFee: "5.00",
      type: "Online" as const
    },
    {
      title: "Mobile Legends: Bang Bang",
      game: "MLBB",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop",
      date: "15 Juin, 2024",
      participants: "20/32",
      entryFee: "15.00",
      type: "Online" as const
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 md:pb-0 md:pt-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
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
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 text-lg mb-8"
            >
              Participez aux plus grands tournois nationaux, gagnez des prix en dollars et devenez une légende.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-violet-500/20">
                Explorer les tournois
              </button>
              <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-2xl font-bold transition-all">
                Comment ça marche ?
              </button>
            </motion.div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-l from-zinc-950 to-transparent" />
            <img 
              src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1930&auto=format&fit=crop" 
              alt="Gaming" 
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Categories */}
        <section className="mb-12 overflow-x-auto no-scrollbar">
          <div className="flex gap-4 min-w-max">
            {[
              { icon: <Gamepad2 size={20} />, label: "Tous les jeux" },
              { icon: <Trophy size={20} />, label: "Compétitions" },
              { icon: <Target size={20} />, label: "FPS" },
              { icon: <Zap size={20} />, label: "Battle Royale" },
            ].map((cat, i) => (
              <button 
                key={i}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all ${i === 0 ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Tournaments Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Tournois Populaires</h2>
            <button className="text-violet-400 font-medium hover:underline">Voir tout</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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