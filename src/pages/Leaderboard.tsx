"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, ChevronRight, Star, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabase';

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
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('game_id', gameId)
      .order('rank', { ascending: true });
    
    const fullRankings = Array.from({ length: 5 }, (_, i) => {
      const rank = i + 1;
      const existing = data?.find(d => d.rank === rank);
      return existing || { rank, username: '', wins: 0, avatar_url: '' };
    });

    setRankings(fullRankings);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => selectedGame ? setSelectedGame(null) : navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-8">
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
                <button key={game.id} onClick={() => setSelectedGame(game.id)} className="flex items-center justify-between p-6 bg-card border border-border rounded-3xl hover:border-violet-500 transition-all shadow-sm">
                  <div className="flex items-center gap-4 text-xl font-bold"><span>{game.icon}</span> {game.name}</div>
                  <ChevronRight className="text-muted-foreground" />
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-10">Chargement...</div>
              ) : (
                rankings.map((p) => (
                  <div key={p.rank} className={`flex items-center justify-between p-5 rounded-2xl border ${p.username ? 'bg-card border-border shadow-sm' : 'bg-muted/20 border-border border-dashed'}`}>
                    <div className="flex items-center gap-4">
                      <span className={`font-black text-lg ${p.rank === 1 ? 'text-yellow-500' : p.rank === 2 ? 'text-zinc-400' : p.rank === 3 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                        #{p.rank}
                      </span>
                      <div className="w-12 h-12 rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <User size={20} className="text-muted-foreground" />
                        )}
                      </div>
                      <span className={`font-bold ${p.username ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                        {p.username || "Place disponible"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-violet-500 font-black">
                      <Star size={16} /> {p.wins}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Leaderboard;