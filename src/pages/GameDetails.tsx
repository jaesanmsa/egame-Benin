"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Trophy, Star, Gamepad2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

const GameDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const gameInfo = {
    'free-fire': { name: 'Free Fire', icon: '🔥', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800' },
    'efootball': { name: 'eFootball', icon: '⚽', image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800' },
    'clash-royale': { name: 'Clash Royale', icon: '👑', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800' },
    'cod-mobile': { name: 'COD Mobile', icon: '📱', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800' },
    'pubg-mobile': { name: 'PUBG Mobile', icon: '🍗', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=800' }
  }[id as string] || { name: id, icon: '🎮', image: '' };

  useEffect(() => {
    const fetchData = async () => {
      const { data: finished } = await supabase
        .from('tournaments')
        .select('winner_name, winner_avatar, title')
        .ilike('game', `%${gameInfo.name}%`)
        .eq('status', 'finished')
        .limit(10);
      
      if (finished) setWinners(finished);
      setLoading(false);
    };
    fetchData();
  }, [id, gameInfo.name]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-8 hover:text-foreground transition-colors text-xs font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> Retour
        </button>

        <section className="relative h-64 rounded-[2.5rem] overflow-hidden mb-12 border border-border shadow-xl">
          <img src={gameInfo.image} className="w-full h-full object-cover opacity-40" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{gameInfo.icon}</span>
              <h1 className="text-4xl font-black tracking-tighter">{gameInfo.name}</h1>
            </div>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">Discipline Officielle</p>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
              <h2 className="text-xl font-black mb-4 flex items-center gap-3">
                <Star className="text-violet-500" size={20} />
                À propos
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {gameInfo.name} est l'une des disciplines les plus compétitives sur eGame Bénin. 
                Rejoins les tournois pour grimper dans le classement et devenir le champion incontesté de cette catégorie.
              </p>
              <Link to="/games" className="inline-block mt-6">
                <button className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all">
                  Voir les tournois disponibles
                </button>
              </Link>
            </section>
          </div>

          <section className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="text-yellow-500" size={20} />
              <h2 className="text-xs font-black uppercase tracking-widest">Hall of Fame</h2>
            </div>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)
              ) : winners.length === 0 ? (
                <p className="text-[10px] text-muted-foreground font-bold italic">L'histoire reste à écrire...</p>
              ) : (
                winners.map((w, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl border border-border/50">
                    <span className="text-xl">{w.winner_avatar || '🏆'}</span>
                    <div>
                      <p className="font-black text-xs">{w.winner_name}</p>
                      <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">{w.title}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default GameDetails;