"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import PlayerBadge from '@/components/PlayerBadge';
import { Calendar, Users, Trophy, Shield, Smartphone, ArrowLeft, Lock, X, Share2, Globe, MapPin, Info, CheckCircle2, History, Copy, ChevronRight, Clock, CreditCard, Zap, User, AlertTriangle, FileText, Gift, Star } from 'lucide-react';
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
  const [userProfile, setUserProfile] = useState<any>(null);

  const fetchParticipants = useCallback(async () => {
    try {
      const { count } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('tournament_id', id).eq('status', 'Réussi');
      setParticipantCount(count || 0);
      
      const { data } = await supabase.from('payments').select('user_id, profiles(username, avatar_url, mvp_count, champion_count)').eq('tournament_id', id).eq('status', 'Réussi').limit(12);
      if (data) {
        const list = await Promise.all(data.map(async (p: any) => {
          const { count: tCount } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('user_id', p.user_id).eq('status', 'Réussi');
          return {
            username: p.profiles?.username || "Joueur",
            avatar_url: p.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user_id}`,
            tournamentCount: tCount || 0,
            mvpCount: p.profiles?.mvp_count || 0,
            championCount: p.profiles?.champion_count || 0
          };
        }));
        setParticipants(list);
      }
    } catch (err) { console.error(err); }
  }, [id]);

  useEffect(() => {
    const fetchTournament = async () => {
      const { data } = await supabase.from('tournaments').select('*').eq('id', id).single();
      if (data) setTournament(data);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        supabase.from('payments').select('*').eq('tournament_id', id).eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(1).maybeSingle().then(({ data }) => {
          if (data) setUserRegistration(data);
        });
        supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => {
          if (data) setUserProfile(data);
        });
      }
    });

    fetchTournament();
    fetchParticipants();
  }, [id, fetchParticipants]);

  const handleShare = async () => {
    try { await navigator.share({ title: tournament.title, url: window.location.href }); } catch { navigator.clipboard.writeText(window.location.href); showSuccess("Lien copié !"); }
  };

  const handleKKiaPay = async () => {
    setPaymentStep('processing');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // @ts-ignore
      openKkiapayWidget({
        amount: tournament.entry_fee,
        api_key: import.meta.env.VITE_KKIAPAY_PUBLIC_KEY,
        sandbox: false,
        email: user?.email,
        phone: userProfile?.phone || "",
        name: userProfile?.username || "Joueur",
        callback: `${window.location.origin}/payment-success?tournamentId=${id}&tournamentName=${encodeURIComponent(tournament.title)}&amount=${tournament.entry_fee}`
      });
      setShowPayment(false);
    } catch (err: any) { showError(err.message); }
    setPaymentStep('select');
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!tournament) return null;

  const isFinished = tournament.status === 'finished';
  const progress = (participantCount / (tournament.max_participants || 40)) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <SEO title={tournament.title} />
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-2xl mb-6">
          <div className="flex justify-between items-start gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1"><Zap size={12} className="text-violet-500 fill-violet-500" /><p className="text-violet-500 font-black uppercase tracking-[0.2em] text-[9px]">{tournament.game}</p></div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">{tournament.title}</h1>
            </div>
            <div className="bg-violet-600 px-4 py-2.5 rounded-2xl text-center text-white shadow-lg shadow-violet-500/20">
              <p className="text-[8px] uppercase font-black tracking-widest opacity-80">Cash Prize</p>
              <p className="text-lg font-black">{tournament.prize_pool}</p>
            </div>
          </div>

          {isFinished ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-[2rem] text-center">
                <Trophy className="text-yellow-500 mx-auto mb-3" size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600 mb-1">Vainqueur</p>
                <h3 className="text-xl font-black">{tournament.winner_name}</h3>
              </div>
              {tournament.lucky_winner_name && (
                <div className="bg-cyan-500/10 border border-cyan-500/20 p-6 rounded-[2rem] text-center">
                  <Gift className="text-cyan-500 mx-auto mb-3" size={32} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-600 mb-1">Tirage au sort</p>
                  <h3 className="text-xl font-black">{tournament.lucky_winner_name}</h3>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <div className="bg-muted/30 p-3.5 rounded-2xl border border-border/50 text-center"><Calendar className="text-violet-500 mx-auto mb-1.5" size={16} /><p className="font-bold text-[10px] uppercase tracking-wider">{new Date(tournament.start_date).toLocaleDateString('fr-FR')}</p></div>
                <div className="bg-muted/30 p-3.5 rounded-2xl border border-border/50 text-center"><Users className="text-violet-500 mx-auto mb-1.5" size={16} /><p className="font-bold text-[10px] uppercase tracking-wider">{participantCount} / {tournament.max_participants}</p></div>
                <div className="bg-muted/30 p-3.5 rounded-2xl border border-border/50 text-center"><Globe className="text-violet-500 mx-auto mb-1.5" size={16} /><p className="font-bold text-[10px] uppercase tracking-wider">{tournament.type}</p></div>
                <div className="bg-muted/30 p-3.5 rounded-2xl border border-border/50 text-center"><Shield className="text-violet-500 mx-auto mb-1.5" size={16} /><p className="font-bold text-[10px] uppercase tracking-wider">Anti-Cheat</p></div>
              </div>
              <div className="mb-8 space-y-2.5"><div className="flex justify-between text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground"><span>Remplissage</span><span className="text-violet-500">{Math.round(progress)}%</span></div><Progress value={progress} className="h-1.5 bg-muted" /></div>
              {userRegistration ? (
                <div className="bg-green-500/5 border border-green-500/20 p-6 rounded-[2rem] text-center">
                  <div className="flex items-center justify-center gap-3 mb-4 text-green-500">{userRegistration.status === 'Réussi' ? <CheckCircle2 size={20} /> : <Clock size={20} className="animate-pulse" />}<h3 className="font-black text-base">Inscription Validée</h3></div>
                  <Link to="/payments"><Button className="w-full bg-green-600 hover:bg-green-700 font-bold text-white py-6 rounded-2xl">Voir mes inscriptions</Button></Link>
                </div>
              ) : (
                <Button onClick={() => setShowConfirmation(true)} className="w-full py-7 rounded-2xl font-black text-base bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-500/20">S'inscrire • {tournament.entry_fee} FCFA</Button>
              )}
            </>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm"><h2 className="text-sm font-black mb-6 flex items-center gap-2.5 uppercase tracking-widest"><FileText className="text-violet-500" size={18} /> Déroulement</h2><div className="text-muted-foreground text-[11px] leading-relaxed whitespace-pre-wrap font-medium">{tournament.description}</div></div>
          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm"><h2 className="text-sm font-black mb-6 flex items-center gap-2.5 uppercase tracking-widest"><Info className="text-violet-500" size={18} /> Règlement</h2><div className="text-muted-foreground text-[11px] leading-relaxed whitespace-pre-wrap font-medium">{tournament.rules}</div></div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
          <h2 className="text-sm font-black mb-6 flex items-center gap-2.5 uppercase tracking-widest"><Users className="text-violet-500" size={18} /> Participants ({participantCount})</h2>
          <div className="flex flex-wrap gap-3">
            {participants.map((p, i) => (
              <div key={i} className="group relative">
                <div className="w-10 h-10 rounded-full border-2 border-border overflow-hidden bg-muted group-hover:border-violet-500 transition-colors"><img src={p.avatar_url} alt="" className="w-full h-full object-cover" /></div>
                <div className="absolute -top-2 -right-2 z-10"><PlayerBadge tournamentCount={p.tournamentCount} mvpCount={p.mvpCount} championCount={p.championCount} size="sm" /></div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[8px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">{p.username}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      <AnimatePresence>
        {showConfirmation && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirmation(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-card border border-border w-full max-w-[400px] rounded-[2.5rem] p-8 shadow-2xl z-[10000] text-center">
              <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mx-auto mb-6"><AlertTriangle size={32} /></div>
              <h2 className="text-xl font-black mb-4">Attention Champion !</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">Veuillez lire attentivement la <span className="text-foreground font-bold">description</span> et le <span className="text-foreground font-bold">règlement</span> avant de payer.</p>
              <div className="space-y-3"><Button onClick={() => { setShowConfirmation(false); setShowPayment(true); }} className="w-full py-6 rounded-2xl bg-violet-600 hover:bg-violet-700 font-black text-white">J'ai lu, je continue</Button><Button variant="ghost" onClick={() => setShowConfirmation(false)} className="w-full py-6 rounded-2xl font-bold text-muted-foreground">Retourner lire</Button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TournamentDetails;