"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import { ArrowLeft, Trophy, Users, Zap, Gamepad2, Star, History } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

const GameDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const gameInfo = {
    'free-fire': { name: 'Free Fire', icon: '🔥', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800' },
    'efootball': { name: 'eFootball', icon: '⚽', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800' },
    'clash-royale': { name: 'Clash Royale', icon: '👑', image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=800' },
    'cod-mobile': { name: 'COD Mobile', icon: '📱', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=800' },
    'pubg-mobile': { name: 'PUBG Mobile', icon: '🍗', image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=800' }
  }[id as string] || { name: id, icon: '🎮', image: '' };

  useEffect(() => {
    const fetchData = async () => {
      const { data: tours } = await supabase
        .from('tournaments')
        .select('*')
        .ilike('game', `%${gameInfo.name}%`)
        .order('created_at', { ascending: false });
      
      if (tours) setTournaments(tours);

      const { data: finished } = await supabase
        .from('tournaments')
        .select('winner_name, winner_avatar, title')
        .ilike('game', `%${gameInfo.name}%`)
        .eq('status', 'finished')
        .limit(5);
      
      if (finished) setWinners(finished);
      setLoading(false);
    };
    fetchData();
  }, [id, gameInfo.name]);

  const activeTournaments = tournaments.filter(t => t.status === 'active');
  const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming');
  const totalPrize = tournaments.reduce((acc, t) => acc + (parseInt(t.prize_pool?.replace(/\D/g, '') || '0')), 0);

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-8 hover:text-foreground transition-colors text-xs font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> Retour aux jeux
        </button>

        <section className="relative h-64 rounded-[3rem] overflow-hidden mb-12 border border-border shadow-2xl">
          <img src={gameInfo.image} className="w-full h-full object-cover opacity-40" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{gameInfo.icon}</span>
                <h1 className="text-4xl font-black tracking-tighter">{gameInfo.name}</h1>
              </div>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">Compétition Officielle</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-card/50 backdrop-blur-md border border-border px-6 py-3 rounded-2xl text-center">
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Cash Prize Total</p>
                <p className="text-lg font-black text-violet-500">{totalPrize.toLocaleString()} FCFA</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-violet-600/10 rounded-xl flex items-center justify-center text-violet-500">
                  <Zap size={20} />
                </div>
                <h2 className="text-xl font-black">Tournois Actifs</h2>
              </div>
              
              {activeTournaments.length === 0 ? (
                <div className="bg-muted/30 border border-dashed border-border rounded-[2rem] p-12 text-center">
                  <Gamepad2 size={40} className="mx-auto text-muted-foreground/20 mb-4" />
                  <p className="text-muted-foreground font-bold italic">Aucun tournoi actif pour le moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeTournaments.map(t => (
                    <TournamentCard key={t.id} id={t.id} title={t.title} game={t.game} image={t.image_url} date={new Date(t.start_date).toLocaleDateString('fr-FR')} participants={`${t.max_participants}`} entryFee={t.entry_fee.toString()} type={t.type as any} />
                  ))}
                </div>
              )}
            </section>

            {upcomingTournaments.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-cyan-600/10 rounded-xl flex items-center justify-center text-cyan-500">
                    <Star size={20} />
                  </div>
                  <h2 className="text-xl font-black">À venir</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingTournaments.map(t => (
                    <TournamentCard key={t.id} id={t.id} title={t.title} game={t.game} image={t.image_url} date={new Date(t.start_date).toLocaleDateString('fr-FR')} participants={`${t.max_participants}`} entryFee={t.entry_fee.toString()} type={t.type as any} />
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-8">
            <section className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="text-yellow-500" size={20} />
                <h2 className="text-sm font-black uppercase tracking-widest">Derniers Gagnants</h2>
              </div>
              <div className="space-y-4">
                {winners.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground font-bold italic">L'histoire reste à écrire...</p>
                ) : (
                  winners.map((w, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-muted/30 rounded-2xl border border-border/50">
                      <span className="text-xl">{w.winner_avatar || '🏆'}</span>
                      <div>
                        <p className="font-black text-xs">{w.winner_name}</p>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{w.title}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="bg-violet-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-violet-500/20">
              <h2 className="text-sm font-black uppercase tracking-widest mb-4">Rejoindre l'élite</h2>
              <p className="text-xs opacity-80 leading-relaxed mb-6">Inscrivez-vous aux prochains tournois et gravissez les échelons pour devenir une légende.</p>
              <Link to="/auth">
                <button className="w-full py-4 bg-white text-violet-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-100 transition-colors">S'inscrire maintenant</button>
              </Link>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameDetails;