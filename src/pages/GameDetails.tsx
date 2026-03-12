"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import { ArrowLeft, Trophy, Star, Gamepad2, Zap, Users, Target } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Skeleton } from "@/components/ui/skeleton";

const GameDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});

  const gameInfo = {
    'free-fire': { 
      name: 'Free Fire', 
      icon: '🔥', 
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200',
      desc: "Le Battle Royale mobile le plus populaire au Bénin. Survis jusqu'au bout pour remporter le Booyah et le cash prize."
    },
    'efootball': { 
      name: 'eFootball', 
      icon: '⚽', 
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200',
      desc: "La simulation de football ultime. Maîtrise le terrain, marque des buts spectaculaires et deviens le roi du gazon virtuel."
    },
    'clash-royale': { 
      name: 'Clash Royale', 
      icon: '👑', 
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200',
      desc: "Un mélange de stratégie et de cartes. Détruis les tours adverses et grimpe dans le classement eGame Bénin."
    },
    'cod-mobile': { 
      name: 'COD Mobile', 
      icon: '📱', 
      image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200',
      desc: "L'expérience Call of Duty sur mobile. Précision, rapidité et travail d'équipe sont les clés de la victoire."
    },
    'pubg-mobile': { 
      name: 'PUBG Mobile', 
      icon: '🍗', 
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=1200',
      desc: "Le pionnier du Battle Royale. Atterris, équipe-toi et sois le dernier survivant pour le Winner Winner Chicken Dinner."
    }
  }[id as string] || { name: id, icon: '🎮', image: '', desc: "Rejoins la compétition sur eGame Bénin." };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // 1. Tournois actifs pour ce jeu
      const { data: activeTours } = await supabase
        .from('tournaments')
        .select('*')
        .ilike('game', `%${gameInfo.name}%`)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (activeTours) setTournaments(activeTours);

      // 2. Anciens gagnants (Hall of Fame)
      const { data: finished } = await supabase
        .from('tournaments')
        .select('winner_name, winner_avatar, title, prize_pool')
        .ilike('game', `%${gameInfo.name}%`)
        .eq('status', 'finished')
        .order('updated_at', { ascending: false })
        .limit(5);
      
      if (finished) setWinners(finished);

      // 3. Counts de participants
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

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <Navbar />
      
      {/* Hero Header */}
      <section className="relative h-[45vh] w-full overflow-hidden">
        <img src={gameInfo.image} className="w-full h-full object-cover opacity-40 scale-105" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        <div className="absolute top-6 left-6 z-20">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-card/80 backdrop-blur-md rounded-full border border-border shadow-lg hover:scale-110 transition-transform">
            <ArrowLeft size={18} />
          </button>
        </div>

        <div className="absolute bottom-12 left-6 md:left-12 z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-2"
          >
            <span className="text-5xl md:text-6xl drop-shadow-2xl">{gameInfo.icon}</span>
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">{gameInfo.name}</h1>
              <p className="text-violet-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Discipline Officielle eGame</p>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Colonne Gauche: Tournois & Description */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Description Card */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm"
            >
              <h2 className="text-sm font-black mb-4 flex items-center gap-2.5 uppercase tracking-widest">
                <Target className="text-violet-500" size={18} />
                À propos de la discipline
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                {gameInfo.desc}
              </p>
            </motion.section>

            {/* Active Tournaments */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <Zap className="text-yellow-500 fill-yellow-500" size={24} />
                  Tournois en cours
                </h2>
                <span className="bg-green-500/10 text-green-500 text-[10px] font-black px-3 py-1 rounded-full border border-green-500/20 uppercase tracking-widest">
                  {tournaments.length} Actifs
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[24px]" />)
                ) : tournaments.length === 0 ? (
                  <div className="col-span-full py-12 text-center bg-muted/10 rounded-[32px] border border-dashed border-border">
                    <Gamepad2 size={40} className="mx-auto text-muted-foreground/20 mb-3" />
                    <p className="text-muted-foreground text-xs font-bold italic">Aucun tournoi actif pour le moment.</p>
                    <Link to="/games" className="text-violet-500 text-[10px] font-black uppercase tracking-widest mt-4 inline-block hover:underline">Voir les autres jeux →</Link>
                  </div>
                ) : (
                  tournaments.map((t) => (
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
          </div>

          {/* Colonne Droite: Hall of Fame & Stats */}
          <div className="space-y-8">
            
            {/* Hall of Fame */}
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
                  <Trophy size={20} />
                </div>
                <h2 className="text-xs font-black uppercase tracking-widest">Hall of Fame</h2>
              </div>

              <div className="space-y-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
                ) : winners.length === 0 ? (
                  <div className="text-center py-8">
                    <Star size={24} className="mx-auto text-muted-foreground/20 mb-2" />
                    <p className="text-[10px] text-muted-foreground font-bold italic">L'histoire reste à écrire...</p>
                  </div>
                ) : (
                  winners.map((w, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50 hover:border-violet-500/30 transition-all group">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{w.winner_avatar || '🏆'}</span>
                      <div className="flex-1">
                        <p className="font-black text-xs">{w.winner_name}</p>
                        <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest line-clamp-1">{w.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-green-500">+{w.prize_pool}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.section>

            {/* Stats Card */}
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-violet-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-violet-500/20"
            >
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <Users size={16} />
                Communauté
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-violet-200 uppercase tracking-widest mb-1">Niveau de compétition</p>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-violet-600 bg-violet-400 overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + gameInfo.name}`} alt="" />
                        </div>
                      ))}
                    </div>
                    <span className="text-xs font-black">Élite Bénin</span>
                  </div>
                </div>
                <p className="text-[10px] leading-relaxed text-violet-100 font-medium">
                  Rejoins les meilleurs joueurs de {gameInfo.name} du pays et prouve ta valeur.
                </p>
              </div>
            </motion.section>

          </div>
        </div>
      </main>
    </div>
  );
};

export default GameDetails;