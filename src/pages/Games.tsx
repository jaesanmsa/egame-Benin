"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import { motion } from 'framer-motion';
import { Gamepad2, MapPin, Filter, SearchX } from 'lucide-react';
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
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // 1. Tournois actifs
    const { data: tours } = await supabase
      .from('tournaments')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (tours) setTournaments(tours);

    // 2. Participants counts
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
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-600/10 rounded-2xl flex items-center justify-center text-violet-500 shadow-sm">
              <Gamepad2 size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Tournois Actifs</h1>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Choisis ton défi et gagne</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="bg-card border-border rounded-2xl h-14 w-full sm:w-48 text-xs font-bold shadow-sm">
                <div className="flex items-center gap-2"><MapPin size={14} className="text-violet-500" /><SelectValue placeholder="Ville" /></div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Toutes les villes</SelectItem>
                {CITIES.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedGame} onValueChange={setSelectedGame}>
              <SelectTrigger className="bg-card border-border rounded-2xl h-14 w-full sm:w-48 text-xs font-bold shadow-sm">
                <div className="flex items-center gap-2"><Filter size={14} className="text-violet-500" /><SelectValue placeholder="Jeu" /></div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Tous les jeux</SelectItem>
                {GAMES_LIST.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-[32px]" />)
          ) : filteredTournaments.length === 0 ? (
            <div className="col-span-full py-32 text-center space-y-6 bg-muted/10 rounded-[48px] border border-dashed border-border">
              <SearchX size={64} className="mx-auto text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground font-bold">Aucun tournoi actif trouvé pour ces critères.</p>
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
                status="active"
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Games;