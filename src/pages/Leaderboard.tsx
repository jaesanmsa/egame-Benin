"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, Gamepad2, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const DEFAULT_GAMES = [
  { id: 'blur', name: 'Blur', icon: '🏎️' },
  { id: 'cod-mw4', name: 'COD Modern Warfare 4', icon: '🔫' },
  { id: 'cod-mobile', name: 'COD Mobile', icon: '📱' },
  { id: 'bombsquad', name: 'BombSquad', icon: '💣' },
  { id: 'clash-royale', name: 'Clash Royale', icon: '👑' }
];

const Leaderboard = () => {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedGame) {
      fetchRankings(selectedGame);
    }
  }, [selectedGame]);

  const fetchRankings = async (gameId: string) => {
    setLoading(true);
    const { data } = await supabase.from('leaderboard').select('*').eq('game_id', gameId).order('wins', { ascending: false });
    setRankings(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => selectedGame ? setSelectedGame(null) : navigate(-1)} className="flex items-center gap-2 text-zinc-400 mb-8">
          <ArrowLeft size={20} /> {selectedGame ? "Retour aux jeux" : "Retour"}
        </button>

        <div className="text-center mb-12">
          <Trophy size={48} className="text-violet-500 mx-auto mb-4" />
          <h1 className="text-3xl font-black">{selectedGame ? DEFAULT_GAMES.find(g => g.id === selectedGame)?.name : "Classements"}</h1>
        </div>

        <AnimatePresence mode="wait">
          {!selectedGame ? (
            <div className="grid gap-4">
              {DEFAULT_GAMES.map((game) => (
                <button key={game.id} onClick={() => setSelectedGame(game.id)} className="flex items-center justify-between p-6 bg-zinc-900 border border-zinc-800 rounded-3xl hover:border-violet-500 transition-all">
                  <div className="flex items-center gap-4 text-xl font-bold"><span>{game.icon}</span> {game.name}</div>
                  <ChevronRight />
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? <div className="text-center py-10">Chargement...</div> : rankings.length > 0 ? rankings.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <span className="font-black text-violet-500">#{i+1}</span>
                    <img src={p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`} className="w-10 h-10 rounded-full" alt="" />
                    <span className="font-bold">{p.username}</span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-500 font-black"><Star size={16} /> {p.wins}</div>
                </div>
              )) : <div className="text-center py-10 text-zinc-500">Aucun joueur classé pour ce jeu.</div>}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Leaderboard;