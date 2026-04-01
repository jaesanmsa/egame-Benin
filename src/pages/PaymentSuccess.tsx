"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, History, MessageSquare, Copy, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/lib/supabase';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationCode, setValidationCode] = useState<string | null>(null);
  const [tournamentName, setTournamentName] = useState<string | null>(null);
  const hasProcessed = useRef(false);

  const whatsappNumber = "2290141790790";

  useEffect(() => {
    const processPayment = async () => {
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      const transactionId = searchParams.get('transaction_id') || searchParams.get('kkiapay_transaction_id');
      const tournamentId = searchParams.get('tournamentId');
      const tName = searchParams.get('tournamentName');
      const amount = searchParams.get('amount');

      if (!transactionId || !tournamentId) {
        setError("Informations de transaction manquantes.");
        setIsProcessing(false);
        return;
      }

      setTournamentName(tName);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Session utilisateur introuvable.");

        // 1. Vérifier si déjà enregistré
        const { data: existing } = await supabase
          .from('payments')
          .select('*')
          .eq('fedapay_transaction_id', transactionId)
          .maybeSingle();

        if (existing) {
          setValidationCode(existing.validation_code);
          setIsProcessing(false);
          return;
        }

        // 2. Créer le code et insérer le paiement
        const code = `EGB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        
        const { error: insertError } = await supabase.from('payments').insert({
          user_id: user.id,
          tournament_id: tournamentId,
          tournament_name: tName || "Tournoi",
          amount: amount || "0",
          status: 'Réussi',
          validation_code: code,
          fedapay_transaction_id: transactionId
        });

        if (insertError) throw insertError;

        // 3. CRÉDITER LES POINTS DE FIDÉLITÉ (+10 points)
        const { data: profile } = await supabase.from('profiles').select('points').eq('id', user.id).single();
        const currentPoints = profile?.points || 0;
        
        await supabase
          .from('profiles')
          .update({ points: currentPoints + 10 })
          .eq('id', user.id);

        setValidationCode(code);
        showSuccess("Inscription confirmée ! +10 points gagnés.");

        // 4. Notification Twilio
        try {
          const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          await supabase.functions.invoke('notify-payment', {
            body: {
              joueur_nom: prof?.full_name || prof?.username || "Joueur",
              joueur_telephone: prof?.phone || "N/A",
              tournoi_nom: tName || "Tournoi",
              montant: amount || "0",
              transactionId: transactionId
            }
          });
        } catch (notifyErr) {
          console.warn("Erreur notification Twilio:", notifyErr);
        }

      } catch (err: any) {
        setError(err.message || "Une erreur est survenue.");
        showError("Erreur d'enregistrement.");
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams]);

  const handleWhatsAppSend = () => {
    const message = encodeURIComponent(`Bonjour eGame Bénin, voici mon code de validation : ${validationCode} pour le tournoi ${tournamentName}.`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-card border border-border rounded-[3rem] p-10 text-center shadow-2xl">
          {isProcessing ? (
            <div className="py-12 space-y-6">
              <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto" />
              <h1 className="text-2xl font-black">Validation en cours...</h1>
            </div>
          ) : error ? (
            <div className="py-8 space-y-6">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={48} className="text-red-500" />
              </div>
              <h1 className="text-2xl font-black text-red-500">Oups !</h1>
              <p className="text-muted-foreground text-sm">{error}</p>
              <Link to="/contact" className="block">
                <Button className="w-full py-6 rounded-2xl bg-violet-600 text-white font-bold">Contacter le support</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>

              <h1 className="text-3xl font-black mb-4">C'est validé !</h1>
              <p className="text-muted-foreground mb-8 text-sm">
                Ton inscription est enregistrée. Note bien ton code de validation :
              </p>

              <div className="space-y-6 mb-10">
                <div className="p-6 bg-muted/50 rounded-[2rem] border border-border">
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2">Code de validation</p>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-foreground font-mono font-black text-2xl tracking-wider">{validationCode}</span>
                    <button onClick={() => { navigator.clipboard.writeText(validationCode!); showSuccess("Copié !"); }} className="text-muted-foreground hover:text-violet-500"><Copy size={20} /></button>
                  </div>
                </div>

                <Button onClick={handleWhatsAppSend} className="w-full py-8 rounded-2xl bg-green-600 hover:bg-green-700 font-black text-lg gap-3 text-white shadow-xl shadow-green-500/20">
                  <MessageSquare size={24} />
                  Envoyer sur WhatsApp
                </Button>
              </div>

              <div className="space-y-4">
                <Link to="/payments">
                  <Button variant="outline" className="w-full py-7 rounded-2xl border-border font-bold gap-3">
                    <History size={20} />
                    Voir mon historique
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="ghost" className="w-full py-4 rounded-2xl font-bold text-muted-foreground">Retour à l'accueil</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;