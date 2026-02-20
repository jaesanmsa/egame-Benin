"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Trophy, Shield, Smartphone, ArrowLeft, Lock, X, Share2, Globe, MapPin, Info, Gamepad2, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/lib/supabase';
import { Progress } from "@/components/ui/progress";

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing'>('select');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [userRegistration, setUserRegistration] = useState<any>(null);

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

    const fetchParticipants = async () => {
      const { count } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('tournament_id', id)
        .eq('status', 'Réussi');
      
      setParticipantCount(count || 0);
    };

    const checkUserRegistration = async (userId: string) => {
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('tournament_id', id)
        .eq('user_id', userId)
        .eq('status', 'Réussi')
        .single();
      
      if (data) setUserRegistration(data);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session?.user) checkUserRegistration(session.user.id);
    });

    fetchTournament();
    fetchParticipants();
  }, [id]);

  const handleFedaPay = async () => {
    setPaymentStep('processing');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Veuillez vous connecter");
      
      const validationCode = `EGB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      
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

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!tournament) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Tournoi non trouvé</div>;

  const maxParticipants = tournament.max_participants || 40;
  const isFull = participantCount >= maxParticipants;
  const progress = (participantCount / maxParticipants) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <Navbar />
      <div className="relative h-[40vh] w-full">
        <img src={tournament.image_url} className="w-full h-full object-cover opacity-50" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute top-6 left-6"><button onClick={() => navigate(-1)} className="p-3 bg-card/80 rounded-full"><ArrowLeft size={20} /></button></div>
        <div className="absolute top-6 right-6"><button onClick={() => { navigator.clipboard.writeText(window.location.href); showSuccess("Lien copié !"); }} className="p-3 bg-violet-600 rounded-full text-white"><Share2 size={20} /></button></div>
      </div>

      <main className="max-w-4xl mx-auto px-6 -mt-32 relative z-10">
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-[2.5rem] p-8 shadow-2xl mb-8">
          <div className="flex justify-between items-start gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-violet-500 font-bold uppercase tracking-widest text-xs">{tournament.game}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${tournament.type === 'Online' ? 'bg-cyan-500/10 text-cyan-500' : 'bg-orange-500/10 text-orange-500'}`}>
                  {tournament.type === 'Online' ? 'En ligne' : 'Présentiel'}
                </span>
              </div>
              <h1 className="text-3xl font-black">{tournament.title}</h1>
            </div>
            <div className="bg-violet-600 px-6 py-3 rounded-2xl text-center text-white">
              <p className="text-xs text-violet-200 uppercase font-bold">Cash Prize</p>
              <p className="text-2xl font-black">{tournament.prize_pool}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-muted/50 p-4 rounded-2xl border border-border text-center">
              <Calendar className="text-violet-500 mx-auto mb-2" size={20} />
              <p className="text-muted-foreground text-xs">Date</p>
              <p className="font-bold text-sm">{new Date(tournament.start_date || Date.now()).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-2xl border border-border text-center">
              <Users className="text-violet-500 mx-auto mb-2" size={20} />
              <p className="text-muted-foreground text-xs">Participants</p>
              <p className="font-bold text-sm">{participantCount} / {maxParticipants}</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-2xl border border-border text-center">
              {tournament.type === 'Online' ? <Globe className="text-violet-500 mx-auto mb-2" size={20} /> : <MapPin className="text-violet-500 mx-auto mb-2" size={20} />}
              <p className="text-muted-foreground text-xs">Lieu</p>
              <p className="font-bold text-sm">{tournament.type}</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-2xl border border-border text-center">
              <Shield className="text-violet-500 mx-auto mb-2" size={20} />
              <p className="text-muted-foreground text-xs">Anti-Cheat</p>
              <p className="font-bold text-sm">Activé</p>
            </div>
          </div>

          <div className="mb-8 space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>Remplissage</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-muted" />
          </div>

          {userRegistration ? (
            <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-3xl mb-8">
              <div className="flex items-center gap-3 mb-4 text-green-500">
                <CheckCircle2 size={24} />
                <h3 className="font-bold text-lg">Vous êtes inscrit !</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-background/50 rounded-2xl border border-border">
                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-2">Code d'accès / Lien du groupe</p>
                  <p className="text-foreground font-mono font-bold break-all">
                    {tournament.access_code || "Le code sera disponible peu avant le début."}
                  </p>
                </div>
                {tournament.access_code?.startsWith('http') && (
                  <Button onClick={() => window.open(tournament.access_code, '_blank')} className="w-full bg-green-600 hover:bg-green-700 font-bold text-white">
                    Rejoindre le groupe WhatsApp
                  </Button>
                )}
              </div>
            </div>
          ) : (
            isLoggedIn ? (
              <Button 
                onClick={() => !isFull && setShowPayment(true)} 
                disabled={isFull}
                className={`w-full py-6 rounded-2xl font-black text-lg shadow-xl transition-all ${isFull ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-violet-600 text-white shadow-violet-500/20 hover:bg-violet-700'}`}
              >
                {isFull ? "Tournoi Complet" : `S'inscrire pour ${tournament.entry_fee} FCFA`}
              </Button>
            ) : (
              <Button onClick={() => navigate('/auth')} className="w-full py-6 rounded-2xl bg-muted font-black gap-3 text-foreground">
                <Lock size={20} /> Se connecter pour s'inscrire
              </Button>
            )
          )}

          {tournament.rules && (
            <div className="mt-8 p-6 bg-background/50 rounded-3xl border border-border">
              <div className="flex items-center gap-2 mb-4 text-violet-400">
                <Info size={18} />
                <h3 className="font-bold uppercase tracking-widest text-xs">Règlement & Infos</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {tournament.rules}
              </p>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showPayment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPayment(false)} className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-card border border-border w-full max-w-[340px] rounded-[2rem] p-6">
              <button onClick={() => setShowPayment(false)} className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all z-50"><X size={20} /></button>
              {paymentStep === 'select' ? (
                <div className="space-y-5">
                  <div className="text-center">
                    <h2 className="text-lg font-bold mb-1">Paiement Local</h2>
                    <p className="text-muted-foreground text-xs">Payez via Mobile Money au Bénin</p>
                  </div>
                  <button onClick={handleFedaPay} className="w-full flex items-center justify-between p-4 bg-muted hover:bg-muted/80 rounded-xl border border-border transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500"><Smartphone size={20} /></div>
                      <div className="text-left">
                        <p className="font-bold text-sm">FedaPay (MTN / Moov)</p>
                        <p className="text-[10px] text-muted-foreground">Paiement sécurisé 229</p>
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