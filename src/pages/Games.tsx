"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Gamepad2, Filter, SearchX } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const ALL_GAMES = [
  { id: 'clash-of-clans', name: 'Clash of Clans', image: '/clash of clans.webp' },
  { id: 'clash-royale', name: 'Clash Royale', image: '/clash royal.webp' },
  { id: 'cod-mobile', name: 'COD Mobile', image: '/cod mobile.webp' },
  { id: 'free-fire', name: 'Free Fire', image: '/freefire.webp' },
  { id: 'mobile-legends', name: 'Mobile Legends', image: '/mobile legend.webp' },
  { id: 'pubg-mobile', name: 'PUBG Mobile', image: '/pubg-mobile.webp' },
  { id: 'blur', name: 'Blur', image: '/blur.webp', isComingSoon: true },
  { id: 'bombsquad', name: 'BombSquad', image: '/bombsquad.webp', isComingSoon: true },
  { id: 'cod-mw4', name: 'COD MW4', image: '/cod mw4.webp', isComingSoon: true }
];

const Games = () => {
  const [activeGames, setActiveGames] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string>("all");

  useEffect(() => {
    const fetchActiveTournaments = async () => {
      const { data } = await supabase
        .from('tournaments')
        .select('game')
        .eq('status', 'active');
      
      if (data) {
        const activeSet = new Set<string>();
        data.forEach(t => {
          const gameId = ALL_GAMES.find(g => t.game.toLowerCase().includes(g.name.toLowerCase()))?.id;
          if (gameId) activeSet.add(gameId);
        });
        setActiveGames(activeSet);
      }
      setLoading(false);
    };

    fetchActiveTournaments();
  }, []);

  const filteredGames = ALL_GAMES.filter(game => {
    return selectedGame === "all" || game.id === selectedGame;
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-600/10 border border-violet-500/20 rounded-2xl flex items-center justify-center text-violet-500 shadow-lg shadow-violet-500/5">
              <Gamepad2 size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase">Catalogue</h1>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Toutes les disciplines</p>
            </div>
          </div>

          <div className="w-full md:w-72">
            <Select value={selectedGame} onValueChange={setSelectedGame}>
              <SelectTrigger className="bg-card/50 border-border rounded-2xl h-14 text-xs font-bold shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-violet-500" />
                  <SelectValue placeholder="Filtrer par jeu" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Tous les jeux</SelectItem>
                {ALL_GAMES.map(game => (
                  <SelectItem key={game.id} value={game.id}>{game.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square w-full rounded-[32px]" />)
          ) : filteredGames.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-muted/10 rounded-[32px] border border-dashed border-border">
              <SearchX size={48} className="mx-auto text-muted-foreground/20 mb-2" />
              <p className="text-xs text-muted-foreground font-bold">Aucun jeu trouvé.</p>
            </div>
          ) : (
            filteredGames.map((game) => (
              <Link key={game.id} to={`/game/${game.id}`}>
                <motion.div 
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative aspect-square rounded-[32px] overflow-hidden border border-white/10 shadow-xl cursor-pointer"
                >
                  <img src={game.image} alt={game.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    {game.isComingSoon && (
                      <Badge className="bg-orange-500/90 text-white border-none text-[8px] font-black uppercase py-1 px-2.5 rounded-xl shadow-lg shadow-orange-500/20">
                        Bientôt
                      </Badge>
                    )}
                  </div>

                  <div className="absolute top-4 right-4">
                    {activeGames.has(game.id) && (
                      <div className="bg-green-500 w-3 h-3 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)] border-2 border-white" />
                    )}
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-white font-black text-sm md:text-lg uppercase leading-tight font-sora tracking-tight">{game.name}</h3>
                    <p className="text-[9px] text-violet-400 font-black uppercase tracking-widest mt-1.5 group-hover:text-white transition-colors">Voir l'arène →</p>
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Games;