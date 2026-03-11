"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Gamepad2, ChevronRight, Trophy, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const GAMES_LIST = [
  { id: 'free-fire', name: 'Free Fire', icon: '🔥', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800' },
  { id: 'efootball', name: 'eFootball', icon: '⚽', image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800' },
  { id: 'clash-royale', name: 'Clash Royale', icon: '👑', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800' },
  { id: 'cod-mobile', name: 'COD Mobile', icon: '📱', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800' },
  { id: 'pubg-mobile', name: 'PUBG Mobile', icon: '🍗', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=800' }
];

const Games = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pb-32 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-violet-600/10 rounded-2xl flex items-center justify-center text-violet-500 mx-auto mb-4">
            <Gamepad2 size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Disciplines</h1>
          <p className="text-muted-foreground text-[11px] font-bold mt-2 uppercase tracking-[0.2em]">Choisissez votre arène</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GAMES_LIST.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/game/${game.id}`} className="group relative block h-48 rounded-[2.5rem] overflow-hidden border border-border hover:border-violet-500/50 transition-all shadow-sm">
                <img src={game.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                
                <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{game.icon}</span>
                      <h2 className="text-xl font-black text-white">{game.name}</h2>
                    </div>
                    <p className="text-[9px] text-white/60 font-black uppercase tracking-widest">Voir les tournois</p>
                  </div>
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white group-hover:bg-violet-600 transition-colors">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Games;