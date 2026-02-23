"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { Calendar, Users, Trophy, Shield, Smartphone, ArrowLeft, Lock, X, Share2, Globe, MapPin, Info, CheckCircle2, History, Copy, ChevronRight, Clock } from 'lucide-react';
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
      const { data, error } = await supabase.from('tournaments').select('*').eq('id', id).single();
      if (!error && data) setTournament(data);
      setLoading(false);
    };

    const fetchParticipants = async () => {
      const { count } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('tournament_id', id).eq('status', 'Réussi');
      setParticipantCount(count || 0);
    };

    const checkUserRegistration = async (userId: string) => {
      const { data } = await supabase.from('payments').select('*').eq('tournament_id', id).eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (data) {
        const diffMinutes = (new Date().getTime() - new Date(data.created_at).getTime()) / (1000 * 60);
        // On ne considère l'inscription valide que si elle est réussie ou en attente depuis moins de 5 minutes
        if (data.status === 'Réussi' || (data.status === 'En attente' && diffMinutes < 5)) {
          setUserRegistration(data);
        }
      }
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Veuillez vous connecter");

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { tournament_id: id, tournament_name: tournament.title, amount: tournament.entry_fee },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      showError(err.message || "Erreur de redirection.");
      setPaymentStep('select');
      setShowPayment(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!tournament) return null;

  const maxParticipants = tournament.max_participants || 40;
  const isFull = participantCount >= maxParticipants;
  const progress = (participantCount / maxParticipants) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <SEO title={tournament.title} description={tournament.game} image={tournament.image_url} />
      <Navbar />
      
      <div className="relative h-[35vh] w-full">
        <img src={tournament.image_url} className="w-full h-full object-cover opacity-50" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute top-6 left-6 z-20">
          <button onClick={() => navigate(-1)} className="p-3 bg-card/80 backdrop-blur-md rounded-full border border-border"><ArrowLeft size={20} /></button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 -mt-24 relative z-10">
        <div className="bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-2xl mb-8">
          <div className="flex justify-between items-start gap-4 mb-6">
            <div>
              <p className="text-violet-500 font-bold uppercase tracking-widest text-[10px] mb-1">{tournament.game}</p>
              <h1 className="text-2xl md:text-3xl font-black">{tournament.title}</h1>
            </div>
            <div className="bg-violet-600 px-4 py-2 rounded-xl text-center text-white">
              <p className="text-[10px] uppercase font-bold">Cash Prize</p>
              <p className="text-xl font-black">{tournament.prize_pool}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-muted/50 p-3 rounded-2xl border border-border text-center">
              <Calendar className="text-violet-500 mx-auto mb-1" size={18} />
              <p className="font-bold text-xs">{new Date(tournament.start_date || Date.now()).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-2xl border border-border text-center">
              <Users className="text-violet-500 mx-auto mb-1" size={18} />
              <p className="font-bold text-xs">{participantCount} / {maxParticipants}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-2xl border border-border text-center">
              {tournament.type === 'Online' ? <Globe className="text-violet-500 mx-auto mb-1" size={18} /> : <MapPin className="text-violet-500 mx-auto mb-1" size={18} />}
              <p className="font-bold text-xs">{tournament.type === 'Online' ? 'En ligne' : 'Présentiel'}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-2xl border border-border text-center">
              <Shield className="text-violet-500 mx-auto mb-1" size={18} />
              <p className="font-bold text-xs">Anti-Cheat</p>
            </div>
          </div>

          <div className="mb-6 space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>Remplissage</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-muted" />
          </div>

          {userRegistration ? (
            <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-3xl mb-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4 text-green-500">
                {userRegistration.status === 'Réussi' ? <CheckCircle2 size={24} /> : <Clock size={24} className="animate-pulse" />}
                <h3 className="font-black text-lg">{userRegistration.status === 'Réussi' ? "Inscrit !" : "Paiement en cours..."}</h3>
              </div>
              {userRegistration.status === 'Réussi' && (
                <div className="p-4 bg-background/50 rounded-2xl border border-border mb-4">
                  <p className="text-muted-foreground text-[10px] font-bold uppercase mb-2">Code de Validation</p>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-foreground font-mono font-bold text-2xl">{userRegistration.validation_code}</span>
                    <button onClick={() => { navigator.clipboard.writeText(userRegistration.validation_code); showSuccess("Copié !"); }} className="text-muted-foreground"><Copy size={20} /></button>
                  </div>
                </div>
              )}
              <Link to="/payments"><Button className="w-full bg-green-600 font-bold text-white py-6 rounded-2xl">Voir mes inscriptions</Button></Link>
            </div>
          ) : (
            isLoggedIn ? (
              <Button onClick={() => !isFull && setShowPayment(true)} disabled={isFull} className="w-full py-8 rounded-2xl font-black text-lg bg-violet-600 text-white shadow-xl shadow-violet-500/20">
                {isFull ? "Complet" : `S'inscrire (${tournament.entry_fee} FCFA)`}
              </Button>
            ) : (
              <Button onClick={() => navigate('/auth')} className="w-full py-8 rounded-2xl bg-muted font-black text-foreground"><Lock size={18} className="mr-2" /> Se connecter</Button>
            )
          )}
        </div>
      </main>

      {showPayment && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPayment(false)} />
          <div className="relative bg-card border border-border w-full max-w-[400px] rounded-[2.5rem] p-8 shadow-2xl z-[10000]">
            <button onClick={() => setShowPayment(false)} className="absolute top-6 right-6 p-2 text-muted-foreground bg-muted rounded-full"><X size={20} /></button>
            {paymentStep === 'select' ? (
              <div className="space-y-8 text-center">
                <div className="w-20 h-20 bg-violet-600/10 rounded-3xl flex items-center justify-center text-violet-500 mx-auto"><Smartphone size={40} /></div>
                <h2 className="text-2xl font-black">Paiement Mobile</h2>
                <button onClick={handleFedaPay} className="w-full flex items-center justify-between p-6 bg-muted rounded-2xl border border-border hover:border-violet-500/50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white"><Smartphone size={24} /></div>
                    <div className="text-left"><p className="font-bold">MTN / Moov Money</p><p className="text-[10px] text-muted-foreground font-bold uppercase">Instantanné</p></div>
                  </div>
                  <ChevronRight size={20} className="text-muted-foreground group-hover:text-violet-500" />
                </button>
              </div>
            ) : (
              <div className="py-16 text-center space-y-6">
                <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <h2 className="text-2xl font-black">Redirection...</h2>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentDetails;