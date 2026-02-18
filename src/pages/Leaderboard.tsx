"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, Gamepad2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GAMES = [
  { id: 'pubg-mobile', name: "PUBG Mobile", icon: "🔫" },
  { id: 'cod-mw4', name: "COD MW4", icon: "🎖️" },
  { id: 'blur', name: "Blur Racing", icon: "🏎️" },
  { id: 'clash-royale', name: "Clash Royale", icon: "👑" },
  { id: 'bombsquad', name: "BombSquad", icon: "💣" }
];

const Leaderboard = () => {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const handleBack = () => {
    if (selectedGame) {
      setSelectedGame(null);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={handleBack} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} />
          {selectedGame ? "Retour aux jeux" : "Retour"}
        </button>

        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-violet-600/20 rounded-full mb-4">
            <Trophy size={40} className="text-violet-500" />
          </div>
          <h1 className="text-3xl font-black mb-2">
            {selectedGame ? GAMES.find(g => g.id === selectedGame)?.name : "Classements"}
          </h1>
          <p className="text-zinc-400">
            {selectedGame ? "Les meilleurs joueurs de ce jeu" : "Sélectionnez un jeu pour voir le classement"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!selectedGame ? (
            <motion.div 
              key="game-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {GAMES.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  className="w-full flex items-center justify-between p-6 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-[2rem] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{game.icon}</span>
                    <span className="text-lg font-bold">{game.name}</span>
                  </div>
                  <ChevronRight className="text-zinc-600 group-hover:text-violet-500 transition-colors" />
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="ranking-list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-12 text-center bg-zinc-900/50 border border-zinc-800 border-dashed rounded-[2.5rem]"
            >
              <Gamepad2 size={48} className="mx-auto text-zinc-700 mb-4" />
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Classement à venir</p>
              <p className="text-zinc-600 text-xs mt-2">Soyez le premier à gagner un tournoi !</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Leaderboard;