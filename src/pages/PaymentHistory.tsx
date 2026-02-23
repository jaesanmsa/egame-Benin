"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle2, CreditCard, Copy, MessageSquare, XCircle } from 'lucide-react';
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
}

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const whatsappNumber = "2290141790790";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // On traite les données pour marquer comme échoué si > 5 min
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
    setLoading(false);
  };

  const handleWhatsAppSend = (payment: Payment) => {
    const message = encodeURIComponent(`Bonjour eGame Bénin, voici mon code de validation de paiement : ${payment.validation_code} pour le tournoi ${payment.tournament_name}.`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess("Copié !");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft size={20} />
          Retour
        </button>

        <h1 className="text-3xl font-black mb-8">Mes Inscriptions</h1>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-6">
            {payments.length === 0 ? (
              <div className="text-center py-20 bg-card/50 rounded-[2rem] border border-border shadow-sm">
                <CreditCard size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune inscription</p>
              </div>
            ) : (
              payments.map((payment) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={payment.id} className="bg-card p-6 rounded-[2rem] border border-border space-y-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{payment.tournament_name}</h3>
                      <p className="text-muted-foreground text-xs">{new Date(payment.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold ${
                      payment.status === 'Réussi' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      payment.status === 'Échoué' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      'bg-orange-500/10 text-orange-500 border-orange-500/20'
                    }`}>
                      {payment.status === 'Réussi' ? <CheckCircle2 size={14} /> : 
                       payment.status === 'Échoué' ? <XCircle size={14} /> :
                       <Clock size={14} />}
                      {payment.status}
                    </div>
                  </div>

                  {payment.status === 'Réussi' ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-2">Code de validation (Preuve de paiement)</p>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground font-mono font-bold text-xl">{payment.validation_code}</span>
                          <button onClick={() => copyToClipboard(payment.validation_code)} className="text-muted-foreground hover:text-foreground"><Copy size={18} /></button>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleWhatsAppSend(payment)}
                        className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-500/20"
                      >
                        <MessageSquare size={20} />
                        Envoyer ma preuve sur WhatsApp
                      </button>
                    </div>
                  ) : payment.status === 'Échoué' ? (
                    <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10 text-center">
                      <p className="text-red-500 text-xs font-bold">Paiement expiré ou échoué</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Le délai de 5 minutes est dépassé. Veuillez recommencer l'inscription.</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-2xl text-center">
                      <p className="text-muted-foreground text-xs italic">En attente de confirmation par FedaPay...</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Le code de validation apparaîtra ici après le paiement.</p>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PaymentHistory;