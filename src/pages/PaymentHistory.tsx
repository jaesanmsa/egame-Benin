"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle2, XCircle, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    const loadHistory = () => {
      const history = JSON.parse(localStorage.getItem('payment_history') || '[]');
      
      // Logique d'expiration automatique (1 heure)
      const updatedHistory = history.map((p: Payment) => {
        const createdDate = new Date(p.created_at).getTime();
        const now = new Date().getTime();
        const oneHour = 60 * 60 * 1000;

        if (p.status === 'En attente' && (now - createdDate) > oneHour) {
          return { ...p, status: 'Échoué' };
        }
        return p;
      });

      setPayments(updatedHistory);
      localStorage.setItem('payment_history', JSON.stringify(updatedHistory));
    };

    loadHistory();
  }, []);

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
          Retour au profil
        </button>

        <h1 className="text-3xl font-black mb-8">Historique des paiements</h1>

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

        <div className="mt-12 p-6 bg-violet-600/10 border border-violet-500/20 rounded-2xl">
          <p className="text-sm text-zinc-400 leading-relaxed">
            <span className="text-violet-400 font-bold">Note :</span> Les paiements sont vérifiés manuellement par notre équipe. Si votre paiement n'est pas validé après 1 heure, il sera marqué comme échoué. En cas de problème, contactez le support.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PaymentHistory;