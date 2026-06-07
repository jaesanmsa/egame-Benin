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

      const gateway = searchParams.get('gateway');
      const transactionId = searchParams.get('transaction_id') || searchParams.get('id') || searchParams.get('maketou_id');
      const tournamentId = searchParams.get('tournamentId');
      const tName = searchParams.get('tournamentName');
      const amount = searchParams.get('amount');

      // Si c'est KKiaPay
      const kkiapayId = searchParams.get('kkiapay_transaction_id');

      if (!transactionId && !kkiapayId) {
        setError("Informations de transaction manquantes.");
        setIsProcessing(false);
        return;
      }

      setTournamentName(tName);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Session utilisateur introuvable.");

        if (gateway === 'maketou') {
          // LOGIQUE MAKETOU : On appelle l'action 'verify'
          const { data, error: funcError } = await supabase.functions.invoke('verify-maketou', {
            body: { 
              action: 'verify',
              transaction_id: transactionId, 
              tournamentId, 
              tournamentName: tName, 
              amount 
            }
          });
          if (funcError || data.error) throw new Error(data?.error || "Erreur Maketou");
          setValidationCode(data.validation_code);
          showSuccess("Paiement Maketou vérifié !");
        } else if (transactionId && !kkiapayId) {
          // LOGIQUE FEDAPAY
          const { data, error: funcError } = await supabase.functions.invoke('verify-fedapay', {
            body: { transaction_id: transactionId, tournamentId, tournamentName: tName, amount }
          });
          if (funcError || data.error) throw new Error(data?.error || "Erreur FedaPay");
          setValidationCode(data.validation_code);
          showSuccess("Paiement FedaPay vérifié !");
        } else {
          // LOGIQUE KKIAPAY
          const { data: existing } = await supabase
            .from('payments')
            .select('*')
            .eq('fedapay_transaction_id', kkiapayId)
            .maybeSingle();

          if (existing) {
            setValidationCode(existing.validation_code);
          } else {
            const code = `EGB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            await supabase.from('payments').insert({
              user_id: user.id,
              tournament_id: tournamentId,
              tournament_name: tName || "Tournoi",
              amount: amount || "0",
              status: 'Réussi',
              validation_code: code,
              fedapay_transaction_id: kkiapayId
            });
            setValidationCode(code);
            showSuccess("Inscription KKiaPay confirmée !");
          }
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
              <h1 className="text-2xl font-black">Vérification du paiement...</h1>
              <p className="text-xs text-muted-foreground">Nous sécurisons votre transaction</p>
            </div>
          ) : error ? (
            <div className="py-8 space-y-6">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={48} className="text-red-500" />
              </div>
              <h1 className="text-2xl font-black text-red-500">Échec de vérification</h1>
              <p className="text-muted-foreground text-sm">{error}</p>
              <Link to="/contact" className="block">
                <Button className="w-full py-6 rounded-2xl bg-violet-600 text-white font-bold">Contacter le support</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                CheckCircle2 size={48} className="text-green-500" />
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