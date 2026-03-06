"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, ChevronRight, Star, User, Award, Zap, Gamepad2, Medal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const DEFAULT_GAMES = [
  { id: 'blur', name: 'Blur', icon: '🏎️' },
  { id: 'cod-mw4', name: 'COD MW4', icon: '🔫' },
  { id: 'cod-mobile', name: 'COD Mobile', icon: '📱' },
  { id: 'bombsquad', name: 'BombSquad', icon: '💣' },
  { id: 'clash-royale', name: 'Clash Royale', icon: '👑' },
  { id: 'clash-of-clans', name: 'Clash of Clans', icon: '🏰' },
  { id: 'free-fire', name: 'Free Fire', icon: '🔥' }
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
      .order('wins', { ascending: false })
      .limit(10);
    
    if (data) setRankings(data);
    setLoading(false);
  };

  const PodiumItem = ({ player, rank }: { player: any, rank: number }) => {
    const configs = {
      1: { height: "h-32", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30", size: "w-20 h-20", icon: <Trophy size={24} /> },
      2: { height: "h-24", color: "text-zinc-400", bg: "bg-zinc-400/10", border: "border-zinc-400/30", size: "w-16 h-16", icon: <Medal size={20} /> },
      3: { height: "h-20", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30", size: "w-14 h-14", icon: <Award size={18} /> }
    };
    const config = configs[rank as keyof typeof configs];

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: rank * 0.1 }}
        className="flex flex-col items-center gap-3 flex-1"
      >
        <div className="relative">
          <div className={`${config.size} rounded-full border-4 ${config.border} overflow-hidden bg-muted shadow-xl`}>
            <img src={player?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player?.username || rank}`} alt="" className="w-full h-full object-cover" />
          </div>
          <div className={`absolute -bottom-2 -right-2 ${config.bg} ${config.color} p-1.5 rounded-full border ${config.border} backdrop-blur-md`}>
            {config.icon}
          </div>
        </div>
        <div className="text-center">
          <p className="font-black text-xs truncate max-w-[80px]">{player?.username || "---"}</p>
          <p className={`text-[10px] font-black ${config.color}`}>{player?.wins || 0} Victoires</p>
        </div>
        <div className={`w-full ${config.height} ${config.bg} rounded-t-2xl border-x border-t ${config.border} flex items-end justify-center pb-4`}>
          <span className={`text-2xl font-black ${config.color} opacity-40`}>#{rank}</span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => selectedGame ? setSelectedGame(null) : navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-6 hover:text-foreground transition-colors text-xs font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> {selectedGame ? "Retour aux jeux" : "Retour"}
        </button>

        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-violet-600/10 rounded-2xl flex items-center justify-center text-violet-500 mx-auto mb-4 shadow-lg shadow-violet-500/5">
            <Trophy size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight">{selectedGame ? DEFAULT_GAMES.find(g => g.id === selectedGame)?.name : "Hall of Fame"}</h1>
          <p className="text-muted-foreground text-[11px] font-bold mt-2 uppercase tracking-[0.2em]">L'élite du gaming béninois</p>
        </div>

        <AnimatePresence mode="wait">
          {!selectedGame ? (
            <motion.div 
              key="games"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-3"
            >
              {DEFAULT_GAMES.map((game) => (
                <button 
                  key={game.id} 
                  onClick={() => setSelectedGame(game.id)} 
                  className="flex items-center justify-between p-5 bg-card border border-border rounded-2xl hover:border-violet-500/50 transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl bg-muted w-12 h-12 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform">{game.icon}</span> 
                    <div className="text-left">
                      <p className="font-black text-sm">{game.name}</p>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Voir le classement</p>
                    </div>
                  </div>
                  <ChevronRight className="text-muted-foreground group-hover:text-violet-500 transition-colors" size={18} />
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="rankings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-10"
            >
              {loading ? (
                <div className="text-center py-20">
                  <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : (
                <>
                  <div className="flex items-end justify-center gap-2 px-4 pt-8">
                    <PodiumItem player={rankings[1]} rank={2} />
                    <PodiumItem player={rankings[0]} rank={1} />
                    <PodiumItem player={rankings[2]} rank={3} />
                  </div>

                  <div className="space-y-2">
                    {rankings.slice(3).map((p, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i} 
                        className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-black text-xs text-muted-foreground w-6">#{i + 4}</span>
                          <div className="w-10 h-10 rounded-full bg-muted border border-border overflow-hidden">
                            <img src={p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`} className="w-full h-full object-cover" alt="" />
                          </div>
                          <span className="text-sm font-bold">{p.username}</span>
                        </div>
                        <div className="flex items-center gap-2 text-violet-500 font-black text-xs">
                          {p.wins} Victoires
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Leaderboard;