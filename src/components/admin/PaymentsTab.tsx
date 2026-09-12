"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Search, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PaymentsTabProps {
  payments: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const GATEWAY_LABELS: Record<string, string> = {
  kkiapay: 'KKiaPay',
  fedapay: 'FedaPay',
  maketou: 'Maketou'
};

const PaymentsTab = ({ payments, searchQuery, setSearchQuery }: PaymentsTabProps) => {
  const filteredPayments = payments.filter(pay => {
    const query = searchQuery.toLowerCase();
    return (
      pay.validation_code?.toLowerCase().includes(query) ||
      pay.fedapay_transaction_id?.toLowerCase().includes(query) ||
      pay.profiles?.username?.toLowerCase().includes(query) ||
      pay.profiles?.full_name?.toLowerCase().includes(query) ||
      pay.tournament_name?.toLowerCase().includes(query)
    );
  });

  const totalCollected = filteredPayments
    .filter(pay => pay.status === 'Réussi')
    .reduce((sum, pay) => sum + (parseInt(pay.amount, 10) || 0), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
        <h2 className="text-xl font-black flex items-center gap-3"><CreditCard className="text-violet-500" /> Historique des Flux</h2>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-3.5 text-muted-foreground" size={18} />
          <Input 
            placeholder="Rechercher un code, pseudo ou transaction..." 
            className="pl-12 py-6 bg-muted/50 border-border rounded-2xl focus:ring-violet-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex items-center gap-2.5 bg-muted/40 border border-border/60 rounded-2xl px-4 py-2.5">
          <CreditCard size={15} className="text-violet-500" />
          <p className="text-xs font-black">{filteredPayments.length} <span className="text-muted-foreground font-bold">transaction{filteredPayments.length > 1 ? 's' : ''}</span></p>
        </div>
        <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-2.5">
          <TrendingUp size={15} className="text-emerald-500" />
          <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">{totalCollected.toLocaleString('fr-FR')} <span className="text-muted-foreground font-bold">FCFA encaissés</span></p>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <Search size={40} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-bold italic">Aucune transaction trouvée</p>
          </div>
        ) : (
          filteredPayments.map((pay) => {
            const gatewayLabel = pay.gateway ? GATEWAY_LABELS[pay.gateway] || pay.gateway : null;
            return (
              <div key={pay.id} className="bg-muted/30 p-5 rounded-2xl border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-violet-500/30 transition-all">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${pay.status === 'Réussi' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                    <CreditCard size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-sm">{pay.profiles?.username || pay.profiles?.full_name || "Joueur"}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest truncate">{pay.tournament_name} • {pay.amount} FCFA</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {pay.status === 'Réussi' && pay.validation_code && (
                        <span className="text-[10px] font-mono text-violet-500 bg-violet-500/5 px-2 py-0.5 rounded border border-violet-500/10">Code: {pay.validation_code}</span>
                      )}
                      {gatewayLabel && (
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">{gatewayLabel}</span>
                      )}
                      {pay.fedapay_transaction_id && (
                        <span className="text-[9px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/50" title="Référence passerelle"># {pay.fedapay_transaction_id}</span>
                      )}
                      <span className="text-[9px] text-muted-foreground/80">{new Date(pay.created_at).toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
                <div className={`self-start sm:self-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${pay.status === 'Réussi' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                  {pay.status}
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default PaymentsTab;
