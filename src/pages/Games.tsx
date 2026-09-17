"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import { Gamepad2, Filter, SearchX, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const ALL_GAMES = [
  { id: 'blood-strike', name: 'Blood Strike', image: '/blood strike.jpg' },
  { id: 'brawl-stars', name: 'Brawl Stars', image: '/brawl stars.jpg' },
  { id: 'clash-of-clans', name: 'Clash of Clans', image: '/clash of clans.webp' },
  { id: 'clash-royale', name: 'Clash Royale', image: '/clash royal.webp' },
  { id: 'cod-mobile', name: 'COD Mobile', image: '/cod mobile.webp' },
  { id: 'free-fire', name: 'Free Fire', image: '/freefire.webp' },
  { id: 'mobile-legends', name: 'Mobile Legends', image: '/mobile legend.webp' },
  { id: 'pubg-mobile', name: 'PUBG Mobile', image: '/pubg-mobile.webp' }
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
    <div className="min-h-screen bg-[#07070C] text-white pb-32 pt-28">
      <SEO title="Catalogue des Jeux eSport" description="Tous les jeux compétitifs disponibles en Afrique : Blood Strike, Free Fire, COD Mobile, Clash Royale, PUBG Mobile." />
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#8A2BE2]/20 border border-[#8A2BE2]/50 rounded-2xl flex items-center justify-center text-[#8A2BE2]">
              <Gamepad2 size={26} />
            </div>
            <div>
              <h1 className="text-3xl font-gaming font-black uppercase text-white">Catalogue des Jeux</h1>
              <p className="text-xs text-[#8888AA] font-esport uppercase tracking-wider mt-1">Sélectionne ta discipline eSport</p>
            </div>
          </div>

          <div className="w-full md:w-72">
            <Select value={selectedGame} onValueChange={setSelectedGame}>
              <SelectTrigger className="bg-[#0F0F1E] border border-[#8A2BE2]/30 rounded-2xl h-14 text-xs font-gaming font-bold">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-[#8A2BE2]" />
                  <SelectValue placeholder="Filtrer par jeu" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#0F0F1E] border border-[#8A2BE2]/40 text-white">
                <SelectItem value="all">Tous les jeux</SelectItem>
                {ALL_GAMES.map(game => (
                  <SelectItem key={game.id} value={game.id}>
                    {game.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] w-full rounded-3xl bg-[#0F0F1E]" />)
          ) : filteredGames.length === 0 ? (
            <div className="col-span-full py-20 text-center glass-panel">
              <SearchX size={48} className="mx-auto text-[#8888AA] mb-3 opacity-40" />
              <p className="text-sm font-gaming text-[#8888AA]">Aucun jeu correspondant.</p>
            </div>
          ) : (
            filteredGames.map((game) => (
              <Link key={game.id} to={`/game/${game.id}`}>
                <motion.div 
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative aspect-[3/4] rounded-3xl overflow-hidden border border-[#8A2BE2]/20 hover:border-[#8A2BE2] bg-[#0F0F1E] shadow-2xl cursor-pointer"
                >
                  <img src={game.image} alt={game.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07070C] via-[#07070C]/30 to-transparent" />

                  <div className="absolute top-4 right-4">
                    {activeGames.has(game.id) && (
                      <div className="flex items-center gap-1.5 bg-emerald-950/80 backdrop-blur-md border border-emerald-500/50 px-2.5 py-1 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-[9px] font-gaming font-extrabold text-emerald-400 uppercase">Actif</span>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 space-y-2">
                    <h3 className="text-white font-gaming font-black text-lg uppercase leading-tight">{game.name}</h3>
                    <p className="text-xs font-bold text-[#A855F7] uppercase flex items-center gap-1 group-hover:text-white transition-colors">
                      Entrer dans l'arène <ArrowRight size={14} />
                    </p>
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