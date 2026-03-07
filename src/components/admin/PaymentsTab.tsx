"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PaymentsTabProps {
  payments: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const PaymentsTab = ({ payments, searchQuery, setSearchQuery }: PaymentsTabProps) => {
  const filteredPayments = payments.filter(pay => {
    const query = searchQuery.toLowerCase();
    return (
      pay.validation_code?.toLowerCase().includes(query) ||
      pay.profiles?.username?.toLowerCase().includes(query) ||
      pay.profiles?.full_name?.toLowerCase().includes(query) ||
      pay.tournament_name?.toLowerCase().includes(query)
    );
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <h2 className="text-xl font-black flex items-center gap-3"><CreditCard className="text-violet-500" /> Historique des Flux</h2>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-3.5 text-muted-foreground" size={18} />
          <Input 
            placeholder="Rechercher un code ou pseudo..." 
            className="pl-12 py-6 bg-muted/50 border-border rounded-2xl focus:ring-violet-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <Search size={40} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-bold italic">Aucune transaction trouvée</p>
          </div>
        ) : (
          filteredPayments.map((pay) => (
            <div key={pay.id} className="bg-muted/30 p-5 rounded-2xl border border-border/50 flex items-center justify-between hover:border-violet-500/30 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pay.status === 'Réussi' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="font-black text-sm">{pay.profiles?.username || pay.profiles?.full_name || "Joueur"}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{pay.tournament_name} • {pay.amount} FCFA</p>
                  {pay.status === 'Réussi' && (
                    <p className="text-[10px] font-mono text-violet-500 mt-1 bg-violet-500/5 px-2 py-0.5 rounded inline-block border border-violet-500/10">Code: {pay.validation_code}</p>
                  )}
                </div>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${pay.status === 'Réussi' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                {pay.status}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default PaymentsTab;