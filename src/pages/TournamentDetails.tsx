"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Trophy, Shield, Smartphone, CheckCircle2, ArrowLeft, Lock, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/lib/supabase';

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success'>('select');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const today = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  const getTournamentData = (id: string | undefined) => {
    switch(id) {
      case 'cod-mw4': return { 
        title: "Bénin Pro League: COD MW4 (Cotonou)", 
        game: "COD MW4", 
        entryFee: "2000", 
        prizePool: "100.000 FCFA", 
        image: "/images/games/COD.jpg",
        paymentLink: "https://me.fedapay.com/mpservices"
      };
      case 'blur': return { 
        title: "Blur Racing Cup: Cotonou", 
        game: "Blur", 
        entryFee: "2500", 
        prizePool: "150.000 FCFA", 
        image: "/images/games/blur.jpg",
        paymentLink: "https://process.fedapay.com/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjEwOTUwMzQ5MiwiZXhwIjoxNzcxMDE4NzM3fQ.7Bf62YWSCgE9zOfH-EueveD1m4gPdwau-4ECRPzZFts"
      };
      case 'clash-royale': return { 
        title: "Clash Royale: King of Benin", 
        game: "Clash Royale", 
        entryFee: "1000", 
        prizePool: "20.000 FCFA", 
        image: "/images/games/clash-royale.jpg",
        paymentLink: "https://me.fedapay.com/mpservices"
      };
      case 'bombsquad': return { 
        title: "BombSquad Party: Cotonou", 
        game: "BombSquad", 
        entryFee: "1500", 
        prizePool: "75.000 FCFA", 
        image: "/images/games/bombsquad.png",
        paymentLink: "https://me.fedapay.com/mpservices"
      };
      default: return { 
        title: "Tournoi eGame", 
        game: "Gaming", 
        entryFee: "1000", 
        prizePool: "50.000 FCFA", 
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
        paymentLink: "https://me.fedapay.com/mpservices"
      };
    }
  };

  const tournament = getTournamentData(id);

  const handleFedaPay = async () => {
    setPaymentStep('processing');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Veuillez vous connecter");

      const { error } = await supabase.from('payments').insert({
        user_id: user.id,
        tournament_id: id,
        tournament_name: tournament.title,
        amount: tournament.entryFee,
        status: 'En attente'
      });

      if (error) throw error;

      window.location.href = tournament.paymentLink;
      
    } catch (err: any) {
      showError("Erreur : " + err.message);
      setPaymentStep('select');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <Navbar />
      
      <div className="relative h-[40vh] w-full">
        <img src={tournament.image} className="w-full h-full object-cover opacity-50" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 p-3 bg-zinc-900/80 backdrop-blur-md rounded-full border border-zinc-800"><ArrowLeft size={20} /></button>
      </div>

      <main className="max-w-4xl mx-auto px-6 -mt-32 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
            <div>
              <span className="text-violet-500 font-bold uppercase tracking-widest text-sm">{tournament.game}</span>
              <h1 className="text-3xl md:text-4xl font-black mt-2">{tournament.title}</h1>
            </div>
            <div className="bg-violet-600 px-6 py-3 rounded-2xl text-center">
              <p className="text-xs text-violet-200 uppercase font-bold">Prix à gagner</p>
              <p className="text-2xl font-black">{isLoggedIn ? tournament.prizePool : "???"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 text-center">
              <Calendar className="text-violet-500 mx-auto mb-2" size={20} />
              <p className="text-zinc-400 text-xs">Date</p>
              <p className="font-bold text-sm">{today}</p>
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 text-center">
              <Users className="text-violet-500 mx-auto mb-2" size={20} />
              <p className="text-zinc-400 text-xs">Joueurs</p>
              <p className="font-bold text-sm">Ouvert</p>
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 text-center">
              <Trophy className="text-violet-500 mx-auto mb-2" size={20} />
              <p className="text-zinc-400 text-xs">Format</p>
              <p className="font-bold text-sm">Tournoi</p>
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 text-center">
              <Shield className="text-violet-500 mx-auto mb-2" size={20} />
              <p className="text-zinc-400 text-xs">Anti-Cheat</p>
              <p className="font-bold text-sm">Activé</p>
            </div>
          </div>

          {isLoggedIn ? (
            <Button onClick={() => setShowPayment(true)} className="w-full py-6 rounded-2xl bg-violet-600 hover:bg-violet-700 text-base md:text-lg font-black shadow-xl shadow-violet-500/20 uppercase tracking-tight">
              S'inscrire pour {tournament.entryFee} FCFA
            </Button>
          ) : (
            <Button onClick={() => navigate('/auth')} className="w-full py-6 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-base md:text-lg font-black flex items-center justify-center gap-3 uppercase tracking-tight">
              <Lock size={20} />
              Se connecter pour s'inscrire
            </Button>
          )}
        </motion.div>
      </main>

      <footer className="p-8 text-center text-zinc-600 text-xs font-bold uppercase tracking-widest">
        eGame Benin @2026
      </footer>

      <AnimatePresence>
        {showPayment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPayment(false)} className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-zinc-900 border border-zinc-800 w-full max-w-[340px] rounded-[2rem] p-6">
              
              <button 
                onClick={() => setShowPayment(false)}
                className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-all z-50"
              >
                <X size={20} />
              </button>

              {paymentStep === 'select' && (
                <div className="space-y-5">
                  <div className="text-center">
                    <h2 className="text-lg font-bold mb-1">Paiement Local</h2>
                    <p className="text-zinc-400 text-xs">Payez via Mobile Money au Bénin</p>
                  </div>
                  <button onClick={handleFedaPay} className="w-full flex items-center justify-between p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-zinc-700 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500"><Smartphone size={20} /></div>
                      <div className="text-left">
                        <p className="font-bold text-sm">FedaPay (MTN / Moov)</p>
                        <p className="text-[10px] text-zinc-500">Paiement sécurisé 229</p>
                      </div>
                    </div>
                  </button>
                </div>
              )}
              {paymentStep === 'processing' && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <h2 className="text-lg font-bold">Redirection...</h2>
                  <p className="text-zinc-400 text-xs">Veuillez patienter un instant.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TournamentDetails;