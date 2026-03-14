"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import { ArrowLeft, Trophy, Star, Gamepad2, Zap, Users, Target, MessageSquare, MapPin, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';

const CITIES = ["Cotonou", "Abomey-Calavi", "Porto-Novo", "Parakou", "Ouidah"];

const GameDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});
  const [hasActiveTournament, setHasActiveTournament] = useState(false);

  const gameInfo = {
    'free-fire': { 
      name: 'Free Fire', 
      icon: '🔥', 
      image: '/freefire.jpg',
      desc: "Le Battle Royale mobile le plus populaire au Bénin. Survis jusqu'au bout pour remporter le Booyah.",
      whatsapp: "https://whatsapp.com/channel/0029Vb6qihB9MF8wGo02z93E"
    },
    'clash-royale': { 
      name: 'Clash Royale', 
      icon: '👑', 
      image: '/clash royal.jpg',
      desc: "Un mélange de stratégie et de cartes. Détruis les tours adverses et grimpe dans le classement.",
      whatsapp: "https://whatsapp.com/channel/0029Vb6qihB9MF8wGo02z93E"
    },
    'clash-of-clans': { 
      name: 'Clash of Clans', 
      icon: '🏰', 
      image: '/clash of clans.jpeg',
      desc: "Construis ton village, forme tes troupes et mène ton clan à la victoire dans des guerres épiques.",
      whatsapp: "https://whatsapp.com/channel/0029Vb6qihB9MF8wGo02z93E"
    },
    'cod-mobile': { 
      name: 'COD Mobile', 
      icon: '📱', 
      image: '/cod mobile.jpg',
      desc: "L'expérience Call of Duty sur mobile. Précision et rapidité sont les clés de la victoire.",
      whatsapp: "https://whatsapp.com/channel/0029Vb6qihB9MF8wGo02z93E"
    },
    'pubg-mobile': { 
      name: 'PUBG Mobile', 
      icon: '🔫', 
      image: '/pubg-mobile.jpg',
      desc: "Le pionnier du Battle Royale. Atterris, équipe-toi et sois le dernier survivant.",
      whatsapp: "https://whatsapp.com/channel/0029Vb6qihB9MF8wGo02z93E"
    },
    'blur': { 
      name: 'Blur', 
      icon: '🏎️', 
      image: '/blur.jpg',
      desc: "Course arcade explosive. Utilise tes pouvoirs pour éjecter tes adversaires de la piste.",
      whatsapp: "https://whatsapp.com/channel/0029Vb6qihB9MF8wGo02z93E"
    },
    'cod-mw4': { 
      name: 'COD MW4', 
      icon: '🔫', 
      image: '/cod mw4.jpg',
      desc: "Le classique du FPS. Affrontements intenses en local ou en ligne.",
      whatsapp: "https://whatsapp.com/channel/0029Vb6qihB9MF8wGo02z93E"
    },
    'bombsquad': { 
      name: 'BombSquad', 
      icon: '💣', 
      image: '/bombsquad.png',
      desc: "Explose tes amis dans des mini-jeux délirants. Fun garanti.",
      whatsapp: "https://whatsapp.com/channel/0029Vb6qihB9MF8wGo02z93E"
    }
  }[id as string] || { name: id, icon: '🎮', image: '', desc: "Rejoins la compétition sur eGame Bénin.", whatsapp: "#" };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: activeTours } = await supabase
        .from('tournaments')
        .select('*')
        .ilike('game', `%${gameInfo.name}%`)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (activeTours) {
        setTournaments(activeTours);
        setHasActiveTournament(activeTours.length > 0);
      }

      const { data: finished } = await supabase
        .from('tournaments')
        .select('winner_name, winner_avatar, title, prize_pool')
        .ilike('game', `%${gameInfo.name}%`)
        .eq('status', 'finished')
        .order('updated_at', { ascending: false })
        .limit(5);
      
      if (finished) setWinners(finished);

      const { data: participants } = await supabase.from('payments').select('tournament_id').eq('status', 'Réussi');
      if (participants) {
        const counts: Record<string, number> = {};
        participants.forEach((p: any) => { counts[p.tournament_id] = (counts[p.tournament_id] || 0) + 1; });
        setParticipantCounts(counts);
      }

      setLoading(false);
    };
    fetchData();
  }, [id, gameInfo.name]);

  const filteredTournaments = tournaments.filter(t => selectedCity === "all" || t.city === selectedCity);

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <Navbar />
      <section className="relative h-[45vh] w-full overflow-hidden">
        <img src={gameInfo.image} className="w-full h-full object-cover opacity-40 scale-105" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute top-6 left-6 z-20">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-card/80 backdrop-blur-md rounded-full border border-border shadow-lg hover:scale-110 transition-transform">
            <ArrowLeft size={18} />
          </button>
        </div>
        <div className="absolute bottom-12 left-6 md:left-12 z-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 mb-2">
            <span className="text-5xl md:text-6xl drop-shadow-2xl">{gameInfo.icon}</span>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase">{gameInfo.name}</h1>
                {hasActiveTournament && (
                  <div className="bg-green-500/20 backdrop-blur-md border border-green-500/30 px-3 py-1 rounded-full flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Live</span>
                  </div>
                )}
              </div>
              <p className="text-violet-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Discipline Officielle eGame</p>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
              <h2 className="text-sm font-black mb-4 flex items-center gap-2.5 uppercase tracking-widest"><Target className="text-violet-500" size={18} />À propos de la discipline</h2>
              <p className="text-muted-foreground text-sm leading-relaxed font-medium">{gameInfo.desc}</p>
            </motion.section>
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3"><Zap className="text-yellow-500 fill-yellow-500" size={24} />Tournois Disponibles</h2>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="bg-card border-border rounded-xl h-12 w-full sm:w-48 text-xs font-bold"><div className="flex items-center gap-2"><MapPin size={14} className="text-violet-500" /><SelectValue placeholder="Ville" /></div></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">Toutes les villes</SelectItem>
                    {CITIES.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[24px]" />)
                ) : filteredTournaments.length === 0 ? (
                  <div className="col-span-full py-12 text-center bg-muted/10 rounded-[32px] border border-dashed border-border">
                    <Gamepad2 size={40} className="mx-auto text-muted-foreground/20 mb-3" />
                    <p className="text-muted-foreground text-xs font-bold italic">Aucun tournoi actif pour le moment.</p>
                  </div>
                ) : (
                  filteredTournaments.map((t) => (
                    <TournamentCard key={t.id} id={t.id} title={t.title} game={t.game} image={t.image_url} date={new Date(t.start_date).toLocaleDateString('fr-FR')} participants={`${participantCounts[t.id] || 0}/${t.max_participants}`} entryFee={t.entry_fee.toString()} type={t.type as any} status="active" />
                  ))
                )}
              </div>
            </section>
          </div>
          <div className="space-y-8">
            <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8"><div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500"><Trophy size={20} /></div><h2 className="text-xs font-black uppercase tracking-widest">Hall of Fame</h2></div>
              <div className="space-y-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
                ) : winners.length === 0 ? (
                  <div className="text-center py-8"><Star size={24} className="mx-auto text-muted-foreground/20 mb-2" /><p className="text-[10px] text-muted-foreground font-bold italic">L'histoire reste à écrire...</p></div>
                ) : (
                  winners.map((w, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50 hover:border-violet-500/30 transition-all group">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{w.winner_avatar || '🏆'}</span>
                      <div className="flex-1"><p className="font-black text-xs">{w.winner_name}</p><p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest line-clamp-1">{w.title}</p></div>
                      <div className="text-right"><p className="text-[9px] font-black text-green-500">+{w.prize_pool}</p></div>
                    </div>
                  ))
                )}
              </div>
            </motion.section>
            <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-violet-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-violet-500/20">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2"><MessageSquare size={16} />Communauté</h3>
              <div className="space-y-6">
                <p className="text-xs leading-relaxed text-violet-100 font-medium">Rejoins la communauté <span className="font-black text-white">{gameInfo.name}</span> de eGame Bénin pour ne rater aucune info.</p>
                <a href={gameInfo.whatsapp} target="_blank" rel="noopener noreferrer"><Button className="w-full bg-white text-violet-600 hover:bg-violet-50 py-6 rounded-2xl font-black text-xs gap-2">Rejoindre le groupe<ChevronRight size={16} /></Button></a>
              </div>
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameDetails;