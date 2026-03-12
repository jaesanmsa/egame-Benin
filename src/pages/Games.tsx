"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, MapPin, Filter, SearchX, Zap, Trophy, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const CITIES = ["Cotonou", "Abomey-Calavi", "Porto-Novo", "Parakou", "Ouidah", "Autre"];

const DISCIPLINES = [
  { id: 'free-fire', name: 'Free Fire', icon: '🔥', color: 'from-orange-500 to-red-600' },
  { id: 'efootball', name: 'eFootball', icon: '⚽', color: 'from-blue-500 to-indigo-600' },
  { id: 'clash-royale', name: 'Clash Royale', icon: '👑', color: 'from-yellow-500 to-amber-600' },
  { id: 'cod-mobile', name: 'COD Mobile', icon: '📱', color: 'from-zinc-600 to-zinc-800' },
  { id: 'pubg-mobile', name: 'PUBG Mobile', icon: '🍗', color: 'from-emerald-500 to-teal-600' },
  { id: 'blur', name: 'Blur', icon: '🏎️', color: 'from-violet-500 to-purple-600' },
  { id: 'cod-mw4', name: 'COD MW4', icon: '🔫', color: 'from-slate-600 to-slate-800' },
  { id: 'bombsquad', name: 'BombSquad', icon: '💣', color: 'from-rose-500 to-pink-600' }
];

const Games = () => {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});
  const [activeGames, setActiveGames] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    // On récupère TOUS les tournois (actifs et finis)
    const { data: tours } = await supabase
      .from('tournaments')
      .select('*')
      .order('status', { ascending: true }) // Actifs en premier
      .order('created_at', { ascending: false });
    
    if (tours) {
      setTournaments(tours);
      
      // Identifier les jeux qui ont des tournois actifs
      const active = new Set<string>();
      tours.forEach(t => {
        if (t.status === 'active') {
          const gameId = DISCIPLINES.find(d => t.game.toLowerCase().includes(d.name.toLowerCase()))?.id;
          if (gameId) active.add(gameId);
        }
      });
      setActiveGames(active);
    }

    const { data: participants } = await supabase.from('payments').select('tournament_id').eq('status', 'Réussi');
    if (participants) {
      const counts: Record<string, number> = {};
      participants.forEach((p: any) => { counts[p.tournament_id] = (counts[p.tournament_id] || 0) + 1; });
      setParticipantCounts(counts);
    }
    setLoading(false);
  };

  const filteredTournaments = tournaments.filter(t => {
    const cityMatch = selectedCity === "all" || t.city === selectedCity;
    const gameMatch = selectedGame === "all" || t.game.toLowerCase().includes(selectedGame.toLowerCase());
    return cityMatch && gameMatch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <div className="w-12 h-12 bg-violet-600/10 rounded-2xl flex items-center justify-center text-violet-500 mx-auto mb-4">
            <Gamepad2 size={24} />
          </div>
          <h1 className="text-3xl font-black tracking-tight">L'Arène des Jeux</h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-2">Choisis ta discipline et entre dans l'histoire</p>
        </div>

        {/* Grille des Disciplines (Toujours visible) */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Trophy size={14} className="text-violet-500" />
              Disciplines Officielles
            </h2>
            <button 
              onClick={() => setSelectedGame("all")}
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${selectedGame === "all" ? "text-violet-500" : "text-muted-foreground hover:text-foreground"}`}
            >
              Tout voir
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {DISCIPLINES.map((game) => {
              const isActive = activeGames.has(game.id);
              const isSelected = selectedGame.toLowerCase() === game.name.toLowerCase();
              
              return (
                <motion.button
                  key={game.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedGame(isSelected ? "all" : game.name)}
                  className={`relative flex flex-col items-center p-4 rounded-2xl border transition-all ${isSelected ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20' : 'bg-card border-border hover:border-violet-500/30'}`}
                >
                  <span className="text-2xl mb-2">{game.icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-tighter text-center line-clamp-1">{game.name}</span>
                  
                  {isActive && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Filtre Ville */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
              <Filter size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black">Filtrer par ville</h3>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Trouve des tournois près de chez toi</p>
            </div>
          </div>

          <div className="w-full md:w-64">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="bg-card border-border rounded-xl h-12 text-xs font-bold shadow-sm">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-violet-500" />
                  <SelectValue placeholder="Toutes les villes" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Toutes les villes</SelectItem>
                {CITIES.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Liste des tournois */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-[24px] overflow-hidden p-3 space-y-3">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <div className="space-y-2 px-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : filteredTournaments.length === 0 ? (
            <div className="col-span-full py-20 text-center space-y-4 bg-muted/10 rounded-[32px] border border-dashed border-border">
              <SearchX size={48} className="mx-auto text-muted-foreground/20" />
              <div>
                <h3 className="text-xl font-black">Aucun tournoi trouvé</h3>
                <p className="text-xs text-muted-foreground">Essaie de modifier tes filtres pour voir plus de résultats.</p>
              </div>
            </div>
          ) : (
            filteredTournaments.map((t) => (
              <TournamentCard 
                key={t.id} 
                id={t.id} 
                title={t.title} 
                game={t.game} 
                image={t.image_url} 
                date={new Date(t.start_date).toLocaleDateString('fr-FR')} 
                participants={`${participantCounts[t.id] || 0}/${t.max_participants}`} 
                entryFee={t.entry_fee.toString()} 
                type={t.type as any} 
                status={t.status as any}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Games;