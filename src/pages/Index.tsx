"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import { Trophy, Gamepad2, Users, Coins, ShieldCheck, CreditCard, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [stats, setStats] = useState({ players: 0, tournaments: 0, cashPrize: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { count: playerCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: tourCount } = await supabase.from('tournaments').select('*', { count: 'exact', head: true });
      const { data: finishedTours } = await supabase.from('tournaments').select('prize_pool').eq('status', 'finished');
      const totalCash = finishedTours?.reduce((acc, t) => acc + (parseInt(t.prize_pool?.replace(/\D/g, '') || '0')), 0) || 0;

      setStats({ players: playerCount || 0, tournaments: tourCount || 0, cashPrize: totalCash });
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 relative">
      <SEO />
      <Navbar />
      
      <div className="absolute top-6 left-6 z-50">
        <Logo size="sm" />
      </div>
      
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-20 scale-105" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-tight">
              L'Arène Gaming <span className="text-violet-500">#1 du Bénin</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mb-8 font-medium max-w-xl mx-auto">
              Inscris-toi, participe aux tournois et gagne des cash prizes réels payés par Mobile Money.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={() => navigate('/games')} className="w-full sm:w-auto py-6 px-8 rounded-xl bg-violet-600 hover:bg-violet-700 font-bold text-white shadow-xl shadow-violet-500/20">
                Voir les tournois
              </Button>
              <Button variant="outline" onClick={() => navigate('/auth')} className="w-full sm:w-auto py-6 px-8 rounded-xl border-border font-bold">
                Créer un compte
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 space-y-24">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-20 -mt-12">
          <div className="bg-card border border-border p-6 rounded-[20px] shadow-sm text-center">
            <div className="w-10 h-10 bg-violet-600/10 rounded-xl flex items-center justify-center text-violet-500 mx-auto mb-3"><Gamepad2 size={20} /></div>
            <p className="text-3xl font-black mb-0.5">{stats.tournaments}</p>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Tournois</p>
          </div>
          <div className="bg-card border border-border p-6 rounded-[20px] shadow-sm text-center">
            <div className="w-10 h-10 bg-cyan-600/10 rounded-xl flex items-center justify-center text-cyan-500 mx-auto mb-3"><Users size={20} /></div>
            <p className="text-3xl font-black mb-0.5">{stats.players}</p>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Joueurs</p>
          </div>
          <div className="bg-card border border-border p-6 rounded-[20px] shadow-sm text-center">
            <div className="w-10 h-10 bg-green-600/10 rounded-xl flex items-center justify-center text-green-500 mx-auto mb-3"><Coins size={20} /></div>
            <p className="text-3xl font-black mb-0.5">{stats.cashPrize.toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Cash Prizes (FCFA)</p>
          </div>
        </section>

        <section className="bg-violet-600 rounded-[32px] p-10 md:p-16 text-white shadow-xl shadow-violet-500/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4"><ShieldCheck size={24} /></div>
              <h3 className="text-lg font-black">Sécurisé</h3>
              <p className="text-violet-100 text-[11px]">Paiements via MTN et Moov Money certifiés.</p>
            </div>
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4"><CreditCard size={24} /></div>
              <h3 className="text-lg font-black">Rapide</h3>
              <p className="text-violet-100 text-[11px]">Retrait des gains en moins de 24h.</p>
            </div>
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4"><Trophy size={24} /></div>
              <h3 className="text-lg font-black">Compétitif</h3>
              <p className="text-violet-100 text-[11px]">Affronte les meilleurs joueurs du pays.</p>
            </div>
          </div>
        </section>

        <footer className="py-16 border-t border-border text-center space-y-8">
          <div className="flex items-center justify-center gap-6">
            <a href="https://wa.me/2290141790790" target="_blank" className="text-muted-foreground hover:text-green-500 transition-colors"><MessageSquare size={20} /></a>
            <Trophy size={20} className="text-muted-foreground" />
          </div>
          <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest">© 2026 eGame Bénin • v1.0</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;