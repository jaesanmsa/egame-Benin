"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle2, XCircle, CreditCard, MessageSquare, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { showSuccess } from '@/utils/toast';

interface Payment {
  id: string;
  tournament_name: string;
  amount: string;
  status: 'En attente' | 'Réussi' | 'Échoué';
  created_at: string;
}

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const whatsappNumber = "2290141790790";

  useEffect(() => {
    fetchPayments();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => {
          fetchPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const now = new Date();
      const updatedPayments = await Promise.all(data.map(async (p: Payment) => {
        const createdAt = new Date(p.created_at);
        const diffInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        
        if (p.status === 'En attente' && diffInHours > 1) {
          await supabase
            .from('payments')
            .update({ status: 'Échoué' })
            .eq('id', p.id);
          return { ...p, status: 'Échoué' as const };
        }
        return p;
      }));

      setPayments(updatedPayments);
    }
    setLoading(false);
  };

  const generateValidationCode = (id: string) => {
    // Génère un code court et lisible à partir de l'ID
    return `EGB-${id.substring(0, 5).toUpperCase()}`;
  };

  const handleSendWhatsApp = (payment: Payment) => {
    const code = generateValidationCode(payment.id);
    const message = encodeURIComponent(`Bonjour eGame Bénin, voici mon code de validation pour le tournoi ${payment.tournament_name} : ${code}`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess("Code copié !");
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Réussi': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Échoué': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Réussi': return <CheckCircle2 size={16} />;
      case 'Échoué': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} />
          Retour
        </button>

        <h1 className="text-3xl font-black mb-8">Historique des paiements</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {payments.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/50 rounded-[2rem] border border-zinc-800">
                <CreditCard size={48} className="mx-auto text-zinc-700 mb-4" />
                <p className="text-zinc-500">Aucun paiement enregistré</p>
              </div>
            ) : (
              payments.map((payment) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={payment.id} 
                  className="bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{payment.tournament_name}</h3>
                      <p className="text-zinc-500 text-xs">
                        {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold ${getStatusStyle(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      {payment.status}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                    <p className="text-violet-400 font-black text-xl">{payment.amount} FCFA</p>
                    
                    {payment.status === 'Réussi' && (
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 bg-zinc-800 px-3 py-2 rounded-xl border border-zinc-700">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase">Code:</span>
                          <span className="text-white font-mono font-bold">{generateValidationCode(payment.id)}</span>
                          <button onClick={() => copyToClipboard(generateValidationCode(payment.id))} className="text-zinc-500 hover:text-white">
                            <Copy size={14} />
                          </button>
                        </div>
                        <button 
                          onClick={() => handleSendWhatsApp(payment)}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                        >
                          <MessageSquare size={14} />
                          Valider sur WhatsApp
                        </button>
                      </div>
                    )}
                  </div>
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