"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PlayerBadge from '@/components/PlayerBadge';
import SEO from '@/components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, ChevronRight, Award, Medal, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const DEFAULT_GAMES = [
  { id: 'clash-of-clans', name: 'Clash of Clans', icon: '/icon clash of clans.jpg' },
  { id: 'clash-royale', name: 'Clash Royale', icon: '/icon clash royal.jpg' },
  { id: 'cod-mobile', name: 'COD Mobile', icon: '/icon cod mobile.png' },
  { id: 'free-fire', name: 'Free Fire', icon: '/icon free fire.png' },
  { id: 'mobile-legends', name: 'Mobile Legends', icon: '/icon mobile legend.jpg' },
  { id: 'pubg-mobile', name: 'PUBG Mobile', icon: '/icon pubg.png' }
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
      1: { height: "h-40", color: "text-[#FFD700]", bg: "bg-[#FFD700]/10", border: "border-[#FFD700]/50", size: "w-24 h-24", icon: <Crown size={32} className="text-[#FFD700]" /> },
      2: { height: "h-32", color: "text-zinc-300", bg: "bg-zinc-400/10", border: "border-zinc-400/40", size: "w-20 h-20", icon: <Medal size={24} className="text-zinc-300" /> },
      3: { height: "h-28", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/40", size: "w-18 h-18", icon: <Award size={22} className="text-orange-400" /> }
    };
    const config = configs[rank as keyof typeof configs];

    return (
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: rank * 0.1 }}
        className="flex flex-col items-center gap-3 flex-1"
      >
        <div className="relative">
          <div className={`${config.size} rounded-full border-4 ${config.border} overflow-hidden bg-[#0F0F1E] shadow-2xl relative z-10`}>
            <img src={player?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player?.username || rank}`} alt="" className="w-full h-full object-cover" />
          </div>
          <div className={`absolute -bottom-2 -right-2 ${config.bg} ${config.color} p-2 rounded-full border ${config.border} backdrop-blur-md z-20`}>
            {config.icon}
          </div>
        </div>

        <div className="text-center z-10 space-y-1">
          <p className="font-gaming font-extrabold text-xs text-white truncate max-w-[90px]">{player?.username || "---"}</p>
          <p className={`text-[10px] font-bold ${config.color} uppercase tracking-wider`}>{player?.wins || 0} Victoires</p>
          {player?.wins > 0 && (
            <div className="flex justify-center">
              <PlayerBadge tournamentCount={player.wins} size="sm" />
            </div>
          )}
        </div>

        <div className={`w-full ${config.height} ${config.bg} rounded-t-3xl border-x border-t ${config.border} flex items-end justify-center pb-4 relative overflow-hidden`}>
          <span className={`text-4xl font-gaming font-black ${config.color} opacity-30`}>#{rank}</span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#07070C] text-white pb-32 pt-28">
      <SEO title="Classement National eSport Bénin" description="Le Hall of Fame des meilleurs joueurs de jeux vidéo au Bénin." />
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 space-y-10">
        <button 
          onClick={() => selectedGame ? setSelectedGame(null) : navigate(-1)} 
          className="flex items-center gap-2 text-[#8888AA] hover:text-white transition-colors text-xs font-gaming font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> {selectedGame ? "Retour au choix du jeu" : "Retour"}
        </button>

        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#8A2BE2]/20 border border-[#8A2BE2]/40 rounded-2xl flex items-center justify-center text-[#8A2BE2] mx-auto shadow-xl shadow-[#8A2BE2]/20">
            <Trophy size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-gaming font-black uppercase tracking-tight">
            {selectedGame ? DEFAULT_GAMES.find(g => g.id === selectedGame)?.name : "Classement National"}
          </h1>
          <p className="text-xs text-[#8888AA] font-esport uppercase tracking-widest">
            Hall of Fame eGame Bénin
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!selectedGame ? (
            <motion.div 
              key="games"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4"
            >
              {DEFAULT_GAMES.map((game) => (
                <button 
                  key={game.id} 
                  onClick={() => setSelectedGame(game.id)} 
                  className="flex items-center justify-between p-5 glass-panel hover:border-[#8A2BE2] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#8A2BE2]/30">
                      <img src={game.icon} alt={game.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div> 
                    <div className="text-left">
                      <p className="font-gaming font-bold text-sm text-white">{game.name}</p>
                      <p className="text-[10px] text-[#8888AA] uppercase tracking-wider">Voir les champions</p>
                    </div>
                  </div>
                  <ChevronRight className="text-[#8888AA] group-hover:text-[#8A2BE2] transition-colors" size={20} />
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="rankings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {loading ? (
                <div className="text-center py-20">
                  <div className="w-10 h-10 border-4 border-[#8A2BE2] border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : (
                <>
                  <div className="flex items-end justify-center gap-3 px-4 pt-6">
                    <PodiumItem player={rankings[1]} rank={2} />
                    <PodiumItem player={rankings[0]} rank={1} />
                    <PodiumItem player={rankings[2]} rank={3} />
                  </div>

                  <div className="space-y-3">
                    {rankings.slice(3).map((p, i) => (
                      <div 
                        key={i} 
                        className="flex items-center justify-between p-4 glass-panel"
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-gaming font-black text-xs text-[#8888AA] w-6">#{i + 4}</span>
                          <div className="w-10 h-10 rounded-full bg-[#07070C] border border-[#8A2BE2]/30 overflow-hidden">
                            <img src={p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-gaming font-bold text-sm text-white">{p.username}</span>
                            {p.wins > 0 && <PlayerBadge tournamentCount={p.wins} size="sm" />}
                          </div>
                        </div>
                        <span className="font-gaming font-bold text-xs text-[#A855F7]">{p.wins} Victoires</span>
                      </div>
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