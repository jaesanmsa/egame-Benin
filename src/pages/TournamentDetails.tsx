"use client";

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Trophy, Shield, Smartphone, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { showSuccess } from '@/utils/toast';

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success'>('select');

  // Données basées sur l'ID pour correspondre aux prix demandés
  const getTournamentData = (id: string | undefined) => {
    switch(id) {
      case 'cod-mw4': return { title: "Bénin Pro League: COD MW4", game: "COD MW4", entryFee: "2000", prizePool: "100.000 FCFA", image: "https://images.unsplash.com/photo-1552824236-0776282ffdee?q=80&w=2070&auto=format&fit=crop" };
      case 'blur': return { title: "Blur Racing Cup: Cotonou", game: "Blur", entryFee: "2500", prizePool: "150.000 FCFA", image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=2070&auto=format&fit=crop" };
      case 'clash-royale': return { title: "Clash Royale: King of Benin", game: "Clash Royale", entryFee: "1000", prizePool: "50.000 FCFA", image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=2071&auto=format&fit=crop" };
      case 'bombsquad': return { title: "BombSquad Party: Parakou", game: "BombSquad", entryFee: "1500", prizePool: "75.000 FCFA", image: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?q=80&w=2070&auto=format&fit=crop" };
      default: return { title: "Tournoi eGame", game: "Gaming", entryFee: "1000", prizePool: "50.000 FCFA", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" };
    }
  };

  const tournament = getTournamentData(id);

  const handleFedaPay = () => {
    setPaymentStep('processing');
    setTimeout(() => {
      setPaymentStep('success');
      showSuccess("Paiement FedaPay réussi !");
    }, 2500);
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
              <p className="text-2xl font-black">{tournament.prizePool}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 text-center">
              <Calendar className="text-violet-500 mx-auto mb-2" size={20} />
              <p className="text-zinc-400 text-xs">Date</p>
              <p className="font-bold text-sm">À venir</p>
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

          <Button onClick={() => setShowPayment(true)} className="w-full py-8 rounded-2xl bg-violet-600 hover:bg-violet-700 text-xl font-black shadow-xl shadow-violet-500/20">
            S'INSCRIRE POUR {tournament.entryFee} FCFA
          </Button>
        </motion.div>
      </main>

      <AnimatePresence>
        {showPayment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPayment(false)} className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-[2.5rem] p-8">
              {paymentStep === 'select' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Paiement Local</h2>
                    <p className="text-zinc-400">Payez via Mobile Money au Bénin</p>
                  </div>
                  <button onClick={handleFedaPay} className="w-full flex items-center justify-between p-5 bg-zinc-800 hover:bg-zinc-700 rounded-2xl border border-zinc-700 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500"><Smartphone size={24} /></div>
                      <div className="text-left">
                        <p className="font-bold">FedaPay (MTN / Moov)</p>
                        <p className="text-xs text-zinc-500">Paiement sécurisé 229</p>
                      </div>
                    </div>
                  </button>
                </div>
              )}
              {paymentStep === 'processing' && (
                <div className="py-12 text-center space-y-6">
                  <div className="w-20 h-20 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <h2 className="text-2xl font-bold">Lien FedaPay...</h2>
                </div>
              )}
              {paymentStep === 'success' && (
                <div className="py-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 size={48} /></div>
                  <h2 className="text-2xl font-bold">Inscription Validée !</h2>
                  <Button onClick={() => navigate('/profile')} className="w-full bg-zinc-800 py-6 rounded-xl">Voir mon profil</Button>
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