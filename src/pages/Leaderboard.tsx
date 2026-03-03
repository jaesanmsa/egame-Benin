"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, ChevronRight, Star, User, Award, Zap } from 'lucide-react';
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
  const [hallOfFame, setHallOfFame] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedGame) {
      fetchRankings(selectedGame);
    } else {
      fetchHallOfFame();
    }
  }, [selectedGame]);

  const fetchHallOfFame = async () => {
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .order('wins', { ascending: false })
      .limit(3);
    if (data) setHallOfFame(data);
  };

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
        <button onClick={() => selectedGame ? setSelectedGame(null) : navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-8 hover:text-foreground transition-colors">
          <ArrowLeft size={20} /> {selectedGame ? "Retour aux jeux" : "Retour"}
        </button>

        <div className="text-center mb-12">
          <Trophy size={48} className="text-violet-500 mx-auto mb-4" />
          <h1 className="text-3xl font-black">{selectedGame ? DEFAULT_GAMES.find(g => g.id === selectedGame)?.name : "L'Olympe des Gamers"}</h1>
          <p className="text-muted-foreground text-sm mt-2">Les meilleurs joueurs du Bénin réunis ici.</p>
        </div>

        <AnimatePresence mode="wait">
          {!selectedGame ? (
            <div className="space-y-10">
              {/* Hall of Fame Section */}
              {hallOfFame.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <Award className="text-yellow-500" size={20} />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Hall of Fame</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {hallOfFame.map((p, i) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={i} 
                        className="bg-card border border-border p-4 rounded-[2rem] text-center relative overflow-hidden shadow-sm"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-indigo-500" />
                        <div className="w-14 h-14 rounded-full bg-muted mx-auto mb-3 border-2 border-violet-500/20 overflow-hidden">
                          <img src={p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <p className="font-black text-xs truncate">{p.username}</p>
                        <div className="flex items-center justify-center gap-1 text-[10px] text-violet-500 font-black mt-1">
                          <Zap size={10} /> {p.wins} PTS
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Games List */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Gamepad2 className="text-violet-500" size={20} />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Classements par Jeu</h2>
                </div>
                <div className="grid gap-4">
                  {DEFAULT_GAMES.map((game) => (
                    <button key={game.id} onClick={() => setSelectedGame(game.id)} className="flex items-center justify-between p-6 bg-card border border-border rounded-3xl hover:border-violet-500 transition-all shadow-sm group">
                      <div className="flex items-center gap-4 text-xl font-bold">
                        <span className="group-hover:scale-125 transition-transform">{game.icon}</span> 
                        {game.name}
                      </div>
                      <ChevronRight className="text-muted-foreground group-hover:text-violet-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-20">
                  <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : (
                rankings.map((p) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={p.rank} 
                    className={`flex items-center justify-between p-5 rounded-2xl border ${p.username ? 'bg-card border-border shadow-sm' : 'bg-muted/20 border-border border-dashed'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`font-black text-lg w-8 ${p.rank === 1 ? 'text-yellow-500' : p.rank === 2 ? 'text-zinc-400' : p.rank === 3 ? 'text-orange-500' : 'text-muted-foreground'}`}>
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
                  </motion.div>
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