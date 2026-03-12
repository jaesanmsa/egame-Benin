"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import { motion } from 'framer-motion';
import { Gamepad2, MapPin, Filter, SearchX, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const CITIES = ["Cotonou", "Abomey-Calavi", "Porto-Novo", "Parakou", "Ouidah", "Autre"];

// Free Fire en première position comme demandé
const DISCIPLINES = [
  { id: 'free-fire', name: 'Free Fire', icon: '🔥' },
  { id: 'efootball', name: 'eFootball', icon: '⚽' },
  { id: 'clash-royale', name: 'Clash Royale', icon: '👑' },
  { id: 'cod-mobile', name: 'COD Mobile', icon: '📱' },
  { id: 'pubg-mobile', name: 'PUBG Mobile', icon: '🍗' },
  { id: 'blur', name: 'Blur', icon: '🏎️' },
  { id: 'cod-mw4', name: 'COD MW4', icon: '🔫' },
  { id: 'bombsquad', name: 'BombSquad', icon: '💣' }
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
    // On ne récupère QUE les tournois actifs
    const { data: tours } = await supabase
      .from('tournaments')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (tours) {
      setTournaments(tours);
      
      // Identifier les jeux qui ont des tournois actifs pour le point vert
      const active = new Set<string>();
      tours.forEach(t => {
        const gameId = DISCIPLINES.find(d => t.game.toLowerCase().includes(d.name.toLowerCase()))?.id;
        if (gameId) active.add(gameId);
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

        {/* Filtre des Jeux - Défilement horizontal "jolie" */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Trophy size={14} className="text-violet-500" />
              Disciplines
            </h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
            <button 
              onClick={() => setSelectedGame("all")}
              className={`flex-shrink-0 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${selectedGame === "all" ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20' : 'bg-card border-border text-muted-foreground hover:border-violet-500/30'}`}
            >
              Tous les jeux
            </button>
            
            {DISCIPLINES.map((game) => {
              const isActive = activeGames.has(game.id);
              const isSelected = selectedGame.toLowerCase() === game.name.toLowerCase();
              
              return (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(isSelected ? "all" : game.name)}
                  className={`flex-shrink-0 flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border relative ${isSelected ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20' : 'bg-card border-border text-muted-foreground hover:border-violet-500/30'}`}
                >
                  <span className="text-lg">{game.icon}</span>
                  {game.name}
                  
                  {/* Point vert si tournoi en cours */}
                  {isActive && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-background"></span>
                    </span>
                  )}
                </button>
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

        {/* Liste des tournois actifs */}
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
                <h3 className="text-xl font-black">Aucun tournoi actif</h3>
                <p className="text-xs text-muted-foreground">Reviens plus tard ou change tes filtres.</p>
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