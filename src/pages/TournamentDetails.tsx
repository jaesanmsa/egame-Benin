"use client";

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Trophy, Shield, CreditCard, Bitcoin, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { showSuccess } from '@/utils/toast';

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success'>('select');

  // Données simulées pour l'aperçu
  const tournament = {
    title: "Bénin Pro League FIFA 24",
    game: "FIFA 24",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
    date: "25 Mai, 2024",
    time: "14:00 GMT+1",
    participants: "12/64",
    entryFee: "10.00",
    prizePool: "$500.00",
    description: "Le plus grand tournoi FIFA du Bénin revient pour une nouvelle édition. Affrontez les meilleurs joueurs du pays et tentez de remporter le cashprize de 500$.",
    rules: [
      "Matchs en 1vs1",
      "Durée : 6 minutes par mi-temps",
      "Vitesse de jeu : Normale",
      "Équipes : Clubs uniquement"
    ]
  };

  const handlePayment = () => {
    setPaymentStep('processing');
    setTimeout(() => {
      setPaymentStep('success');
      showSuccess("Inscription réussie !");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <Navbar />
      
      <div className="relative h-[40vh] w-full">
        <img src={tournament.image} className="w-full h-full object-cover opacity-50" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-3 bg-zinc-900/80 backdrop-blur-md rounded-full border border-zinc-800 hover:bg-zinc-800 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <main className="max-w-4xl mx-auto px-6 -mt-32 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl"
        >
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
            <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
              <Calendar className="text-violet-500 mb-2" size={20} />
              <p className="text-zinc-400 text-xs">Date</p>
              <p className="font-bold text-sm">{tournament.date}</p>
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
              <Users className="text-violet-500 mb-2" size={20} />
              <p className="text-zinc-400 text-xs">Joueurs</p>
              <p className="font-bold text-sm">{tournament.participants}</p>
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
              <Trophy className="text-violet-500 mb-2" size={20} />
              <p className="text-zinc-400 text-xs">Format</p>
              <p className="font-bold text-sm">Élimination Directe</p>
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
              <Shield className="text-violet-500 mb-2" size={20} />
              <p className="text-zinc-400 text-xs">Anti-Cheat</p>
              <p className="font-bold text-sm">Activé</p>
            </div>
          </div>

          <div className="space-y-6 mb-10">
            <div>
              <h3 className="text-xl font-bold mb-3">À propos du tournoi</h3>
              <p className="text-zinc-400 leading-relaxed">{tournament.description}</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">Règles principales</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tournament.rules.map((rule, i) => (
                  <li key={i} className="flex items-center gap-2 text-zinc-400 text-sm">
                    <div className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Button 
            onClick={() => setShowPayment(true)}
            className="w-full py-8 rounded-2xl bg-violet-600 hover:bg-violet-700 text-xl font-black shadow-xl shadow-violet-500/20 transition-all"
          >
            S'INSCRIRE POUR ${tournament.entryFee}
          </Button>
        </motion.div>
      </main>

      {/* Modal de Paiement */}
      <AnimatePresence>
        {showPayment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayment(false)}
              className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-[2.5rem] p-8 overflow-hidden"
            >
              {paymentStep === 'select' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Paiement Sécurisé</h2>
                    <p className="text-zinc-400">Choisissez votre méthode de paiement</p>
                  </div>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={handlePayment}
                      className="w-full flex items-center justify-between p-5 bg-zinc-800 hover:bg-zinc-700 rounded-2xl border border-zinc-700 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                          <CreditCard size={24} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold">Carte Bancaire</p>
                          <p className="text-xs text-zinc-500">Visa, Mastercard</p>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full border-2 border-zinc-600 group-hover:border-violet-500" />
                    </button>

                    <button 
                      onClick={handlePayment}
                      className="w-full flex items-center justify-between p-5 bg-zinc-800 hover:bg-zinc-700 rounded-2xl border border-zinc-700 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                          <Bitcoin size={24} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold">Crypto-monnaie</p>
                          <p className="text-xs text-zinc-500">BTC, ETH, USDT</p>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full border-2 border-zinc-600 group-hover:border-violet-500" />
                    </button>
                  </div>

                  <p className="text-[10px] text-center text-zinc-500">
                    En payant, vous acceptez les conditions générales de eGame Bénin.
                  </p>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="py-12 text-center space-y-6">
                  <div className="w-20 h-20 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <h2 className="text-2xl font-bold">Traitement en cours...</h2>
                  <p className="text-zinc-400">Veuillez ne pas fermer cette fenêtre.</p>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="py-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-2xl font-bold">Félicitations !</h2>
                  <p className="text-zinc-400">Vous êtes officiellement inscrit au tournoi.</p>
                  <Button 
                    onClick={() => navigate('/profile')}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 py-6 rounded-xl"
                  >
                    Voir mon profil
                  </Button>
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