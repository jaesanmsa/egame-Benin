"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle2, XCircle, CreditCard, MessageSquare, Copy, Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { showSuccess } from '@/utils/toast';

interface Payment {
  id: string;
  tournament_name: string;
  amount: string;
  status: 'En attente' | 'Réussi' | 'Échoué';
  created_at: string;
  validation_code: string;
  tournaments: {
    access_code: string;
  };
}

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const whatsappNumber = "2290141790790";

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        tournaments (
          access_code
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPayments(data as any);
    }
    setLoading(false);
  };

  const handleSendWhatsApp = (payment: Payment) => {
    const message = encodeURIComponent(`Bonjour eGame Bénin, voici mon code de validation pour le tournoi ${payment.tournament_name} : ${payment.validation_code}`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess("Copié !");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} />
          Retour
        </button>

        <h1 className="text-3xl font-black mb-8">Mes Inscriptions</h1>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-6">
            {payments.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/50 rounded-[2rem] border border-zinc-800">
                <CreditCard size={48} className="mx-auto text-zinc-700 mb-4" />
                <p className="text-zinc-500">Aucune inscription</p>
              </div>
            ) : (
              payments.map((payment) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={payment.id} className="bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{payment.tournament_name}</h3>
                      <p className="text-zinc-500 text-xs">{new Date(payment.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold ${payment.status === 'Réussi' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                      {payment.status === 'Réussi' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      {payment.status}
                    </div>
                  </div>

                  {payment.status === 'Réussi' ? (
                    <div className="space-y-4">
                      {/* Code d'accès au tournoi (ID Salle / MDP) */}
                      <div className="bg-violet-600/10 border border-violet-500/20 p-4 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2 text-violet-400">
                          <Gamepad2 size={16} />
                          <span className="text-xs font-bold uppercase tracking-widest">Accès au tournoi</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white font-mono font-bold text-lg">{payment.tournaments?.access_code || "Code bientôt disponible"}</span>
                          {payment.tournaments?.access_code && (
                            <button onClick={() => copyToClipboard(payment.tournaments.access_code)} className="text-violet-400 hover:text-white"><Copy size={18} /></button>
                          )}
                        </div>
                      </div>

                      {/* Code de validation (Preuve de paiement) */}
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase">Preuve de paiement</span>
                          <span className="text-white font-mono font-bold">{payment.validation_code}</span>
                        </div>
                        <button onClick={() => handleSendWhatsApp(payment)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">
                          <MessageSquare size={14} /> Valider sur WhatsApp
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-zinc-800/50 rounded-2xl text-center">
                      <p className="text-zinc-500 text-xs">Le code d'accès s'affichera ici une fois le paiement validé par l'admin.</p>
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