"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle2, XCircle, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

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

  useEffect(() => {
    fetchPayments();

    // ÉCOUTE EN TEMPS RÉEL : L'application se met à jour toute seule
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => {
          fetchPayments(); // On recharge les données dès qu'un changement arrive
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
      setPayments(data);
    }
    setLoading(false);
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
          <div className="space-y-4">
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
                  className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-lg">{payment.tournament_name}</h3>
                    <p className="text-zinc-500 text-sm">
                      {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                    <p className="text-violet-400 font-black mt-1">{payment.amount} FCFA</p>
                  </div>
                  
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold ${getStatusStyle(payment.status)}`}>
                    {getStatusIcon(payment.status)}
                    {payment.status}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        <div className="mt-12 p-6 bg-violet-600/10 border border-violet-500/20 rounded-2xl">
          <p className="text-sm text-zinc-400 leading-relaxed">
            <span className="text-violet-400 font-bold">Note :</span> Les paiements sont désormais vérifiés automatiquement via FedaPay.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PaymentHistory;