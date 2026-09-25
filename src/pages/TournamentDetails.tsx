"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import PlayerBadge from '@/components/PlayerBadge';
import { Calendar, Users, Trophy, Shield, ArrowLeft, Clock, CheckCircle2, Info, ChevronRight, CreditCard, Zap, AlertTriangle, FileText, Loader2, X, Globe, Share2, Ticket, Copy, FlaskConical } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { formatBeninDateTime } from '@/utils/datetime';

// Numéro de l'IA eGame sur WhatsApp qui confirme les tickets des tournois.
const WHATSAPP_AI_NUMBER = "2290141790790";

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [participants, setParticipants] = useState<any[]>([]);
  const [userRegistration, setUserRegistration] = useState<any>(null);
  const [userTicket, setUserTicket] = useState<any>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const fetchParticipants = useCallback(async () => {
    try {
      // Vue publique sécurisée : accessible à tous, sans données sensibles.
      // Compteur unifié : paiements réussis + tickets attribués (y compris manuels), sans doublons.
      let participantCount = 0;
      const { data: participantStats } = await supabase.from('public_participant_counts').select('participant_count').eq('tournament_id', id).maybeSingle();
      if (participantStats) participantCount = participantStats.participant_count || 0;

      setParticipantCount(participantCount);

      const { data } = await supabase.from('public_payments').select('user_id, profiles(username, avatar_url, mvp_count, champion_count)').eq('tournament_id', id).eq('status', 'Réussi').limit(16);
      if (data) {
        // Un seul requête agrégée pour compter les tournois de chaque participant.
        const userIds = [...new Set(data.map((p: any) => p.user_id))];
        const countsByUser: Record<string, number> = {};
        if (userIds.length > 0) {
          const { data: userPayments } = await supabase.from('public_payments').select('user_id').eq('status', 'Réussi').in('user_id', userIds);
          userPayments?.forEach((row: any) => {
            countsByUser[row.user_id] = (countsByUser[row.user_id] || 0) + 1;
          });
        }

        const list = data.map((p: any) => ({
          username: p.profiles?.username || "Joueur",
          avatar_url: p.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user_id}`,
          tournamentCount: countsByUser[p.user_id] || 0,
          mvpCount: p.profiles?.mvp_count || 0,
          championCount: p.profiles?.champion_count || 0
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
      setCurrentUser(session?.user ?? null);
      if (session?.user) {
        supabase.from('payments').select('*').eq('tournament_id', id).eq('user_id', session.user.id).eq('status', 'Réussi').order('created_at', { ascending: false }).limit(1).maybeSingle().then(({ data }) => {
          if (data) setUserRegistration(data);
        });
        supabase.from('tickets').select('*').eq('tournament_id', id).eq('user_id', session.user.id).maybeSingle().then(({ data }) => {
          if (data) setUserTicket(data);
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

  const checkAvailability = async () => {
    const [{ data: latest, error: tournamentError }, { data: stats, error: countError }] = await Promise.all([
      supabase.from('tournaments').select('max_participants').eq('id', id).single(),
      supabase.from('public_participant_counts').select('participant_count').eq('tournament_id', id).maybeSingle()
    ]);
    if (tournamentError || countError) {
      showError("Impossible de vérifier les places disponibles. Réessaie dans un instant.");
      return false;
    }
    const count = stats?.participant_count ?? 0;
    setParticipantCount(count);
    setTournament((previous: any) => ({ ...previous, max_participants: latest.max_participants }));
    if (count >= (latest.max_participants ?? 40)) {
      setShowConfirmation(false);
      setShowPaymentMethods(false);
      showError("Tournoi complet : toutes les places sont prises.");
      return false;
    }
    return true;
  };

  const createPendingPayment = async (gateway: 'fedapay' | 'kkiapay') => {
    const { data, error } = await supabase.rpc('begin_tournament_payment', {
      p_tournament_id: id,
      p_gateway: gateway
    });
    if (error) throw error;
    return data;
  };

  const handleFedaPay = async () => {
    setShowPaymentMethods(false);
    setIsPaying(true);
    try {
      if (!await checkAvailability()) return;
      const attempt = await createPendingPayment('fedapay');
      const redirectUrl = `${window.location.origin}/payment-success?gateway=fedapay&tournamentId=${id}&tournamentName=${encodeURIComponent(tournament.title)}&amount=${tournament.entry_fee}&paymentAttemptId=${attempt.id}`;
      sessionStorage.setItem(`payment_gateway:${id}`, 'fedapay');

      // @ts-ignore
      FedaPay.init({
        public_key: 'pk_live_u7rqiI-D3oGsFCrTHNFi9Xxh',
        transaction: {
          amount: tournament.entry_fee,
          description: `Inscription: ${tournament.title}`,
          callback_url: redirectUrl,
          metadata: { tournamentId: id, tournamentName: tournament.title, userId: currentUser.id, paymentAttemptId: attempt.id },
          custom_metadata: { tournamentId: id, tournamentName: tournament.title, userId: currentUser.id, paymentAttemptId: attempt.id }
        },
        customer: {
          firstname: userProfile?.full_name || userProfile?.username || "Joueur",
          email: currentUser?.email,
          phone_number: {
            number: userProfile?.phone || "",
            country: (userProfile?.country || 'BJ').toLowerCase()
          }
        }
      }).open();
    } catch (err: any) {
      showError(err.message || "Erreur lors du lancement de FedaPay.");
    } finally {
      setIsPaying(false);
    }
  };

  const handleKKiaPay = async () => {
    setShowPaymentMethods(false);
    setIsPaying(true);
    try {
      if (!await checkAvailability()) return;
      const { data: config, error: configError } = await supabase.functions.invoke('verify-kkiapay', { body: { action: 'configuration' } });
      if (configError || !config?.publicKey) throw new Error("Paiement temporairement indisponible : configuration KKiaPay à vérifier par le support.");
      // @ts-ignore
      if (typeof openKkiapayWidget !== 'function') throw new Error("Le module de paiement n'est pas chargé. Actualise la page.");
      const attempt = await createPendingPayment('kkiapay');
      const callbackUrl = `${window.location.origin}/payment-success?gateway=kkiapay&tournamentId=${encodeURIComponent(id!)}&tournamentName=${encodeURIComponent(tournament.title)}&paymentAttemptId=${attempt.id}`;
      sessionStorage.setItem(`payment_gateway:${id}`, 'kkiapay');
      // @ts-ignore
      openKkiapayWidget({
        amount: Number(attempt.amount),
        api_key: config.publicKey,
        sandbox: false,
        data: JSON.stringify({ paymentAttemptId: attempt.id }),
        email: currentUser?.email,
        phone: userProfile?.phone || "",
        name: userProfile?.username || "Joueur",
        callback: callbackUrl
      });
    } catch (err: any) {
      showError(err.message || "Erreur lors du lancement de KKiaPay.");
    } finally {
      setIsPaying(false);
    }
  };

  const handleStartRegistration = async () => {
    setIsPaying(true);
    try {
      if (!await checkAvailability()) return;
      if (!isLoggedIn) {
        navigate('/auth');
        return;
      }
      setShowConfirmation(true);
    } finally {
      setIsPaying(false);
    }
  };

  // Inscription gratuite : attribution d'un ticket pré-généré à envoyer à l'IA eGame sur WhatsApp.
  const handleFreeRegistration = async () => {
    setShowConfirmation(false);
    setIsPaying(true);
    try {
      if (!await checkAvailability()) return;
      const { data, error } = await supabase.rpc('claim_tournament_ticket', { p_tournament_id: id });

      if (error) {
        showError(error.message || "Erreur lors de l'attribution du ticket.");
        return;
      }
      setUserTicket(data);
      setShowTicketModal(true);
      fetchParticipants();
    } catch {
      showError("Erreur lors de la création du ticket.");
    } finally {
      setIsPaying(false);
    }
  };

  const whatsappTicketLink = userTicket
    ? `https://wa.me/${WHATSAPP_AI_NUMBER}?text=${encodeURIComponent(`eGame Bénin — Ticket ${tournament?.title}\nMon code : ${userTicket.code}`)}`
    : '#';

  if (loading) return <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#8A2BE2] border-t-transparent rounded-full animate-spin" /></div>;
  if (!tournament) return null;

  const isFinished = tournament.status === 'finished';
  const isFree = Number(tournament.entry_fee) === 0;
  // Passerelle imposée à la création du tournoi : seul ce moyen de paiement est proposé.
  const paymentGateway = (tournament.payment_gateway || '').toLowerCase();
  const maxSlots = tournament.max_participants || 40;
  const progress = Math.min(100, (participantCount / maxSlots) * 100);
  const isRegistrationClosed = tournament.registration_end_date && new Date() > new Date(tournament.registration_end_date);
  const registrationStart = tournament.registration_start_date ? new Date(tournament.registration_start_date) : null;
  const isRegistrationNotOpen = registrationStart ? new Date() < registrationStart : false;

  // Toutes les heures sont affichées en heure du tournoi (GMT+1).
  const formattedDateTime = formatBeninDateTime(tournament.start_date) + " (heure du tournoi, GMT+1)";
  const formattedStartRegistration = registrationStart ? formatBeninDateTime(tournament.registration_start_date) : null;
  const formattedEndRegistration = tournament.registration_end_date ? formatBeninDateTime(tournament.registration_end_date) : null;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-32 pt-20">
      <SEO title={tournament.title} />
      <Navbar />
      
      {/* Header Banner */}
      <div className="relative h-[40vh] w-full overflow-hidden">
        <img src={tournament.image_url || '/coc-tournament.webp'} className="w-full h-full object-cover opacity-35" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/50 to-transparent" />
        <div className="absolute top-6 left-6 z-20 flex gap-3">
          <button onClick={() => navigate(-1)} className="p-3 bg-[#0F0F1E]/80 backdrop-blur-md rounded-full border border-[#8A2BE2]/40 text-white hover:bg-[#8A2BE2] transition-colors"><ArrowLeft size={18} /></button>
          <button onClick={handleShare} className="p-3 bg-[#0F0F1E]/80 backdrop-blur-md rounded-full border border-[#8A2BE2]/40 text-[#A855F7] hover:bg-[#8A2BE2] hover:text-white transition-colors"><Share2 size={18} /></button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 -mt-24 relative z-10 space-y-8">
        {/* Bandeau tournoi d'essai : visible uniquement par l'administration */}
        {tournament.is_test && (
          <div className="bg-amber-500/10 border border-amber-500/40 rounded-3xl p-4 flex items-center gap-3">
            <FlaskConical className="text-amber-400 shrink-0" size={22} />
            <p className="text-xs font-bold text-amber-300 leading-relaxed">
              Tournoi d'essai — visible uniquement par l'administration. Il n'est pas comptabilisé sur le site et sera supprimé définitivement (paiements et tickets inclus) à sa clôture.
            </p>
          </div>
        )}
        {/* Card Principale du Tournoi */}
        <div className="bg-[#0F0F1E] border border-[#8A2BE2]/30 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-[#8A2BE2]/20">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-[#FFD700]" />
                <p className="text-[#A855F7] font-gaming font-extrabold uppercase tracking-[0.2em] text-xs">{tournament.game}</p>
              </div>
              <h1 className="text-2xl md:text-4xl font-gaming font-black text-white">{tournament.title}</h1>
            </div>

            {/* Cash Prize Géant en Or */}
            <div className="bg-[#0A0A0F] border-2 border-[#FFD700]/50 px-6 py-4 rounded-2xl text-center shadow-xl shadow-[#FFD700]/10">
              <p className="text-[10px] font-gaming font-bold text-[#8888AA] uppercase tracking-widest">Cash Prize</p>
              <p className="text-2xl md:text-3xl font-gaming font-black text-[#FFD700] text-glow-gold">{tournament.prize_pool || "À annoncer"}</p>
            </div>
          </div>

          {isFinished ? (
            <div className="bg-[#FFD700]/10 border border-[#FFD700]/40 p-6 rounded-2xl text-center space-y-2">
              <Trophy className="text-[#FFD700] mx-auto" size={36} />
              <p className="text-[10px] font-gaming font-bold uppercase tracking-widest text-[#FFD700]">Champion Officiel</p>
              <h3 className="text-xl font-gaming font-black text-white">{tournament.winner_name}</h3>
            </div>
          ) : (
            <>
              {/* Caractéristiques */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#0A0A0F] p-4 rounded-2xl border border-[#8A2BE2]/20 text-center space-y-1">
                  <Calendar className="text-[#8A2BE2] mx-auto" size={18} />
                  <p className="font-gaming font-bold text-[10px] uppercase text-white tracking-wider">{formattedDateTime}</p>
                </div>
                <div className="bg-[#0A0A0F] p-4 rounded-2xl border border-[#8A2BE2]/20 text-center space-y-1">
                  <Users className="text-[#8A2BE2] mx-auto" size={18} />
                  <p className="font-gaming font-bold text-[10px] uppercase text-white tracking-wider">{participantCount} / {maxSlots} Joueurs</p>
                </div>
                <div className="bg-[#0A0A0F] p-4 rounded-2xl border border-[#8A2BE2]/20 text-center space-y-1">
                  <Globe className="text-[#8A2BE2] mx-auto" size={18} />
                  <p className="font-gaming font-bold text-[10px] uppercase text-white tracking-wider">{tournament.type}</p>
                </div>
                <div className="bg-[#0A0A0F] p-4 rounded-2xl border border-[#8A2BE2]/20 text-center space-y-1">
                  <Shield className="text-[#8A2BE2] mx-auto" size={18} />
                  <p className="font-gaming font-bold text-[10px] uppercase text-white tracking-wider">Anti-Cheat</p>
                </div>
              </div>
              
              {/* Barre de progression des places */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-gaming font-bold uppercase tracking-widest text-[#8888AA]">
                  <span>Remplissage du tournoi</span>
                  <span className="text-[#A855F7]">{participantCount} / {maxSlots} ({Math.round(progress)}%)</span>
                </div>
                <div className="w-full bg-[#0A0A0F] h-3 rounded-full overflow-hidden p-0.5 border border-[#8A2BE2]/30">
                  <div className="bg-gradient-to-r from-[#8A2BE2] to-[#A855F7] h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
              
              {/* Action d'inscription : le ticket WhatsApp reste prioritaire après un paiement réussi. */}
              {userRegistration && !userTicket ? (
                <div className="bg-emerald-950/40 border border-emerald-500/40 p-6 rounded-2xl text-center space-y-4">
                  <div className="flex items-center justify-center gap-3 text-emerald-400">
                    <CheckCircle2 size={24} />
                    <h3 className="font-gaming font-bold text-base uppercase">Inscription Validée !</h3>
                  </div>
                  <Link to="/payments">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 font-gaming font-bold text-white py-6 rounded-xl text-xs uppercase tracking-wider">
                      Voir mon ticket & code sur le profil
                    </Button>
                  </Link>
                </div>
              ) : userTicket ? (
                <div className="bg-emerald-950/40 border border-emerald-500/40 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-center gap-3 text-emerald-400">
                    <CheckCircle2 size={24} />
                    <h3 className="font-gaming font-bold text-base uppercase">Inscription Validée !</h3>
                  </div>
                  <div className="bg-[#0A0A0F] border border-emerald-500/30 rounded-2xl p-5 text-center space-y-2">
                    <p className="text-[10px] font-gaming font-bold uppercase tracking-widest text-[#8888AA] flex items-center justify-center gap-1.5">
                      <Ticket size={12} /> Ton ticket eGame
                    </p>
                    <p className="text-2xl md:text-3xl font-gaming font-black text-[#FFD700] tracking-widest">{userTicket.code}</p>
                    <p className={`text-[10px] font-gaming font-bold uppercase tracking-wider ${userTicket.status === 'valide' ? 'text-emerald-400' : 'text-orange-400'}`}>
                      {userTicket.status === 'valide'
                        ? '✅ Place confirmée par eGame'
                        : "⏳ En attente : envoie ton ticket à l'IA eGame sur WhatsApp"}
                    </p>
                  </div>
                  <a href={whatsappTicketLink} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 font-gaming font-bold text-white py-6 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                      Envoyer mon ticket sur WhatsApp
                    </Button>
                  </a>
                </div>
              ) : participantCount >= maxSlots ? (
                <div className="rounded-2xl border-2 border-orange-400/60 bg-orange-950/40 p-6 text-center space-y-3" role="status">
                  <Users className="mx-auto text-orange-300" size={26} />
                  <h3 className="font-gaming font-bold text-orange-200 uppercase">Tournoi complet</h3>
                  <p className="text-sm text-orange-100">Toutes les places sont prises ({participantCount}/{maxSlots}). Les inscriptions sont fermées.</p>
                  <Button disabled className="w-full rounded-2xl border border-orange-300/40 bg-orange-900 text-white py-5 disabled:opacity-80">
                    Aucune place disponible
                  </Button>
                </div>
              ) : isRegistrationNotOpen ? (
                <div className="bg-violet-950/40 border border-violet-500/40 p-6 rounded-2xl text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-violet-300">
                    <Clock size={22} />
                    <h3 className="font-gaming font-bold text-base uppercase">Inscriptions bientôt ouvertes</h3>
                  </div>
                  <p className="text-xs text-[#8888AA]">Les inscriptions ouvrent le {formattedStartRegistration} (heure du tournoi, GMT+1)</p>
                </div>
              ) : isRegistrationClosed ? (
                <div className="bg-orange-950/40 border border-orange-500/40 p-6 rounded-2xl text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-orange-400">
                    <Clock size={22} />
                    <h3 className="font-gaming font-bold text-base uppercase">Inscriptions Closes</h3>
                  </div>
                  <p className="text-xs text-[#8888AA]">Les inscriptions se sont terminées le {formattedEndRegistration}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleStartRegistration}
                    disabled={isPaying}
                    className="w-full border-2 border-violet-400 bg-violet-700 hover:bg-violet-600 text-white px-4 py-5 rounded-2xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#0F0F1E] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isPaying ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Préparation...</>
                    ) : isFree ? (
                      "S'inscrire Gratuitement • Ticket"
                    ) : (
                      `S'inscrire et Payer • ${tournament.entry_fee} FCFA`
                    )}
                  </button>
                  {formattedEndRegistration && (
                    <p className="text-center text-[10px] font-gaming font-bold uppercase tracking-widest text-[#8888AA]">
                      {formattedStartRegistration
                        ? `Inscriptions : ${formattedStartRegistration} → ${formattedEndRegistration}`
                        : `Fin des inscriptions : ${formattedEndRegistration}`}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Détails : Déroulement & Règlement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0F0F1E] border border-[#8A2BE2]/20 rounded-3xl p-8 space-y-4">
            <h2 className="text-sm font-gaming font-bold uppercase text-white flex items-center gap-2">
              <FileText className="text-[#8A2BE2]" size={18} /> Déroulement
            </h2>
            <div className="text-[#8888AA] text-xs leading-relaxed whitespace-pre-wrap font-medium">
              {tournament.description || "Inscrivez-vous, rejoignez le salon de jeu à l'heure indiquée et donnez le meilleur de vous-même."}
            </div>
          </div>

          <div className="bg-[#0F0F1E] border border-[#8A2BE2]/20 rounded-3xl p-8 space-y-4">
            <h2 className="text-sm font-gaming font-bold uppercase text-white flex items-center gap-2">
              <Info className="text-[#8A2BE2]" size={18} /> Règlement officiel
            </h2>
            <div className="text-[#8888AA] text-xs leading-relaxed whitespace-pre-wrap font-medium">
              {tournament.rules || "Respect absolu du fair-play. Tout usage d'émulateur ou de cheat entraînera la disqualification immédiate sans remboursement."}
            </div>
          </div>
        </div>

        {/* Liste des Inscrits */}
        <div className="bg-[#0F0F1E] border border-[#8A2BE2]/20 rounded-3xl p-8 space-y-6">
          <h2 className="text-sm font-gaming font-bold uppercase text-white flex items-center gap-2">
            <Users className="text-[#8A2BE2]" size={18} /> Participants Confirmés ({participantCount})
          </h2>

          <div className="flex flex-wrap gap-4">
            {participants.map((p, i) => (
              <div key={i} className="group relative flex items-center gap-2 bg-[#0A0A0F] border border-[#8A2BE2]/30 px-3.5 py-2 rounded-2xl">
                <div className="w-8 h-8 rounded-full border border-[#8A2BE2] overflow-hidden bg-[#0F0F1E]">
                  <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="font-gaming font-bold text-xs text-white">{p.username}</span>
                <PlayerBadge tournamentCount={p.tournamentCount} mvpCount={p.mvpCount} championCount={p.championCount} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal 1 : Avertissement & Validation */}
      <AnimatePresence>
        {showConfirmation && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowConfirmation(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[#0F0F1E] border border-[#8A2BE2] w-full max-w-[420px] rounded-3xl p-8 shadow-2xl z-[10000] text-center space-y-6">
              <div className="w-16 h-16 bg-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center mx-auto border border-orange-500/40">
                <AlertTriangle size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-gaming font-bold text-white">Avant de continuer</h2>
                {isFree ? (
                  <p className="text-xs text-[#8888AA] leading-relaxed">
                    Ce tournoi est <span className="text-emerald-400 font-bold">100% gratuit</span>. Vérifie que tu acceptes le règlement :
                    tu recevras ensuite un <span className="text-[#FFD700] font-bold">ticket personnel</span> à envoyer à l'IA eGame sur
                    WhatsApp pour confirmer ta place.
                  </p>
                ) : (
                  <p className="text-xs text-[#8888AA] leading-relaxed">
                    Vérifiez bien que vous acceptez le règlement du tournoi. Les frais d'inscription ({tournament.entry_fee} FCFA) sont engagés pour le Cash Prize.
                  </p>
                )}
              </div>
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    if (isFree) handleFreeRegistration();
                    else if (paymentGateway === 'kkiapay') handleKKiaPay();
                    else if (paymentGateway === 'fedapay') handleFedaPay();
                    else setShowPaymentMethods(true);
                  }}
                  className="w-full btn-glow-border py-4 text-xs tracking-widest uppercase"
                >
                  {isFree
                    ? "J'accepte, obtenir mon ticket"
                    : paymentGateway === 'kkiapay'
                    ? "J'accepte, payer avec KKiaPay"
                    : paymentGateway === 'fedapay'
                    ? "J'accepte, payer avec FedaPay"
                    : "J'accepte, choisir le paiement"}
                </button>
                <button onClick={() => setShowConfirmation(false)} className="w-full text-xs font-gaming text-[#8888AA] hover:text-white py-2">
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2 : Sélection de la Passerelle Mobile Money (KKiaPay / FedaPay) */}
      <AnimatePresence>
        {showPaymentMethods && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPaymentMethods(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[#0F0F1E] border border-[#8A2BE2] w-full max-w-[420px] rounded-3xl p-8 shadow-2xl z-[10000] space-y-6">
              <button onClick={() => setShowPaymentMethods(false)} className="absolute top-6 right-6 text-[#8888AA] hover:text-white"><X size={20} /></button>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-[#8A2BE2]/20 text-[#8A2BE2] rounded-xl flex items-center justify-center mx-auto">
                  <CreditCard size={24} />
                </div>
                <h2 className="text-xl font-gaming font-bold text-white">Choix du Paiement</h2>
                <p className="text-xs text-[#8888AA]">Sélectionne ton moyen Mobile Money préféré</p>
              </div>

              <div className="space-y-3">
                {paymentGateway !== 'fedapay' && (
                  <button
                    onClick={handleKKiaPay}
                    className="w-full p-4 bg-[#0A0A0F] hover:bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 hover:border-[#8A2BE2] rounded-2xl text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h3 className="font-gaming font-bold text-sm text-white group-hover:text-[#A855F7]">KKiaPay</h3>
                      <p className="text-[10px] text-[#8888AA]">MTN Mobile Money, Moov Money, Celtiis Cash</p>
                    </div>
                    <ChevronRight size={18} className="text-[#8888AA] group-hover:text-white" />
                  </button>
                )}

                {paymentGateway !== 'kkiapay' && (
                  <button
                    onClick={handleFedaPay}
                    className="w-full p-4 bg-[#0A0A0F] hover:bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 hover:border-[#8A2BE2] rounded-2xl text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h3 className="font-gaming font-bold text-sm text-white group-hover:text-[#A855F7]">FedaPay</h3>
                      <p className="text-[10px] text-[#8888AA]">MTN, Moov Money, Cartes Bancaires VISA/Mastercard</p>
                    </div>
                    <ChevronRight size={18} className="text-[#8888AA] group-hover:text-white" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modal 3 : Ticket créé (tournoi gratuit) */}
      <AnimatePresence>
        {showTicketModal && userTicket && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowTicketModal(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#0F0F1E] border border-[#8A2BE2] w-full max-w-[420px] rounded-3xl p-8 shadow-2xl z-[10000] text-center space-y-6"
            >
              <button onClick={() => setShowTicketModal(false)} className="absolute top-6 right-6 text-[#8888AA] hover:text-white"><X size={20} /></button>

              <div className="w-16 h-16 bg-[#FFD700]/10 text-[#FFD700] rounded-2xl flex items-center justify-center mx-auto border border-[#FFD700]/40">
                <Ticket size={32} />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-gaming font-bold text-white">Ton ticket est prêt !</h2>
                <p className="text-xs text-[#8888AA] leading-relaxed">
                  Envoie ce code à <span className="text-white font-bold">l'IA eGame sur WhatsApp</span> :
                  elle confirme ton inscription en quelques secondes et ta place est réservée.
                </p>
              </div>

              <div className="bg-[#0A0A0F] border-2 border-dashed border-[#FFD700]/50 rounded-2xl p-5 space-y-3">
                <p className="text-2xl md:text-3xl font-gaming font-black text-[#FFD700] tracking-widest">{userTicket.code}</p>
                <button
                  onClick={() => { navigator.clipboard.writeText(userTicket.code); showSuccess("Code copié !"); }}
                  className="mx-auto flex items-center gap-1.5 text-[10px] font-gaming font-bold uppercase tracking-widest text-[#8888AA] hover:text-white transition-colors"
                >
                  <Copy size={12} /> Copier le code
                </button>
              </div>

              <div className="space-y-3">
                <a href={whatsappTicketLink} target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-500 font-gaming font-bold text-white py-5 rounded-xl text-xs uppercase tracking-wider">
                    Envoyer sur WhatsApp
                  </Button>
                </a>
                <button onClick={() => setShowTicketModal(false)} className="w-full text-xs font-gaming text-[#8888AA] hover:text-white py-2">
                  J'ai compris
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TournamentDetails;