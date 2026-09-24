"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Search, TrendingUp, Ticket, Trophy, Calendar, CheckCircle2, ChevronRight, ArrowLeft, Clock, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PaymentsTabProps {
  tournaments: any[];
  payments: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const GATEWAY_LABELS: Record<string, string> = {
  kkiapay: 'KKiaPay',
  fedapay: 'FedaPay',
  maketou: 'Maketou',
  manuel: 'Manuel (hors site)'
};

const playerOf = (pay: any) => pay.profiles?.username || pay.profiles?.full_name || 'Joueur';

const fmtDay = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const fmtShort = (d: string) =>
  `${new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} · ${new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;

const PaymentsTab = ({ tournaments, payments, searchQuery, setSearchQuery }: PaymentsTabProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const successPayments = (tournamentId: string) =>
    payments
      .filter(pay => pay.tournament_id === tournamentId && pay.status === 'Réussi')
      .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));

  const query = searchQuery.toLowerCase();
  const matchesSearch = (t: any) =>
    !query || t.title?.toLowerCase().includes(query) || t.game?.toLowerCase().includes(query);

  const ongoing = tournaments.filter(t => t.status === 'active' && matchesSearch(t));
  const archived = tournaments
    .filter(t => t.status !== 'active' && matchesSearch(t))
    .sort((a, b) => +new Date(b.start_date ?? b.created_at ?? 0) - +new Date(a.start_date ?? a.created_at ?? 0));

  const attributedIds = new Set(tournaments.map(t => t.id));
  const orphans = payments.filter(pay => !attributedIds.has(pay.tournament_id));

  const totalCollected = payments
    .filter(pay => pay.status === 'Réussi')
    .reduce((sum, pay) => sum + (parseInt(pay.amount, 10) || 0), 0);
  const totalTicketsSold = tournaments.reduce((sum, t) => sum + successPayments(t.id).length, 0);

  /* ---------------------------- Vue détail d'un tournoi ---------------------------- */
  const selected = tournaments.find(t => t.id === selectedId);

  if (selected) {
    const paid = successPayments(selected.id);
    const ticketCount = Math.max(selected.max_participants || 40, paid.length);
    const caisse = paid.reduce((sum, pay) => sum + (parseInt(pay.amount, 10) || 0), 0);
    const isFinished = selected.status !== 'active';

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-6 md:p-8 rounded-[2.5rem] border border-border shadow-sm space-y-8">
        <button onClick={() => setSelectedId(null)} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-violet-500 transition-colors">
          <ArrowLeft size={16} /> Retour aux tournois
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isFinished ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                {isFinished ? 'Clôturé' : 'En cours'}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-violet-500">{selected.game}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black truncate">{selected.title}</h2>
            <p className="text-[11px] text-muted-foreground font-bold capitalize mt-1 flex items-center gap-1.5">
              <Calendar size={12} /> {fmtDay(selected.start_date ?? selected.created_at)}
            </p>
            {isFinished && selected.winner_name && (
              <p className="text-[11px] font-black text-amber-500 flex items-center gap-1.5 mt-1">
                <Trophy size={12} /> Champion : {selected.winner_name}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-2.5">
              <TrendingUp size={15} className="text-emerald-500" />
              <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">{caisse.toLocaleString('fr-FR')} <span className="text-muted-foreground font-bold">FCFA</span></p>
            </div>
            <div className="flex items-center gap-2.5 bg-muted/40 border border-border/60 rounded-2xl px-4 py-2.5">
              <Ticket size={15} className="text-violet-500" />
              <p className="text-xs font-black">{paid.length}<span className="text-muted-foreground font-bold"> / {selected.max_participants || 40} payés</span></p>
            </div>
          </div>
        </div>

        {/* Grille des tickets : cochés = payés */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Ticket size={15} className="text-violet-500" /> Tickets du tournoi
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: ticketCount }, (_, i) => {
              const pay = paid[i];
              return pay ? (
                <div key={i} className="rounded-2xl border border-green-500/30 bg-green-500/10 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-green-600 dark:text-green-400">#{i + 1}</span>
                    <CheckCircle2 size={14} className="text-green-500" />
                  </div>
                  <p className="text-[11px] font-black truncate">{playerOf(pay)}</p>
                  {pay.validation_code && (
                    <p className="text-[9px] font-mono text-violet-500 bg-violet-500/10 border border-violet-500/20 rounded px-1.5 py-0.5 inline-block">
                      Code: {pay.validation_code}
                    </p>
                  )}
                  <p className="text-[9px] text-muted-foreground">{fmtShort(pay.created_at)}</p>
                </div>
              ) : (
                <div key={i} className="rounded-2xl border border-dashed border-border bg-muted/20 p-3 space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground/70">#{i + 1}</span>
                  <p className="text-[11px] font-black text-muted-foreground/70">Disponible</p>
                  <p className="text-[9px] text-muted-foreground/50">{parseInt(selected.entry_fee, 10) || 0} FCFA</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Historique des paiements du tournoi */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <CreditCard size={15} className="text-violet-500" /> Historique des paiements ({paid.length})
          </h3>
          {paid.length === 0 ? (
            <div className="text-center py-10">
              <CreditCard size={36} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-bold italic text-sm">Aucun ticket payé pour ce tournoi pour le moment</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {paid.map((pay) => (
                <div key={pay.id} className="bg-muted/30 p-5 rounded-2xl border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center bg-green-500/10 text-green-500">
                      <CheckCircle2 size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-sm">{playerOf(pay)}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{pay.amount} FCFA • {fmtShort(pay.created_at)}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {pay.validation_code && (
                          <span className="text-[10px] font-mono text-violet-500 bg-violet-500/5 px-2 py-0.5 rounded border border-violet-500/10">Code: {pay.validation_code}</span>
                        )}
                        {pay.gateway && (
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">{GATEWAY_LABELS[pay.gateway] || pay.gateway}</span>
                        )}
                        {pay.fedapay_transaction_id && (
                          <span className="text-[9px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/50"># {pay.fedapay_transaction_id}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="self-start sm:self-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-green-500/10 text-green-500 border border-green-500/20">
                    Payé
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  /* ------------------------- Vue liste des tournois ------------------------- */
  const TournamentCard = ({ t }: { t: any }) => {
    const sold = successPayments(t.id).length;
    const caisse = successPayments(t.id).reduce((sum, pay) => sum + (parseInt(pay.amount, 10) || 0), 0);
    const isFinished = t.status !== 'active';
    return (
      <button onClick={() => setSelectedId(t.id)} className="w-full text-left bg-muted/30 p-5 rounded-2xl border border-border/50 flex items-center justify-between gap-4 hover:border-violet-500/40 transition-all group">
        <div className="flex items-center gap-4 min-w-0">
          <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${isFinished ? 'bg-amber-500/10 text-amber-500' : 'bg-violet-500/10 text-violet-500'}`}>
            {isFinished ? <Trophy size={20} /> : <Ticket size={20} />}
          </div>
          <div className="min-w-0">
            <p className="font-black text-sm truncate">{t.title}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest truncate">{t.game} • {fmtDay(t.start_date ?? t.created_at)}</p>
            <p className="text-[10px] font-bold mt-1">
              <span className="text-emerald-600 dark:text-emerald-400">{caisse.toLocaleString('fr-FR')} FCFA</span>
              <span className="text-muted-foreground"> • {sold}/{t.max_participants || 40} tickets payés</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`hidden sm:inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isFinished ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
            {isFinished ? 'Clôturé' : 'En cours'}
          </span>
          <ChevronRight size={18} className="text-muted-foreground group-hover:text-violet-500 transition-colors" />
        </div>
      </button>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-6 md:p-8 rounded-[2.5rem] border border-border shadow-sm space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="text-xl font-black flex items-center gap-3"><CreditCard className="text-violet-500" /> Historique des Flux</h2>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-3.5 text-muted-foreground" size={18} />
          <Input
            placeholder="Rechercher un tournoi..."
            className="pl-12 py-6 bg-muted/50 border-border rounded-2xl focus:ring-violet-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2.5 bg-muted/40 border border-border/60 rounded-2xl px-4 py-2.5">
          <Ticket size={15} className="text-violet-500" />
          <p className="text-xs font-black">{totalTicketsSold} <span className="text-muted-foreground font-bold">tickets vendus</span></p>
        </div>
        <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-2.5">
          <TrendingUp size={15} className="text-emerald-500" />
          <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">{totalCollected.toLocaleString('fr-FR')} <span className="text-muted-foreground font-bold">FCFA encaissés (caisse globale)</span></p>
        </div>
      </div>

      {/* Tournois en cours */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Clock size={15} className="text-emerald-500" /> Tournois en cours ({ongoing.length})
        </h3>
        {ongoing.length === 0 ? (
          <p className="text-muted-foreground font-bold italic text-sm py-2">Aucun tournoi en cours.</p>
        ) : (
          <div className="grid gap-4">
            {ongoing.map(t => <TournamentCard key={t.id} t={t} />)}
          </div>
        )}
      </div>

      {/* Historique des tournois clôturés */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Trophy size={15} className="text-amber-500" /> Historique des tournois ({archived.length})
        </h3>
        {archived.length === 0 ? (
          <p className="text-muted-foreground font-bold italic text-sm py-2">Aucun tournoi clôturé pour le moment.</p>
        ) : (
          <div className="grid gap-4">
            {archived.map(t => <TournamentCard key={t.id} t={t} />)}
          </div>
        )}
      </div>

      {/* Paiements non attribués (webhooks sans correspondance) */}
      {orphans.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
            <AlertTriangle size={15} /> Paiements non attribués ({orphans.length})
          </h3>
          <div className="grid gap-3">
            {orphans.map(pay => (
              <div key={pay.id} className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 text-xs font-bold">
                <p className="font-black">{pay.tournament_name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                  {pay.amount} FCFA • {fmtShort(pay.created_at)}
                  {pay.gateway ? ` • ${GATEWAY_LABELS[pay.gateway] || pay.gateway}` : ''}
                  {pay.fedapay_transaction_id ? ` • # ${pay.fedapay_transaction_id}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PaymentsTab;
