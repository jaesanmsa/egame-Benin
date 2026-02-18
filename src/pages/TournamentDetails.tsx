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
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing'>('select');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchTournament = async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error && data) {
        setTournament(data);
      }
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    fetchTournament();
  }, [id]);

  const generateCode = () => {
    return `EGB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  };

  const handleFedaPay = async () => {
    setPaymentStep('processing');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Veuillez vous connecter");
      
      const validationCode = generateCode();
      
      const { error } = await supabase.from('payments').insert({
        user_id: user.id,
        tournament_id: id,
        tournament_name: tournament.title,
        amount: tournament.entry_fee,
        status: 'En attente',
        validation_code: validationCode
      });

      if (error) throw error;
      
      window.location.href = "https://me.fedapay.com/mpservices";
    } catch (err: any) {
      showError(err.message);
      setPaymentStep('select');
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!tournament) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Tournoi non trouvé</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <Navbar />
      <div className="relative h-[40vh] w-full">
        <img src={tournament.image_url} className="w-full h-full object-cover opacity-50" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
        <div className="absolute top-6 left-6"><button onClick={() => navigate(-1)} className="p-3 bg-zinc-900/80 rounded-full"><ArrowLeft size={20} /></button></div>
        <div className="absolute top-6 right-6"><button onClick={() => { navigator.clipboard.writeText(window.location.href); showSuccess("Lien copié !"); }} className="p-3 bg-violet-600 rounded-full"><Share2 size={20} /></button></div>
      </div>

      <main className="max-w-4xl mx-auto px-6 -mt-32 relative z-10">
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl mb-8">
          <div className="flex justify-between items-start gap-4 mb-8">
            <div>
              <span className="text-violet-500 font-bold uppercase tracking-widest text-sm">{tournament.game}</span>
              <h1 className="text-3xl font-black mt-2">{tournament.title}</h1>
            </div>
            <div className="bg-violet-600 px-6 py-3 rounded-2xl text-center">
              <p className="text-xs text-violet-200 uppercase font-bold">Cash Prize</p>
              <p className="text-2xl font-black">{tournament.prize_pool}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 text-center">
              <Calendar className="text-violet-500 mx-auto mb-2" size={20} />
              <p className="text-zinc-400 text-xs">Date</p>
              <p className="font-bold text-sm">{new Date(tournament.start_date).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 text-center">
              <Users className="text-violet-500 mx-auto mb-2" size={20} />
              <p className="text-zinc-400 text-xs">Max Joueurs</p>
              <p className="font-bold text-sm">{tournament.max_participants}</p>
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 text-center">
              <Trophy className="text-violet-500 mx-auto mb-2" size={20} />
              <p className="text-zinc-400 text-xs">Type</p>
              <p className="font-bold text-sm">{tournament.type}</p>
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 text-center">
              <Shield className="text-violet-500 mx-auto mb-2" size={20} />
              <p className="text-zinc-400 text-xs">Anti-Cheat</p>
              <p className="font-bold text-sm">Activé</p>
            </div>
          </div>

          {isLoggedIn ? (
            <Button onClick={() => setShowPayment(true)} className="w-full py-6 rounded-2xl bg-violet-600 font-black">
              S'inscrire pour {tournament.entry_fee} FCFA
            </Button>
          ) : (
            <Button onClick={() => navigate('/auth')} className="w-full py-6 rounded-2xl bg-zinc-800 font-black gap-3">
              <Lock size={20} /> Se connecter pour s'inscrire
            </Button>
          )}
        </div>
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