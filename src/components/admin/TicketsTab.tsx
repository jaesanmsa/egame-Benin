"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Ticket, Copy, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { showError, showSuccess } from "@/utils/toast";

interface TicketRow {
  id: string;
  username: string;
  code: string;
  status: string;
  created_at: string;
  validated_at: string | null;
}

const TicketsTab = ({ tournaments }: { tournaments: any[] }) => {
  const [selectedTournament, setSelectedTournament] = useState<string>("");
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Par défaut : premier tournoi gratuit, sinon premier tournoi.
  useEffect(() => {
    if (!selectedTournament && tournaments.length > 0) {
      const free = tournaments.find((t: any) => Number(t.entry_fee) === 0);
      setSelectedTournament((free || tournaments[0]).id);
    }
  }, [tournaments, selectedTournament]);

  const fetchTickets = async () => {
    if (!selectedTournament) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("tournament_id", selectedTournament)
      .order("created_at", { ascending: false });
    if (error) showError("Impossible de charger les tickets : " + error.message);
    setTickets((data as TicketRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTournament]);

  // Cocher / décocher un ticket validé par l'IA WhatsApp.
  const toggleTicket = async (ticket: TicketRow, valide: boolean) => {
    setTickets((list) =>
      list.map((t) =>
        t.id === ticket.id
          ? { ...t, status: valide ? "valide" : "en_attente", validated_at: valide ? new Date().toISOString() : null }
          : t
      )
    );
    const { error } = await supabase
      .from("tickets")
      .update({ status: valide ? "valide" : "en_attente", validated_at: valide ? new Date().toISOString() : null })
      .eq("id", ticket.id);
    if (error) {
      showError("Mise à jour impossible : " + error.message);
      fetchTickets();
    } else {
      showSuccess(valide ? `Ticket ${ticket.code} validé ✅` : `Ticket ${ticket.code} remis en attente`);
    }
  };

  // Copier la liste des tickets (code + joueur) pour la coller à l'IA WhatsApp.
  const copyForAI = async () => {
    if (tickets.length === 0) return;
    const lines = tickets.map((t) => `${t.code} — ${t.username}`);
    await navigator.clipboard.writeText(lines.join("\n"));
    showSuccess(`${tickets.length} tickets copiés ! Colle-les à ton IA sur WhatsApp.`);
  };

  const validCount = tickets.filter((t) => t.status === "valide").length;
  const pendingCount = tickets.length - validCount;

  if (tournaments.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm text-center text-sm text-muted-foreground">
        Crée d'abord un tournoi pour gérer ses tickets.
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-card p-6 md:p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-black flex items-center gap-3">
            <Ticket className="text-violet-500" /> Tickets des tournois gratuits
          </h2>
          <div className="flex items-center gap-3">
            <Select value={selectedTournament} onValueChange={setSelectedTournament}>
              <SelectTrigger className="w-56 bg-muted/50 border-border rounded-xl py-4 text-xs font-bold">
                <SelectValue placeholder="Choisir un tournoi" />
              </SelectTrigger>
              <SelectContent>
                {tournaments.map((t: any) => (
                  <SelectItem key={t.id} value={t.id} className="font-bold">
                    {t.title} {Number(t.entry_fee) === 0 ? "· Gratuit" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchTickets} variant="outline" className="rounded-xl py-4 px-4" aria-label="Rafraîchir">
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>

        {/* Barre d'outils : stats + copie pour l'IA WhatsApp */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/40 border border-border rounded-2xl p-4">
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-foreground">{tickets.length} tickets</span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 size={14} /> {validCount} validés
            </span>
            <span className="flex items-center gap-1.5 text-orange-500">
              <Clock size={14} /> {pendingCount} en attente
            </span>
          </div>
          <Button
            onClick={copyForAI}
            disabled={tickets.length === 0}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-3 px-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
          >
            <Copy size={14} /> Copier pour l'IA WhatsApp
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Aucun ticket pour ce tournoi pour le moment.<br />
            Les joueurs inscrits à un tournoi gratuit recevront leur ticket automatiquement.
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-colors ${
                  t.status === "valide" ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300" : "bg-muted/30 border-border"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <Switch checked={t.status === "valide"} onCheckedChange={(v) => toggleTicket(t, v)} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${t.status === "valide" ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {t.status === "valide" ? "Validé" : "Attente"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono font-black text-sm tracking-wider text-foreground">{t.code}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t.username} • inscrit le {new Date(t.created_at).toLocaleString("fr-FR")}
                    </p>
                    {t.status === "valide" && t.validated_at && (
                      <p className="text-[10px] text-emerald-600 font-bold">
                        Confirmé le {new Date(t.validated_at).toLocaleString("fr-FR")} — ticket plus disponible
                      </p>
                    )}
                  </div>
                </div>
                {t.status === "valide" ? (
                  <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-full">
                    ✅ Confirmé
                  </span>
                ) : (
                  <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-100 border border-orange-300 px-3 py-1.5 rounded-full">
                    ⏳ À confirmer
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TicketsTab;
