"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { ArrowLeft, Clock, CheckCircle2, CreditCard, Copy, MessageSquare, XCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { showSuccess } from '@/utils/toast';

interface Payment {
  id: string;
  tournament_name: string;
  amount: string;
  status: 'En attente' | 'Réussi' | 'Échoué';
  validation_code: string;
  created_at: string;
  updated_at: string;
}

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [playerUsername, setPlayerUsername] = useState('Joueur');
  const whatsappNumber = "2290141790790";

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();
      if (profile?.username) setPlayerUsername(profile.username);

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const processedPayments = data.map((p: any) => {
          const createdAt = new Date(p.created_at).getTime();
          const now = new Date().getTime();
          const diffMinutes = (now - createdAt) / (1000 * 60);
          
          if (p.status === 'En attente' && diffMinutes > 5) {
            return { ...p, status: 'Échoué' };
          }
          return p;
        });
        setPayments(processedPayments);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    const channel = supabase
      .channel('payment_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        fetchData(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const handleWhatsAppSend = (payment: Payment) => {
    const message = encodeURIComponent(`Pseudo: ${playerUsername} | Code: ${payment.validation_code}`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess("Code copié !");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-32 pt-24">
      <SEO title="Mes Inscriptions & Paiements" noindex />
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 space-y-8">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#8888AA] hover:text-white transition-colors text-xs font-gaming font-bold uppercase tracking-widest">
            <ArrowLeft size={16} /> Retour
          </button>
          <button 
            onClick={() => fetchData(true)} 
            disabled={isRefreshing}
            className={`p-2.5 rounded-full bg-[#0F0F1E] border border-[#8A2BE2]/30 hover:border-[#8A2BE2] transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={16} className="text-[#8A2BE2]" />
          </button>
        </div>

        <h1 className="text-3xl font-gaming font-black uppercase text-white">Mes Inscriptions</h1>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-[#8A2BE2] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            {payments.length === 0 ? (
              <div className="text-center py-20 bg-[#0F0F1E] rounded-3xl border border-[#8A2BE2]/20">
                <CreditCard size={48} className="mx-auto text-[#8888AA] mb-4 opacity-40" />
                <p className="text-sm font-gaming text-[#8888AA]">Aucune inscription enregistrée.</p>
              </div>
            ) : (
              payments.map((payment) => (
                <div key={payment.id} className="bg-[#0F0F1E] p-6 rounded-3xl border border-[#8A2BE2]/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-gaming font-bold text-base text-white">{payment.tournament_name}</h3>
                      <p className="text-[#8888AA] text-[10px] font-mono mt-0.5">{new Date(payment.created_at).toLocaleString('fr-FR')}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-gaming font-bold uppercase tracking-wider ${
                      payment.status === 'Réussi' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40' : 
                      payment.status === 'Échoué' ? 'bg-red-950/80 text-red-400 border border-red-500/40' :
                      'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                    }`}>
                      {payment.status === 'Réussi' ? <CheckCircle2 size={12} /> : 
                       payment.status === 'Échoué' ? <XCircle size={12} /> :
                       <Clock size={12} className="animate-pulse" />}
                      {payment.status}
                    </div>
                  </div>

                  {payment.status === 'Réussi' ? (
                    <div className="space-y-3 pt-2 border-t border-[#8A2BE2]/10">
                      <div className="p-4 bg-[#0A0A0F] rounded-2xl border border-[#FFD700]/30 flex items-center justify-between">
                        <div>
                          <p className="text-[#8888AA] text-[9px] font-gaming font-bold uppercase tracking-widest">Code de validation</p>
                          <p className="text-[#FFD700] font-gaming font-black text-xl tracking-widest">{payment.validation_code}</p>
                        </div>
                        <button onClick={() => copyToClipboard(payment.validation_code)} className="p-2 text-[#8888AA] hover:text-white">
                          <Copy size={18} />
                        </button>
                      </div>

                      <button 
                        onClick={() => handleWhatsAppSend(payment)}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-gaming font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <MessageSquare size={16} />
                        Envoyer le code au support WhatsApp
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#0A0A0F] rounded-xl text-center">
                      <p className="text-xs text-[#8888AA]">Montant : <span className="text-white font-bold">{payment.amount} FCFA</span></p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PaymentHistory;