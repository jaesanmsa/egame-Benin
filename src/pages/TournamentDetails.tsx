"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { Calendar, Users, Trophy, Shield, Smartphone, ArrowLeft, Lock, X, Share2, Globe, MapPin, Info, Gamepad2, CheckCircle2, History, Copy, ChevronRight, Clock } from 'lucide-react';
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
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const createdAt = new Date(data.created_at).getTime();
        const now = new Date().getTime();
        const diffMinutes = (now - createdAt) / (1000 * 60);

        if (data.status === 'Réussi') {
          setUserRegistration(data);
        } else if (data.status === 'En attente' && diffMinutes < 30) {
          setUserRegistration(data);
        } else {
          setUserRegistration(null);
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

      // Utilisation de la fonction Edge pour créer le paiement proprement
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          tournament_id: id,
          tournament_name: tournament.title,
          amount: tournament.entry_fee,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("URL de paiement non reçue");

      window.location.href = data.url;
    } catch (err: any) {
      console.error("Erreur paiement:", err);
      showError(err.message || "Erreur de redirection. Veuillez réessayer.");
      setPaymentStep('select');
      setShowPayment(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess("Code copié !");
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!tournament) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Tournoi non trouvé</div>;

  const maxParticipants = tournament.max_participants || 40;
  const isFull = participantCount >= maxParticipants;
  const progress = (participantCount / maxParticipants) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <SEO 
        title={`${tournament.title} - Tournoi ${tournament.game}`}
        description={`Inscrivez-vous au tournoi ${tournament.title} sur eGame Bénin. Cash Prize : ${tournament.prize_pool}. Frais d'entrée : ${tournament.entry_fee} FCFA.`}
        image={tournament.image_url}
      />
      <Navbar />
      
      <div className="relative h-[35vh] w-full">
        <img src={tournament.image_url} className="w-full h-full object-cover opacity-50" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute top-6 left-6 z-20">
          <button onClick={() => navigate(-1)} className="p-3 bg-card/80 backdrop-blur-md rounded-full text-foreground border border-border">
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="absolute top-6 right-6 z-20">
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); showSuccess("Lien copié !"); }} className="p-3 bg-violet-600 rounded-full text-white shadow-lg shadow-violet-500/20">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 -mt-24 relative z-10">
        <div className="bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-2xl mb-8">
          <div className="flex justify-between items-start gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-violet-500 font-bold uppercase tracking-widest text-[10px]">{tournament.game}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${tournament.type === 'Online' ? 'bg-cyan-500/10 text-cyan-500' : 'bg-orange-500/10 text-orange-500'}`}>
                  {tournament.type === 'Online' ? 'En ligne' : 'Présentiel'}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black">{tournament.title}</h1>
            </div>
            <div className="bg-violet-600 px-4 py-2 rounded-xl text-center text-white shadow-lg shadow-violet-500/20">
              <p className="text-[10px] text-violet-200 uppercase font-bold">Cash Prize</p>
              <p className="text-xl font-black">{tournament.prize_pool}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-muted/50 p-3 rounded-2xl border border-border text-center">
              <Calendar className="text-violet-500 mx-auto mb-1" size={18} />
              <p className="text-muted-foreground text-[10px]">Date</p>
              <p className="font-bold text-xs">{new Date(tournament.start_date || Date.now()).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-2xl border border-border text-center">
              <Users className="text-violet-500 mx-auto mb-1" size={18} />
              <p className="text-muted-foreground text-[10px]">Participants</p>
              <p className="font-bold text-xs">{participantCount} / {maxParticipants}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-2xl border border-border text-center">
              {tournament.type === 'Online' ? <Globe className="text-violet-500 mx-auto mb-1" size={18} /> : <MapPin className="text-violet-500 mx-auto mb-1" size={18} />}
              <p className="text-muted-foreground text-[10px]">Lieu</p>
              <p className="font-bold text-xs">{tournament.type === 'Online' ? 'En ligne' : 'Présentiel'}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-2xl border border-border text-center">
              <Shield className="text-violet-500 mx-auto mb-1" size={18} />
              <p className="text-muted-foreground text-[10px]">Anti-Cheat</p>
              <p className="font-bold text-xs">Activé</p>
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
                <h3 className="font-black text-lg">
                  {userRegistration.status === 'Réussi' ? "Vous êtes inscrit !" : "Paiement en cours..."}
                </h3>
              </div>
              
              {userRegistration.status === 'Réussi' ? (
                <>
                  <div className="p-4 bg-background/50 rounded-2xl border border-border mb-6">
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-2">Votre Code de Validation</p>
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-foreground font-mono font-bold text-2xl">{userRegistration.validation_code}</span>
                      <button onClick={() => copyToClipboard(userRegistration.validation_code)} className="text-muted-foreground hover:text-foreground">
                        <Copy size={20} />
                      </button>
                    </div>
                  </div>
                  <Link to="/payments">
                    <Button className="w-full bg-green-600 hover:bg-green-700 font-bold text-white py-6 rounded-2xl gap-2">
                      <History size={20} />
                      Gérer mes inscriptions
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Nous attendons la confirmation de FedaPay. Cela prend généralement moins de 2 minutes.
                  </p>
                  <Link to="/payments">
                    <Button variant="outline" className="w-full py-6 rounded-2xl border-border font-bold">
                      Suivre le statut
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            isLoggedIn ? (
              <Button 
                onClick={() => !isFull && setShowPayment(true)} 
                disabled={isFull}
                className={`w-full py-8 rounded-2xl font-black text-lg shadow-xl transition-all ${isFull ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-violet-600 text-white shadow-violet-500/20 hover:bg-violet-700'}`}
              >
                {isFull ? "Tournoi Complet" : `S'inscrire pour ${tournament.entry_fee} FCFA`}
              </Button>
            ) : (
              <Button onClick={() => navigate('/auth')} className="w-full py-8 rounded-2xl bg-muted font-black gap-3 text-foreground text-sm">
                <Lock size={18} /> Se connecter pour s'inscrire
              </Button>
            )
          )}

          {tournament.rules && (
            <div className="mt-6 p-5 bg-background/50 rounded-2xl border border-border">
              <div className="flex items-center gap-2 mb-3 text-violet-400">
                <Info size={16} />
                <h3 className="font-bold uppercase tracking-widest text-[10px]">Règlement & Infos</h3>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-wrap">
                {tournament.rules}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* MODAL DE PAIEMENT OPTIMISÉ */}
      {showPayment && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setShowPayment(false)} 
          />
          
          <div className="relative bg-card border border-border w-full max-w-[400px] rounded-[2.5rem] p-8 shadow-2xl z-[10000] overflow-hidden">
            <button 
              onClick={() => setShowPayment(false)} 
              className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground bg-muted rounded-full transition-all"
            >
              <X size={20} />
            </button>
            
            {paymentStep === 'select' ? (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-violet-600/10 rounded-3xl flex items-center justify-center text-violet-500 mx-auto mb-4">
                    <Smartphone size={40} />
                  </div>
                  <h2 className="text-2xl font-black mb-1">Paiement Mobile</h2>
                  <p className="text-muted-foreground text-sm">Sécurisé par FedaPay Bénin</p>
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={handleFedaPay} 
                    className="w-full flex items-center justify-between p-6 bg-muted hover:bg-violet-600/10 rounded-2xl border border-border hover:border-violet-500/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        <Smartphone size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-base">MTN / Moov Money</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Validation instantanée</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-muted-foreground group-hover:text-violet-500 transition-colors" />
                  </button>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Montant à payer</span>
                    <span className="font-black text-violet-500">{tournament.entry_fee} FCFA</span>
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground mt-4 leading-relaxed">
                    En continuant, vous acceptez les conditions de participation au tournoi.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center space-y-6">
                <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <div>
                  <h2 className="text-2xl font-black mb-2">Redirection...</h2>
                  <p className="text-muted-foreground text-sm">Préparation de votre paiement sécurisé</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentDetails;