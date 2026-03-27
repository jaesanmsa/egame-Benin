"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, History, MessageSquare, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/lib/supabase';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [validationCode, setValidationCode] = useState<string | null>(null);
  const [tournamentName, setTournamentName] = useState<string | null>(null);
  const hasProcessed = useRef(false);

  const whatsappNumber = "2290141790790";

  useEffect(() => {
    const processPayment = async () => {
      // On évite de traiter deux fois (React StrictMode)
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      const transactionId = searchParams.get('transaction_id');
      const tournamentId = searchParams.get('tournamentId');
      const tName = searchParams.get('tournamentName');
      const amount = searchParams.get('amount');

      if (!transactionId || !tournamentId) {
        setIsProcessing(false);
        return;
      }

      setTournamentName(tName);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Utilisateur non connecté");

        // On vérifie si ce paiement n'a pas déjà été enregistré
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

        const code = `EGB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        
        // Enregistrement dans la base de données
        const { error } = await supabase.from('payments').insert({
          user_id: user.id,
          tournament_id: tournamentId,
          tournament_name: tName || "Tournoi",
          amount: amount || "0",
          status: 'Réussi',
          validation_code: code,
          fedapay_transaction_id: transactionId
        });

        if (error) throw error;

        setValidationCode(code);

        // Notification WhatsApp Admin
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        
        await supabase.functions.invoke('notify-payment', {
          body: {
            joueur_nom: profile?.full_name || profile?.username || "Joueur",
            joueur_telephone: profile?.phone || "N/A",
            tournoi_nom: tName || "Tournoi",
            montant: amount || "0",
            transactionId: transactionId
          }
        });

        showSuccess("Inscription enregistrée !");
      } catch (err: any) {
        console.error("Erreur enregistrement paiement:", err);
        showError("Erreur lors de l'enregistrement. Contactez le support.");
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams]);

  const handleWhatsAppSend = () => {
    const message = encodeURIComponent(`Bonjour eGame Bénin, voici mon code de validation de paiement : ${validationCode} pour le tournoi ${tournamentName}.`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const copyToClipboard = () => {
    if (validationCode) {
      navigator.clipboard.writeText(validationCode);
      showSuccess("Code copié !");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-card border border-border rounded-[3rem] p-10 text-center shadow-2xl">
          {isProcessing ? (
            <div className="py-12 space-y-6">
              <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto" />
              <div>
                <h1 className="text-2xl font-black mb-2">Finalisation...</h1>
                <p className="text-muted-foreground text-sm">Nous enregistrons votre inscription dans l'arène.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>

              <h1 className="text-3xl font-black mb-4">Paiement Reçu !</h1>
              <p className="text-muted-foreground mb-8">
                Votre inscription a été enregistrée. Voici votre code de validation unique :
              </p>

              {validationCode ? (
                <div className="space-y-6 mb-10">
                  <div className="p-6 bg-muted/50 rounded-[2rem] border border-border relative group">
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2">Code de validation</p>
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-foreground font-mono font-black text-2xl tracking-wider">{validationCode}</span>
                      <button onClick={copyToClipboard} className="text-muted-foreground hover:text-violet-500 transition-colors">
                        <Copy size={20} />
                      </button>
                    </div>
                  </div>

                  <Button 
                    onClick={handleWhatsAppSend}
                    className="w-full py-8 rounded-2xl bg-green-600 hover:bg-green-700 font-black text-lg gap-3 text-white shadow-xl shadow-green-500/20"
                  >
                    <MessageSquare size={24} />
                    Envoyer sur WhatsApp
                  </Button>
                </div>
              ) : (
                <div className="mb-10">
                  <Link to="/payments">
                    <Button className="w-full py-7 rounded-2xl bg-violet-600 hover:bg-violet-700 font-bold text-lg gap-3 text-white">
                      <History size={20} />
                      Voir mon historique
                    </Button>
                  </Link>
                </div>
              )}

              <div className="space-y-4">
                <Link to="/">
                  <Button variant="outline" className="w-full py-7 rounded-2xl border-border bg-muted/50 hover:bg-muted font-bold gap-3">
                    Retour à l'accueil
                    <ArrowRight size={20} />
                  </Button>
                </Link>
              </div>

              <div className="mt-10 pt-8 border-t border-border">
                <p className="text-[10px] text-muted-foreground mb-4 uppercase font-black tracking-widest">Besoin d'aide ?</p>
                <Link to="/contact" className="inline-flex items-center gap-2 text-green-500 font-bold hover:underline">
                  <MessageSquare size={16} />
                  Contacter le support
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