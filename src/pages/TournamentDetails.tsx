"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Trophy, Shield, Smartphone, ArrowLeft, Lock, X, Share2, ListChecks } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/lib/supabase';

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing'>('select');
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
    const baseRules = [
      "Être présent 15 min avant le début.",
      "Fair-play obligatoire (pas d'insultes).",
      "Connexion internet stable requise.",
      "Le Cash Prize est payé via Mobile Money."
    ];

    switch(id) {
      case 'pubg-mobile': return { 
        title: "PUBG Mobile: Battle of Benin", 
        game: "PUBG Mobile", 
        entryFee: "1500", 
        prizePool: "30.000 FCFA", 
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
        paymentLink: "https://me.fedapay.com/mpservices",
        rules: [...baseRules, "Mode Squad ou Solo selon l'annonce.", "Émulateurs interdits."]
      };
      case 'cod-mw4': return { 
        title: "Bénin Pro League: COD MW4 (Cotonou)", 
        game: "COD MW4", 
        entryFee: "2000", 
        prizePool: "35.000 FCFA", 
        image: "/images/games/COD.jpg",
        paymentLink: "https://me.fedapay.com/mpservices",
        rules: [...baseRules, "Mode Recherche & Destruction.", "Pas de lance-grenades."]
      };
      case 'blur': return { 
        title: "Blur Racing Cup: Cotonou", 
        game: "Blur", 
        entryFee: "2000", 
        prizePool: "35.000 FCFA", 
        image: "/images/games/blur.jpg",
        paymentLink: "https://process.fedapay.com/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjEwOTUwMzQ5MiwiZXhwIjoxNzcxMDE4NzM3fQ.7Bf62YWSCgE9zOfH-EueveD1m4gPdwau-4ECRPzZFts",
        rules: [...baseRules, "Course en 3 manches.", "Tous les bonus sont autorisés."]
      };
      case 'clash-royale': return { 
        title: "Clash Royale: King of Benin", 
        game: "Clash Royale", 
        entryFee: "1000", 
        prizePool: "30.000 FCFA", 
        image: "/images/games/clash-royale.jpg",
        paymentLink: "https://me.fedapay.com/mpservices",
        rules: [...baseRules, "Niveau des cartes plafonné à 11.", "Format élimination directe."]
      };
      case 'bombsquad': return { 
        title: "BombSquad Party: Cotonou", 
        game: "BombSquad", 
        entryFee: "1500", 
        prizePool: "30.000 FCFA", 
        image: "/images/games/bombsquad.png",
        paymentLink: "https://me.fedapay.com/mpservices",
        rules: [...baseRules, "Match en équipe de 2.", "Manettes recommandées."]
      };
      default: return { 
        title: "Tournoi eGame", 
        game: "Gaming", 
        entryFee: "1000", 
        prizePool: "30.000 FCFA", 
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
        paymentLink: "https://me.fedapay.com/mpservices",
        rules: baseRules
      };
    }
  };

  const tournament = getTournamentData(id);

  const handleShare = async () => {
    const shareData = {
      title: tournament.title,
      text: `Rejoins-moi sur eGame Bénin pour le tournoi ${tournament.game} !`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showSuccess("Lien copié !");
      }
    } catch (err) { console.error(err); }
  };

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
        <div className="absolute top-6 left-6 flex gap-3">
          <button onClick={() => navigate(-1)} className="p-3 bg-zinc-900/80 backdrop-blur-md rounded-full border border-zinc-800"><ArrowLeft size={20} /></button>
        </div>
        <div className="absolute top-6 right-6">
          <button onClick={handleShare} className="p-3 bg-violet-600 rounded-full shadow-lg shadow-violet-500/20"><Share2 size={20} /></button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 -mt-32 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl mb-8">
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-500">
              <ListChecks size={20} />
            </div>
            <h2 className="text-xl font-bold">Règles & Infos</h2>
          </div>
          <ul className="space-y-4">
            {tournament.rules.map((rule, index) => (
              <li key={index} className="flex items-start gap-3 text-zinc-400 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </main>

      <AnimatePresence>
        {showPayment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPayment(false)} className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-zinc-900 border border-zinc-800 w-full max-w-[340px] rounded-[2rem] p-6">
              <button onClick={() => setShowPayment(false)} className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-all z-50"><X size={20} /></button>
              {paymentStep === 'select' ? (
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
              ) : (
                <div className="py-8 text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <h2 className="text-lg font-bold">Redirection...</h2>
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