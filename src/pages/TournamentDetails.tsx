"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { Calendar, Users, Trophy, Shield, Smartphone, ArrowLeft, Lock, X, Share2, Globe, MapPin, Info, CheckCircle2, History, Copy, ChevronRight, Clock, CreditCard, Zap, User, AlertTriangle, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/lib/supabase';
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from 'framer-motion';

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing'>('select');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [participants, setParticipants] = useState<any[]>([]);
  const [userRegistration, setUserRegistration] = useState<any>(null);

  useEffect(() => {
    const fetchTournament = async () => {
      const { data, error } = await supabase.from('tournaments').select('*').eq('id', id).single();
      if (!error && data) setTournament(data);
      setLoading(false);
    };

    const fetchParticipants = async () => {
      const { data, count } = await supabase
        .from('payments')
        .select('*, profiles(username, avatar_url)', { count: 'exact' })
        .eq('tournament_id', id)
        .eq('status', 'Réussi')
        .limit(12);
      
      setParticipantCount(count || 0);
      if (data) setParticipants(data.map(p => p.profiles));
    };

    const checkUserRegistration = async (userId: string) => {
      const { data } = await supabase.from('payments').select('*').eq('tournament_id', id).eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (data) {
        const diffMinutes = (new Date().getTime() - new Date(data.created_at).getTime()) / (1000 * 60);
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

  const handleShare = async () => {
    const shareData = {
      title: tournament.title,
      text: `Rejoins-moi sur eGame Bénin pour le tournoi ${tournament.game} ! Cash prize: ${tournament.prize_pool}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showSuccess("Lien copié !");
      }
    } catch (err) {
      console.error("Erreur de partage", err);
    }
  };

  const handlePayment = async (provider: 'fedapay' | 'geniuspay') => {
    setPaymentStep('processing');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Veuillez vous connecter");

      const functionName = provider === 'fedapay' ? 'create-payment' : 'create-geniuspay-payment';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
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
      
      <div className="relative h-[35vh] w-full overflow-hidden">
        <img src={tournament.image_url} className="w-full h-full object-cover opacity-40 scale-105" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute top-6 left-6 z-20 flex gap-3">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-card/80 backdrop-blur-md rounded-full border border-border shadow-lg"><ArrowLeft size={18} /></button>
          <button onClick={handleShare} className="p-2.5 bg-card/80 backdrop-blur-md rounded-full border border-border text-violet-500 shadow-lg"><Share2 size={18} /></button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 -mt-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-2xl mb-6"
        >
          <div className="flex justify-between items-start gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap size={12} className="text-violet-500 fill-violet-500" />
                <p className="text-violet-500 font-black uppercase tracking-[0.2em] text-[9px]">{tournament.game}</p>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">{tournament.title}</h1>
            </div>
            <div className="bg-violet-600 px-4 py-2.5 rounded-2xl text-center text-white shadow-lg shadow-violet-500/20">
              <p className="text-[8px] uppercase font-black tracking-widest opacity-80">Cash Prize</p>
              <p className="text-lg font-black">{tournament.prize_pool}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="bg-muted/30 p-3.5 rounded-2xl border border-border/50 text-center">
              <Calendar className="text-violet-500 mx-auto mb-1.5" size={16} />
              <p className="font-bold text-[10px] uppercase tracking-wider">{new Date(tournament.start_date || Date.now()).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="bg-muted/30 p-3.5 rounded-2xl border border-border/50 text-center">
              <Users className="text-violet-500 mx-auto mb-1.5" size={16} />
              <p className="font-bold text-[10px] uppercase tracking-wider">{participantCount} / {maxParticipants}</p>
            </div>
            <div className="bg-muted/30 p-3.5 rounded-2xl border border-border/50 text-center">
              {tournament.type === 'Online' ? <Globe className="text-violet-500 mx-auto mb-1.5" size={16} /> : <MapPin className="text-violet-500 mx-auto mb-1.5" size={16} />}
              <p className="font-bold text-[10px] uppercase tracking-wider">{tournament.type === 'Online' ? 'En ligne' : 'Local'}</p>
            </div>
            <div className="bg-muted/30 p-3.5 rounded-2xl border border-border/50 text-center">
              <Shield className="text-violet-500 mx-auto mb-1.5" size={16} />
              <p className="font-bold text-[10px] uppercase tracking-wider">Anti-Cheat</p>
            </div>
          </div>

          <div className="mb-8 space-y-2.5">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">
              <span>Remplissage de l'arène</span>
              <span className="text-violet-500">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-muted" />
          </div>

          {userRegistration ? (
            <div className="bg-green-500/5 border border-green-500/20 p-6 rounded-[2rem] mb-2 text-center">
              <div className="flex items-center justify-center gap-3 mb-4 text-green-500">
                {userRegistration.status === 'Réussi' ? <CheckCircle2 size={20} /> : <Clock size={20} className="animate-pulse" />}
                <h3 className="font-black text-base">{userRegistration.status === 'Réussi' ? "Inscription Validée" : "Paiement en attente"}</h3>
              </div>
              {userRegistration.status === 'Réussi' && (
                <div className="p-4 bg-background/50 rounded-2xl border border-border mb-4">
                  <p className="text-muted-foreground text-[9px] font-black uppercase tracking-widest mb-2">Code de Validation</p>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-foreground font-mono font-black text-xl tracking-wider">{userRegistration.validation_code}</span>
                    <button onClick={() => { navigator.clipboard.writeText(userRegistration.validation_code); showSuccess("Copié !"); }} className="text-muted-foreground hover:text-violet-500 transition-colors"><Copy size={18} /></button>
                  </div>
                </div>
              )}
              <Link to="/payments"><Button className="w-full bg-green-600 hover:bg-green-700 font-bold text-white py-6 rounded-2xl shadow-lg shadow-green-500/10">Voir mes inscriptions</Button></Link>
            </div>
          ) : (
            isLoggedIn ? (
              <Button onClick={() => !isFull && setShowConfirmation(true)} disabled={isFull} className="w-full py-7 rounded-2xl font-black text-base bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-500/20 transition-all active:scale-[0.98]">
                {isFull ? "Tournoi Complet" : `S'inscrire • ${tournament.entry_fee} FCFA`}
              </Button>
            ) : (
              <Button onClick={() => navigate('/auth')} className="w-full py-7 rounded-2xl bg-muted font-black text-foreground hover:bg-muted/80 transition-all"><Lock size={16} className="mr-2" /> Se connecter pour jouer</Button>
            )
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Description Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm"
          >
            <h2 className="text-sm font-black mb-6 flex items-center gap-2.5 uppercase tracking-widest"><FileText className="text-violet-500" size={18} /> Déroulement</h2>
            <div className="text-muted-foreground text-[11px] leading-relaxed whitespace-pre-wrap font-medium max-h-[200px] overflow-y-auto no-scrollbar">
              {tournament.description || "Le déroulement détaillé sera communiqué prochainement."}
            </div>
          </motion.div>

          {/* Rules Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm"
          >
            <h2 className="text-sm font-black mb-6 flex items-center gap-2.5 uppercase tracking-widest"><Info className="text-violet-500" size={18} /> Règlement</h2>
            <div className="text-muted-foreground text-[11px] leading-relaxed whitespace-pre-wrap font-medium max-h-[200px] overflow-y-auto no-scrollbar">
              {tournament.rules || "Aucun règlement spécifique communiqué pour le moment."}
            </div>
          </motion.div>
        </div>

        {/* Participants Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm mt-6"
        >
          <h2 className="text-sm font-black mb-6 flex items-center gap-2.5 uppercase tracking-widest"><Users className="text-violet-500" size={18} /> Participants ({participantCount})</h2>
          <div className="flex flex-wrap gap-3">
            {participants.length > 0 ? (
              participants.map((p, i) => (
                <div key={i} className="group relative">
                  <div className="w-10 h-10 rounded-full border-2 border-border overflow-hidden bg-muted group-hover:border-violet-500 transition-colors">
                    <img src={p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[8px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    {p.username}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-muted-foreground font-bold italic">Soyez le premier à rejoindre l'arène !</p>
            )}
            {participantCount > 12 && (
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center text-[10px] font-black text-muted-foreground">
                +{participantCount - 12}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <AnimatePresence>
        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirmation(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-card border border-border w-full max-w-[400px] rounded-[2.5rem] p-8 shadow-2xl z-[10000] text-center">
              <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mx-auto mb-6"><AlertTriangle size={32} /></div>
              <h2 className="text-xl font-black mb-4">Attention Champion !</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                Veuillez lire attentivement la <span className="text-foreground font-bold">description</span> et le <span className="text-foreground font-bold">règlement</span> du tournoi avant de procéder au paiement.
              </p>
              <div className="space-y-3">
                <Button onClick={() => { setShowConfirmation(false); setShowPayment(true); }} className="w-full py-6 rounded-2xl bg-violet-600 hover:bg-violet-700 font-black text-white">J'ai lu, je continue</Button>
                <Button variant="ghost" onClick={() => setShowConfirmation(false)} className="w-full py-6 rounded-2xl font-bold text-muted-foreground">Retourner lire</Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Payment Modal */}
        {showPayment && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPayment(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-card border border-border w-full max-w-[380px] rounded-[2.5rem] p-8 shadow-2xl z-[10000]">
              <button onClick={() => setShowPayment(false)} className="absolute top-6 right-6 p-2 text-muted-foreground bg-muted rounded-full hover:text-foreground transition-colors"><X size={18} /></button>
              {paymentStep === 'select' ? (
                <div className="space-y-6 text-center">
                  <div className="w-16 h-16 bg-violet-600/10 rounded-2xl flex items-center justify-center text-violet-500 mx-auto"><Smartphone size={32} /></div>
                  <div>
                    <h2 className="text-xl font-black mb-1">Mode de Paiement</h2>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Sécurisé par nos partenaires</p>
                  </div>
                  
                  <div className="space-y-3">
                    <button onClick={() => handlePayment('fedapay')} className="w-full flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-border hover:border-violet-500/50 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors"><Smartphone size={18} /></div>
                        <div className="text-left"><p className="font-bold text-xs">FedaPay (Bénin)</p><p className="text-[8px] text-muted-foreground font-black uppercase tracking-tighter">MTN / Moov Money</p></div>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-violet-500 transition-colors" />
                    </button>

                    <button onClick={() => handlePayment('geniuspay')} className="w-full flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-border hover:border-violet-500/50 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors"><CreditCard size={18} /></div>
                        <div className="text-left"><p className="font-bold text-xs">GeniusPay (RCI)</p><p className="text-[8px] text-muted-foreground font-black uppercase tracking-tighter">Orange / MTN / Moov</p></div>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-violet-500 transition-colors" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-6">
                  <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div>
                    <h2 className="text-xl font-black mb-1">Redirection...</h2>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Vers la plateforme de paiement</p>
                  </div>
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