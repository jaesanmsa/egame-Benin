"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PlayerBadge from '@/components/PlayerBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, ChevronRight, Award, Medal, Target, Swords, Castle, Zap, Bomb, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const GAME_GLYPHS: Record<string, any> = {
  'clash-of-clans': Castle,
  'clash-royale': Swords,
  'cod-mobile': Target,
  'free-fire': Zap,
  'mobile-legends': Swords,
  'pubg-mobile': Map,
  'blur': Zap,
  'cod-mw4': Target,
  'bombsquad': Bomb
};

const DEFAULT_GAMES = [
  { id: 'clash-of-clans', name: 'Clash of Clans' },
  { id: 'clash-royale', name: 'Clash Royale' },
  { id: 'cod-mobile', name: 'COD Mobile' },
  { id: 'free-fire', name: 'Free Fire' },
  { id: 'mobile-legends', name: 'Mobile Legends' },
  { id: 'pubg-mobile', name: 'PUBG Mobile' }
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
      1: { height: "h-32", color: "text-[#00F0FF]", bg: "bg-[#00F0FF]/5", border: "border-[#00F0FF]/20", size: "w-20 h-20", icon: <Trophy size={24} strokeWidth={2} /> },
      2: { height: "h-24", color: "text-zinc-400", bg: "bg-zinc-400/5", border: "border-zinc-400/20", size: "w-16 h-16", icon: <Medal size={20} strokeWidth={2} /> },
      3: { height: "h-20", color: "text-orange-500", bg: "bg-orange-500/5", border: "border-orange-500/20", size: "w-14 h-14", icon: <Award size={18} strokeWidth={2} /> }
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
          <div className={`${config.size} rounded-full border-2 ${config.border} overflow-hidden bg-zinc-900 shadow-xl`}>
            <img src={player?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player?.username || rank}`} alt="" className="w-full h-full object-cover opacity-80" />
          </div>
          <div className={`absolute -bottom-2 -right-2 ${config.bg} ${config.color} p-1.5 rounded-full border ${config.border} backdrop-blur-md`}>
            {config.icon}
          </div>
        </div>
        <div className="text-center">
          <p className="font-black text-[10px] uppercase tracking-widest truncate max-w-[80px]">{player?.username || "---"}</p>
          <p className={`text-[9px] font-black ${config.color} mt-1`}>{player?.wins || 0} WINS</p>
        </div>
        <div className={`w-full ${config.height} ${config.bg} rounded-t-2xl border-x border-t ${config.border} flex items-end justify-center pb-4`}>
          <span className={`text-2xl font-black ${config.color} opacity-20`}>#{rank}</span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => selectedGame ? setSelectedGame(null) : navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-10 hover:text-[#00F0FF] transition-colors text-[10px] font-black uppercase tracking-[0.2em]">
          <ArrowLeft size={14} strokeWidth={2} /> {selectedGame ? "Retour aux disciplines" : "Retour"}
        </button>

        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-zinc-900 border border-[#00F0FF]/20 rounded-2xl flex items-center justify-center text-[#00F0FF] mx-auto mb-6 shadow-lg shadow-[#00F0FF]/5">
            <Trophy size={32} strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">{selectedGame ? DEFAULT_GAMES.find(g => g.id === selectedGame)?.name : "Hall of Fame"}</h1>
          <p className="text-muted-foreground text-[10px] font-black mt-3 uppercase tracking-[0.3em] opacity-60">Elite Competitive System</p>
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
              {DEFAULT_GAMES.map((game) => {
                const Glyph = GAME_GLYPHS[game.id] || Gamepad2;
                return (
                  <button 
                    key={game.id} 
                    onClick={() => setSelectedGame(game.id)} 
                    className="flex items-center justify-between p-6 bg-zinc-900/50 border border-border rounded-2xl hover:border-[#00F0FF]/40 transition-all group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-zinc-900 border border-border flex items-center justify-center rounded-xl group-hover:border-[#00F0FF]/30 transition-colors">
                        <Glyph size={24} strokeWidth={2} className="text-[#00F0FF]" />
                      </div> 
                      <div className="text-left">
                        <p className="font-black text-sm uppercase tracking-tight">{game.name}</p>
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Consulter le classement</p>
                      </div>
                    </div>
                    <ChevronRight className="text-muted-foreground group-hover:text-[#00F0FF] transition-colors" size={18} strokeWidth={2} />
                  </button>
                );
              })}
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
                  <div className="w-10 h-10 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : (
                <>
                  <div className="flex items-end justify-center gap-4 px-4 pt-8">
                    <PodiumItem player={rankings[1]} rank={2} />
                    <PodiumItem player={rankings[0]} rank={1} />
                    <PodiumItem player={rankings[2]} rank={3} />
                  </div>

                  <div className="space-y-3">
                    {rankings.slice(3).map((p, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i} 
                        className="flex items-center justify-between p-5 bg-zinc-900/30 border border-border rounded-2xl"
                      >
                        <div className="flex items-center gap-5">
                          <span className="font-black text-[10px] text-muted-foreground w-6">#{i + 4}</span>
                          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-border overflow-hidden">
                            <img src={p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`} className="w-full h-full object-cover opacity-80" alt="" />
                          </div>
                          <span className="text-xs font-black uppercase tracking-tight">{p.username}</span>
                        </div>
                        <div className="text-[#00F0FF] font-black text-[10px] uppercase tracking-widest">
                          {p.wins} WINS
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