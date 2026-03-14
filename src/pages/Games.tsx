"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Gamepad2, Filter, SearchX, ChevronRight, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const ALL_GAMES = [
  { id: 'free-fire', name: 'Free Fire', icon: '🔥', image: '/freefire.jpg' },
  { id: 'clash-royale', name: 'Clash Royale', icon: '👑', image: '/clash royal.jpg' },
  { id: 'clash-of-clans', name: 'Clash of Clans', icon: '🏰', image: '/clash of clans.jpeg' },
  { id: 'cod-mobile', name: 'COD Mobile', icon: '📱', image: '/cod mobile.jpg' },
  { id: 'pubg-mobile', name: 'PUBG Mobile', icon: '🔫', image: '/pubg-mobile.jpg' },
  { id: 'blur', name: 'Blur', icon: '🏎️', image: '/blur.jpg', isComingSoon: true },
  { id: 'cod-mw4', name: 'COD MW4', icon: '🔫', image: '/cod mw4.jpg', isComingSoon: true },
  { id: 'bombsquad', name: 'BombSquad', icon: '💣', image: '/bombsquad.jng', isComingSoon: true }
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

    const channel = supabase
      .channel('games_active_status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, () => {
        fetchActiveTournaments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredGames = ALL_GAMES.filter(game => {
    const gameMatch = selectedGame === "all" || game.id === selectedGame;
    return gameMatch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-600/10 rounded-2xl flex items-center justify-center text-violet-500">
                <Gamepad2 size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">Catalogue des Jeux</h1>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Toutes les disciplines eGame Bénin</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Select value={selectedGame} onValueChange={setSelectedGame}>
                <SelectTrigger className="bg-card border-border rounded-2xl h-14 w-full md:w-56 text-xs font-bold shadow-sm">
                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-violet-500" />
                    <SelectValue placeholder="Filtrer par jeu" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Tous les jeux</SelectItem>
                  {ALL_GAMES.map(game => (
                    <SelectItem key={game.id} value={game.id}>
                      <div className="flex items-center gap-2">
                        {activeGames.has(game.id) && (
                          <span className="w-2 h-2 bg-green-500 rounded-full shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        )}
                        <span className={activeGames.has(game.id) ? "font-black" : "font-medium"}>
                          {game.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-[32px]" />)
          ) : filteredGames.length === 0 ? (
            <div className="col-span-full py-32 text-center space-y-6 bg-muted/10 rounded-[48px] border border-dashed border-border">
              <SearchX size={64} className="mx-auto text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground font-bold">Aucun jeu trouvé.</p>
            </div>
          ) : (
            filteredGames.map((game) => (
              <Link key={game.id} to={`/game/${game.id}`}>
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="group relative h-48 rounded-[32px] overflow-hidden border border-border shadow-sm"
                >
                  <img src={game.image} alt={game.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {game.isComingSoon && (
                      <Badge className="bg-orange-500/80 backdrop-blur-md text-white border-none flex items-center gap-1 text-[8px] font-black uppercase tracking-widest py-1 px-2.5 w-fit">
                        <Clock size={10} />
                        À venir
                      </Badge>
                    )}
                  </div>

                  <div className="absolute top-4 right-4">
                    {activeGames.has(game.id) && (
                      <div className="bg-green-500/20 backdrop-blur-md border border-green-500/30 px-3 py-1 rounded-full flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Tournoi Live</span>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-6 left-6 flex items-center justify-between right-6">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl drop-shadow-lg">{game.icon}</span>
                      <div>
                        <h3 className="text-white font-black text-xl tracking-tighter uppercase">{game.name}</h3>
                        <p className="text-violet-400 text-[9px] font-black uppercase tracking-widest">Voir la discipline</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <ChevronRight size={20} />
                    </div>
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