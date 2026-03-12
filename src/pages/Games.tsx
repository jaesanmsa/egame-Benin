"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import PlayerBadge from '@/components/PlayerBadge';
import { motion } from 'framer-motion';
import { Gamepad2, MapPin, Filter, SearchX, Trophy, ArrowRight, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const CITIES = ["Cotonou", "Abomey-Calavi", "Porto-Novo", "Parakou", "Ouidah", "Autre"];

const AVAILABLE_GAMES = [
  { id: 'free-fire', name: 'Free Fire', icon: '🔥', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800' },
  { id: 'efootball', name: 'eFootball', icon: '⚽', image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800' },
  { id: 'clash-royale', name: 'Clash Royale', icon: '👑', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800' },
  { id: 'cod-mobile', name: 'COD Mobile', icon: '📱', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800' },
  { id: 'pubg-mobile', name: 'PUBG Mobile', icon: '🍗', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=800' }
];

const Games = () => {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [lastWinners, setLastWinners] = useState<any[]>([]);
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

    // 2. Derniers gagnants (3)
    const { data: winners } = await supabase
      .from('tournaments')
      .select('winner_name, winner_avatar, prize_pool, title')
      .eq('status', 'finished')
      .order('updated_at', { ascending: false })
      .limit(3);
    
    if (winners) {
      const winnersWithBadges = await Promise.all(winners.map(async (w) => {
        const { data: prof } = await supabase.from('profiles').select('id').eq('username', w.winner_name).maybeSingle();
        let tCount = 0;
        if (prof) {
          const { count } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('user_id', prof.id).eq('status', 'Réussi');
          tCount = count || 0;
        }
        return { ...w, tournamentCount: tCount };
      }));
      setLastWinners(winnersWithBadges);
    }

    // 3. Participants counts
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
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-20">
        
        {/* Section 1: Nos Jeux (5 cartes) */}
        <section className="space-y-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black tracking-tight">Nos Disciplines</h1>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-2">Choisis ton jeu et entre dans l'arène</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {AVAILABLE_GAMES.map((game) => (
              <Link key={game.id} to={`/game/${game.id}`}>
                <motion.div whileHover={{ y: -5 }} className="group relative aspect-[4/5] rounded-[24px] overflow-hidden border border-border shadow-sm">
                  <img src={game.image} alt={game.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-2xl mb-1 block">{game.icon}</span>
                    <h3 className="text-white font-black text-sm uppercase tracking-tighter">{game.name}</h3>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 2: Derniers Gagnants (3 champions) */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Trophy className="text-yellow-500" size={24} />
              Derniers Champions
            </h2>
            <Link to="/leaderboard" className="text-violet-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:underline">
              Hall of Fame <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-[24px]" />)
            ) : lastWinners.length === 0 ? (
              <div className="col-span-full py-8 text-center text-muted-foreground text-xs italic">En attente des prochains champions...</div>
            ) : (
              lastWinners.map((w, i) => (
                <motion.div key={i} whileHover={{ y: -3 }} className="bg-card border border-border p-6 rounded-[24px] shadow-sm flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 rounded-full border-2 border-violet-600/20 overflow-hidden bg-muted">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${w.winner_name}`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      <PlayerBadge tournamentCount={w.tournamentCount} size="sm" />
                    </div>
                  </div>
                  <h3 className="text-lg font-black mb-0.5">{w.winner_name}</h3>
                  <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mb-3">{w.title}</p>
                  <div className="bg-green-500/10 text-green-500 px-4 py-1 rounded-full font-black text-[10px] border border-green-500/20">
                    +{w.prize_pool}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Section 3: Tournois Actifs (Filtres + Liste) */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-violet-600/10 rounded-xl flex items-center justify-center text-violet-500">
                <Filter size={18} />
              </div>
              <div>
                <h2 className="text-xl font-black">Tournois Actifs</h2>
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Inscris-toi et gagne</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="bg-card border-border rounded-xl h-12 w-full sm:w-48 text-xs font-bold">
                  <div className="flex items-center gap-2"><MapPin size={14} className="text-violet-500" /><SelectValue placeholder="Ville" /></div>
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  {CITIES.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={selectedGame} onValueChange={setSelectedGame}>
                <SelectTrigger className="bg-card border-border rounded-xl h-12 w-full sm:w-48 text-xs font-bold">
                  <div className="flex items-center gap-2"><Gamepad2 size={14} className="text-violet-500" /><SelectValue placeholder="Jeu" /></div>
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Tous les jeux</SelectItem>
                  {AVAILABLE_GAMES.map(g => <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[24px]" />)
            ) : filteredTournaments.length === 0 ? (
              <div className="col-span-full py-20 text-center space-y-4 bg-muted/10 rounded-[32px] border border-dashed border-border">
                <SearchX size={48} className="mx-auto text-muted-foreground/20" />
                <p className="text-xs text-muted-foreground font-bold">Aucun tournoi actif trouvé.</p>
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
        </section>
      </main>
    </div>
  );
};

export default Games;