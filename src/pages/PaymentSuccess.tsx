"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, History, MessageSquare, Copy, Loader2, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/lib/supabase';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationCode, setValidationCode] = useState<string | null>(null);
  const [tournamentName, setTournamentName] = useState<string | null>(null);
  const [playerUsername, setPlayerUsername] = useState<string>('Joueur');
  const hasProcessed = useRef(false);

  const whatsappNumber = "2290141790790";

  useEffect(() => {
    const processPayment = async () => {
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      const tournamentId = searchParams.get('tournamentId');
      const tName = searchParams.get('tournamentName');
      const amount = searchParams.get('amount');
      const callbackGateway = searchParams.get('gateway');
      const savedGateway = tournamentId ? sessionStorage.getItem(`payment_gateway:${tournamentId}`) : null;
      const legacyKkiapayId = searchParams.get('kkiapay_transaction_id');
      const gateway = callbackGateway || savedGateway || 'kkiapay';
      const transactionId = legacyKkiapayId || searchParams.get('transaction_id') || searchParams.get('transactionId') || searchParams.get('id') || searchParams.get('maketou_id');

      if (!transactionId || !tournamentId) {
        setError("Informations de transaction manquantes.");
        setIsProcessing(false);
        return;
      }

      setTournamentName(tName);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Session utilisateur introuvable.");

        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle();
        if (profile?.username) setPlayerUsername(profile.username);

        if (gateway === 'maketou') {
          const { data, error: funcError } = await supabase.functions.invoke('verify-maketou', {
            body: { action: 'verify', transaction_id: transactionId, tournamentId, tournamentName: tName, amount }
          });
          if (funcError || data?.error) throw new Error(data?.error || "Erreur Maketou");
          setValidationCode(data.validation_code);
          showSuccess("Paiement Maketou vérifié !");
        } else if (gateway === 'fedapay') {
          const { data, error: funcError } = await supabase.functions.invoke('verify-fedapay', {
            body: { transaction_id: transactionId, tournamentId, tournamentName: tName, amount }
          });
          if (funcError || data?.error) throw new Error(data?.error || "Erreur FedaPay");
          setValidationCode(data.validation_code);
          showSuccess("Paiement FedaPay vérifié !");
        } else if (gateway === 'kkiapay') {
          const { data: existing, error: lookupError } = await supabase
            .from('payments')
            .select('validation_code')
            .eq('fedapay_transaction_id', transactionId)
            .maybeSingle();

          if (lookupError) throw lookupError;

          if (existing) {
            setValidationCode(existing.validation_code);
          } else {
            const code = `EGB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

            // Réclamer la ligne "En attente" créée à l'ouverture du widget (évite les doublons).
            const { data: pending } = await supabase
              .from('payments')
              .select('id')
              .eq('user_id', user.id)
              .eq('tournament_id', tournamentId)
              .eq('gateway', 'kkiapay')
              .is('fedapay_transaction_id', null)
              .is('validation_code', null)
              .order('created_at', { ascending: true })
              .limit(1)
              .maybeSingle();

            let finalCode: string | null = null;

            if (pending) {
              const { data: claimed, error: updateError } = await supabase
                .from('payments')
                .update({
                  status: 'Réussi',
                  validation_code: code,
                  fedapay_transaction_id: transactionId,
                  amount: amount || "0",
                  updated_at: new Date().toISOString()
                })
                .eq('id', pending.id)
                .is('validation_code', null)
                .select()
                .maybeSingle();
              if (updateError) throw updateError;
              if (claimed) finalCode = claimed.validation_code;
            }

            if (!finalCode) {
              // Le webhook serveur a pu valider entre-temps : relire par référence.
              const { data: byTx } = await supabase
                .from('payments')
                .select('validation_code')
                .eq('fedapay_transaction_id', transactionId)
                .maybeSingle();
              if (byTx) {
                finalCode = byTx.validation_code;
              } else {
                const { error: insertError } = await supabase.from('payments').insert({
                  user_id: user.id,
                  tournament_id: tournamentId,
                  tournament_name: tName || "Tournoi",
                  amount: amount || "0",
                  status: 'Réussi',
                  validation_code: code,
                  fedapay_transaction_id: transactionId,
                  gateway: 'kkiapay'
                });
                if (insertError) {
                  // Course avec le webhook : la transaction vient d'être enregistrée.
                  if (insertError.code === '23505') {
                    const { data: byTxRetry } = await supabase
                      .from('payments')
                      .select('validation_code')
                      .eq('fedapay_transaction_id', transactionId)
                      .maybeSingle();
                    if (byTxRetry) finalCode = byTxRetry.validation_code;
                    else throw insertError;
                  } else {
                    throw insertError;
                  }
                } else {
                  finalCode = code;
                }
              }
            }

            setValidationCode(finalCode);
            showSuccess("Paiement KKiaPay enregistré !");
          }
        } else {
          throw new Error("Passerelle de paiement inconnue.");
        }

        sessionStorage.removeItem(`payment_gateway:${tournamentId}`);
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue.");
        showError(`Erreur de transaction ${gateway === 'kkiapay' ? 'KKiaPay' : gateway === 'fedapay' ? 'FedaPay' : 'Maketou'}.`);
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams]);

  const handleWhatsAppSend = () => {
    const message = encodeURIComponent(`Pseudo: ${playerUsername} | Code: ${validationCode}`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col">
      <SEO title="Paiement Réussi" />
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6 pt-24">
        <div className="w-full max-w-md bg-[#0F0F1E] border border-[#8A2BE2]/40 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          {isProcessing ? (
            <div className="py-12 space-y-4">
              <Loader2 className="w-12 h-12 text-[#8A2BE2] animate-spin mx-auto" />
              <h1 className="text-xl font-gaming font-bold">Vérification de la transaction...</h1>
            </div>
          ) : error ? (
            <div className="py-8 space-y-4">
              <AlertCircle size={48} className="text-red-400 mx-auto" />
              <h1 className="text-xl font-gaming font-bold text-red-400">Échec de validation</h1>
              <p className="text-xs text-[#8888AA]">{error}</p>
              <Link to="/contact" className="block">
                <button className="w-full btn-glow-border py-3.5 text-xs uppercase">Contacter le support</button>
              </Link>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 size={48} />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-gaming font-black uppercase text-white">C'est Validé !</h1>
                <p className="text-xs text-[#8888AA]">Ton inscription au tournoi est enregistrée.</p>
              </div>

              <div className="p-6 bg-[#0A0A0F] rounded-2xl border border-[#FFD700]/40 space-y-2">
                <p className="text-[10px] font-gaming font-bold text-[#8888AA] uppercase tracking-widest">Ton Code de Validation</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-[#FFD700] font-gaming font-black text-2xl tracking-widest">{validationCode}</span>
                  <button onClick={() => { navigator.clipboard.writeText(validationCode!); showSuccess("Code copié !"); }} className="text-[#8888AA] hover:text-white">
                    <Copy size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleWhatsAppSend}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-gaming font-bold text-xs uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2"
                >
                  <MessageSquare size={18} />
                  Envoyer au Support WhatsApp
                </button>

                <Link to="/payments" className="block">
                  <button className="w-full bg-[#0A0A0F] border border-[#8A2BE2]/30 hover:border-[#8A2BE2] text-white font-gaming font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2">
                    <History size={16} /> Voir mon historique
                  </button>
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