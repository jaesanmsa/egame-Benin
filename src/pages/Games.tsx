"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Gamepad2, MapPin, Filter, SearchX, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const CITIES = ["Cotonou", "Abomey-Calavi", "Porto-Novo", "Parakou", "Ouidah"];

const ALL_GAMES = [
  { id: 'free-fire', name: 'Free Fire', icon: '🔥', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800' },
  { id: 'efootball', name: 'eFootball', icon: '⚽', image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800' },
  { id: 'clash-royale', name: 'Clash Royale', icon: '👑', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800' },
  { id: 'cod-mobile', name: 'COD Mobile', icon: '📱', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800' },
  { id: 'pubg-mobile', name: 'PUBG Mobile', icon: '🍗', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=800' },
  { id: 'blur', name: 'Blur', icon: '🏎️', image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800' },
  { id: 'cod-mw4', name: 'COD MW4', icon: '🔫', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=800' },
  { id: 'bombsquad', name: 'BombSquad', icon: '💣', image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=800' }
];

const Games = () => {
  const [activeGames, setActiveGames] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>("all");
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
    const gameMatch = selectedGame === "all" || game.id === selectedGame;
    // Note: Le filtrage par ville ici est conceptuel car on affiche les jeux, 
    // mais on pourrait filtrer les jeux qui ont des tournois dans cette ville.
    return gameMatch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        
        {/* Filtres en haut */}
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

            <div className="w-full md:w-auto">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="bg-card border-border rounded-2xl h-14 w-full md:w-64 text-xs font-bold shadow-sm">
                  <div className="flex items-center gap-2"><MapPin size={14} className="text-violet-500" /><SelectValue placeholder="Filtrer par ville" /></div>
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  {CITIES.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtre par jeu (Boutons) */}
          <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setSelectedGame("all")}
              className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${selectedGame === "all" ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-500/20' : 'bg-card text-muted-foreground border-border hover:border-violet-500/50'}`}
            >
              Tous les jeux
            </button>
            {ALL_GAMES.map((game) => (
              <button 
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${selectedGame === game.id ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-500/20' : 'bg-card text-muted-foreground border-border hover:border-violet-500/50'}`}
              >
                {game.name}
                {activeGames.has(game.id) && (
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Grille de rectangles */}
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