"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, MapPin, Filter, SearchX, Zap, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const CITIES = ["Cotonou", "Abomey-Calavi", "Porto-Novo", "Parakou", "Ouidah", "Autre"];
const GAMES_LIST = ["Free Fire", "eFootball", "Clash Royale", "COD Mobile", "PUBG Mobile", "Blur", "COD MW4", "BombSquad"];

const Games = () => {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    const { data: tours } = await supabase
      .from('tournaments')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (tours) setTournaments(tours);

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
          <h1 className="text-3xl font-black tracking-tight">Trouver un Tournoi</h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-2">Filtre par ville et par discipline</p>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ville</p>
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

          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Discipline</p>
            <Select value={selectedGame} onValueChange={setSelectedGame}>
              <SelectTrigger className="bg-card border-border rounded-xl h-12 text-xs font-bold shadow-sm">
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-violet-500" />
                  <SelectValue placeholder="Tous les jeux" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Tous les jeux</SelectItem>
                {GAMES_LIST.map(game => (
                  <SelectItem key={game} value={game}>{game}</SelectItem>
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
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Games;