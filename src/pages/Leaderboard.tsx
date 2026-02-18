"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, Gamepad2, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [games, setGames] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(false);

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    if (selectedGame) {
      fetchRankings(selectedGame);
    }
  }, [selectedGame]);

  const fetchGames = async () => {
    setLoading(true);
    // On récupère les jeux uniques présents dans le classement
    const { data, error } = await supabase
      .from('leaderboard')
      .select('game_id')
      .order('game_id');
    
    if (!error && data) {
      // On filtre pour n'avoir que des noms uniques
      const uniqueGames = Array.from(new Set(data.map(item => item.game_id)))
        .map(id => ({
          id,
          name: id.replace(/-/g, ' ').toUpperCase(),
          icon: "🎮"
        }));
      setGames(uniqueGames);
    }
    setLoading(false);
  };

  const fetchRankings = async (gameId: string) => {
    setRankingLoading(true);
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('game_id', gameId)
      .order('wins', { ascending: false });
    
    if (!error && data) {
      setRankings(data);
    } else {
      setRankings([]);
    }
    setRankingLoading(false);
  };

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
            {selectedGame ? games.find(g => g.id === selectedGame)?.name : "Classements"}
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
              {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
              ) : games.length > 0 ? (
                games.map((game) => (
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
                ))
              ) : (
                <div className="py-12 text-center bg-zinc-900/50 border border-zinc-800 border-dashed rounded-[2.5rem]">
                  <Gamepad2 size={48} className="mx-auto text-zinc-700 mb-4" />
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Aucun jeu trouvé</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="ranking-list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {rankingLoading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
              ) : rankings.length > 0 ? (
                rankings.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-zinc-300 text-black' : index === 2 ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                        {index + 1}
                      </div>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700">
                        <img src={player.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold">{player.username}</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Joueur Pro</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-violet-600/10 px-4 py-2 rounded-xl border border-violet-500/20">
                      <Star size={14} className="text-violet-500" />
                      <span className="font-black text-violet-500">{player.wins} Victoires</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center bg-zinc-900/50 border border-zinc-800 border-dashed rounded-[2.5rem]">
                  <Gamepad2 size={48} className="mx-auto text-zinc-700 mb-4" />
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Classement vide</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Leaderboard;