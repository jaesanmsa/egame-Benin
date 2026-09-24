"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Ticket, Copy, RefreshCw, CheckCircle2, Clock, Minus, Plus, UserPlus, Search, Undo2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { showError, showSuccess } from "@/utils/toast";

interface TicketRow {
  id: string;
  user_id: string | null;
  username: string | null;
  code: string;
  status: string;
  created_at: string;
  validated_at: string | null;
}

interface ProfileHint {
  id: string;
  username: string | null;
  full_name: string | null;
}

interface TicketsTabProps {
  tournaments: any[];
  initialTournamentId?: string;
  refreshTournaments?: () => void | Promise<void>;
}

const TicketsTab = ({ tournaments, initialTournamentId, refreshTournaments }: TicketsTabProps) => {
  const [selectedTournament, setSelectedTournament] = useState<string>(initialTournamentId || "");
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  // Attribution manuelle : recherche de joueur inscrit ou pseudo libre.
  const [playerQuery, setPlayerQuery] = useState("");
  const [playerResults, setPlayerResults] = useState<ProfileHint[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<ProfileHint | null>(null);
  const [freePseudo, setFreePseudo] = useState("");

  // Édition en ligne d'un ticket disponible (marquer une place comme prise).
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rowPseudo, setRowPseudo] = useState("");

  const currentTournament = tournaments.find((t: any) => t.id === selectedTournament);

  // Ouvre directement le tournoi venant d'être créé, sinon le premier disponible.
  useEffect(() => {
    if (initialTournamentId && tournaments.some((t: any) => t.id === initialTournamentId)) {
      setSelectedTournament(initialTournamentId);
    } else if (!selectedTournament && tournaments.length > 0) {
      setSelectedTournament(tournaments[0].id);
    }
  }, [initialTournamentId, tournaments, selectedTournament]);

  const fetchTickets = async () => {
    if (!selectedTournament) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("tournament_id", selectedTournament)
      .order("created_at", { ascending: true });
    if (error) showError("Impossible de charger les tickets : " + error.message);
    setTickets((data as TicketRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTournament]);

  // Recherche de joueurs inscrits par pseudo ou nom.
  useEffect(() => {
    const q = playerQuery.trim().replace(/[%(),]/g, "");
    if (q.length < 2 || selectedPlayer) {
      setPlayerResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name")
        .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
        .limit(6);
      setPlayerResults((data as ProfileHint[]) ?? []);
    }, 300);
    return () => clearTimeout(timeout);
  }, [playerQuery, selectedPlayer]);

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

  // Modifier le nombre de places : le stock de tickets s'ajuste automatiquement.
  const changePlaces = async (next: number) => {
    if (!currentTournament || next < 1 || busy) return;
    setBusy(true);
    const { error } = await supabase
      .from("tournaments")
      .update({ max_participants: next })
      .eq("id", selectedTournament);
    if (error) showError("Impossible de modifier les places : " + error.message);
    else {
      showSuccess(`${next} places enregistrées. Le stock de tickets s'est ajusté.`);
      await refreshTournaments?.();
      await fetchTickets();
    }
    setBusy(false);
  };

  // Attribuer un ticket à un joueur inscrit.
  // Tournoi payant : enregistre un paiement manuel « Réussi » (participation + ticket automatiques).
  // Tournoi gratuit : attribue directement un ticket disponible.
  const assignToPlayer = async () => {
    if (!currentTournament || !selectedPlayer || busy) return;
    setBusy(true);
    try {
      const already = tickets.some((k) => k.user_id === selectedPlayer.id);
      if (already) {
        showError(`${selectedPlayer.username || "Ce joueur"} a déjà un ticket pour ce tournoi.`);
        return;
      }

      if (Number(currentTournament.entry_fee) === 0) {
        const { data: avail } = await supabase
          .from("tickets")
          .select("id")
          .eq("tournament_id", selectedTournament)
          .is("user_id", null)
          .is("username", null)
          .order("created_at")
          .limit(1)
          .maybeSingle();

        if (!avail) {
          showError("Plus de ticket disponible : augmente d'abord le nombre de places.");
          return;
        }

        const { data: updated, error } = await supabase
          .from("tickets")
          .update({ user_id: selectedPlayer.id, username: selectedPlayer.username || selectedPlayer.full_name || "Joueur" })
          .eq("id", avail.id)
          .is("user_id", null)
          .select()
          .maybeSingle();

        if (error || !updated) {
          showError("Ce ticket vient d'être pris par un joueur. Réessaie.");
          fetchTickets();
          return;
        }
        showSuccess(`Ticket ${updated.code} attribué à ${updated.username} ✅`);
      } else {
        const { data: payment, error } = await supabase
          .from("payments")
          .insert({
            user_id: selectedPlayer.id,
            tournament_id: selectedTournament,
            tournament_name: currentTournament.title,
            amount: String(currentTournament.entry_fee ?? 0),
            status: "Réussi",
            gateway: "manuel",
            validation_code: `EGB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
          })
          .select()
          .single();

        if (error) {
          showError("Enregistrement impossible : " + error.message);
          return;
        }

        // La base attribue automatiquement un ticket au paiement réussi : on récupère son code.
        const { data: ticket } = await supabase
          .from("tickets")
          .select("id, code")
          .eq("tournament_id", selectedTournament)
          .eq("user_id", selectedPlayer.id)
          .maybeSingle();

        if (ticket?.code) {
          await supabase.from("payments").update({ validation_code: ticket.code }).eq("id", payment.id);
          showSuccess(`${selectedPlayer.username || "Joueur"} : payé & marqué présent. Ticket ${ticket.code} ✅`);
        } else {
          showSuccess(`${selectedPlayer.username || "Joueur"} : payé & marqué présent ✅`);
        }
      }

      setSelectedPlayer(null);
      setPlayerQuery("");
      await refreshTournaments?.();
      await fetchTickets();
    } finally {
      setBusy(false);
    }
  };

  // Marquer une place comme prise par un pseudo (joueur payé hors site, sans compte).
  const assignPseudo = async (ticketId: string | null, pseudo: string) => {
    const name = pseudo.trim();
    if (!selectedTournament || !name || busy) return;
    setBusy(true);
    try {
      let target = ticketId;
      if (!target) {
        const { data: avail } = await supabase
          .from("tickets")
          .select("id")
          .eq("tournament_id", selectedTournament)
          .is("user_id", null)
          .is("username", null)
          .order("created_at")
          .limit(1)
          .maybeSingle();
        if (!avail) {
          showError("Plus de ticket disponible : augmente d'abord le nombre de places.");
          return;
        }
        target = avail.id;
      }

      const { data: updated, error } = await supabase
        .from("tickets")
        .update({ username: name })
        .eq("id", target)
        .is("user_id", null)
        .is("username", null)
        .select()
        .maybeSingle();

      if (error || !updated) {
        showError("Ce ticket vient d'être pris. Réessaie.");
        fetchTickets();
        return;
      }
      showSuccess(`Place marquée comme prise pour ${name} ✅`);
      setFreePseudo("");
      setEditingId(null);
      setRowPseudo("");
      await fetchTickets();
    } finally {
      setBusy(false);
    }
  };

  // Libérer un ticket attribué à un pseudo (jamais un ticket lié à un compte joueur).
  const releasePseudo = async (ticket: TicketRow) => {
    if (busy) return;
    setBusy(true);
    const { error } = await supabase.from("tickets").update({ username: null }).eq("id", ticket.id);
    if (error) showError("Impossible de libérer le ticket : " + error.message);
    else {
      showSuccess(`Ticket ${ticket.code} remis en disponible.`);
      await fetchTickets();
    }
    setBusy(false);
  };

  // Copier tout le stock (code + attribution) pour le transmettre à l'IA WhatsApp.
  const copyForAI = async () => {
    if (tickets.length === 0) return;
    const lines = [
      `Tickets — ${currentTournament?.title || selectedTournament}`,
      ...tickets.map((t) => `${t.code} — ${t.username || "Disponible"}${t.status === "valide" ? " — VALIDÉ" : ""}`)
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    showSuccess(`${tickets.length} tickets copiés ! Colle-les à ton IA sur WhatsApp.`);
  };

  const validCount = tickets.filter((t) => t.status === "valide").length;
  const assignedCount = tickets.filter((t) => t.username || t.user_id).length;
  const availableCount = tickets.length - assignedCount;
  const maxPlaces = currentTournament?.max_participants || 40;
  const isPaid = Number(currentTournament?.entry_fee) !== 0;

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
          <div>
            <h2 className="text-xl font-black flex items-center gap-3">
              <Ticket className="text-violet-500" /> Tickets des tournois
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">Le stock est généré dès la création selon le nombre de places.</p>
          </div>
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
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
            <span className="text-foreground">{maxPlaces} places</span>
            <span className="flex items-center gap-1.5 text-violet-600">
              <Ticket size={14} /> {availableCount} disponibles
            </span>
            <span className="flex items-center gap-1.5 text-orange-500">
              <Clock size={14} /> {assignedCount - validCount} à confirmer
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 size={14} /> {validCount} validés
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

        {/* Gestion du nombre de places */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 border border-border rounded-2xl p-4">
          <div>
            <h3 className="text-sm font-black flex items-center gap-2">
              <Plus size={15} className="text-violet-500" /> Places du tournoi
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Augmente ou diminue à ta guise : le stock de tickets suit automatiquement.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-center">
            <Button
              variant="outline"
              onClick={() => changePlaces(Math.max(1, Number(maxPlaces) - 1))}
              disabled={busy || Number(maxPlaces) <= 1}
              className="rounded-xl h-11 w-11 p-0"
              aria-label="Retirer une place"
            >
              <Minus size={16} />
            </Button>
            <span className="w-16 text-center text-2xl font-black tabular-nums">{maxPlaces}</span>
            <Button
              onClick={() => changePlaces(Number(maxPlaces) + 1)}
              disabled={busy}
              className="rounded-xl h-11 w-11 p-0 bg-violet-600 hover:bg-violet-700 text-white"
              aria-label="Ajouter une place"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>

        {/* Attribution manuelle */}
        <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-4">
          <div>
            <h3 className="text-sm font-black flex items-center gap-2">
              <UserPlus size={15} className="text-violet-500" /> Attribution manuelle
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Pour les paiements non trackés par le site : cherche le joueur, ou marque une place comme prise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Joueur inscrit */}
            <div className="space-y-3 bg-card border border-border rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">Joueur inscrit</p>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-muted-foreground" size={15} />
                <Input
                  placeholder="Pseudo ou nom du joueur..."
                  className="pl-9 bg-muted/50 border-border rounded-xl"
                  value={selectedPlayer ? (selectedPlayer.username || selectedPlayer.full_name || "Joueur") : playerQuery}
                  onChange={(e) => {
                    setSelectedPlayer(null);
                    setPlayerQuery(e.target.value);
                  }}
                  disabled={busy}
                />
              </div>

              {playerResults.length > 0 && !selectedPlayer && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {playerResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPlayer(p);
                        setPlayerResults([]);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl bg-muted/50 hover:bg-violet-500/10 border border-border text-xs font-bold transition-colors"
                    >
                      {p.username || "Sans pseudo"}
                      {p.full_name && p.full_name !== p.username ? <span className="text-muted-foreground"> · {p.full_name}</span> : null}
                    </button>
                  ))}
                </div>
              )}

              <Button
                onClick={assignToPlayer}
                disabled={!selectedPlayer || busy}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                {isPaid ? "Attribuer & marquer payé" : "Attribuer le ticket"}
              </Button>
              {isPaid && (
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Enregistre un paiement manuel « Réussi » : le joueur est compté comme participant et reçoit son ticket.
                </p>
              )}
            </div>

            {/* Pseudo libre */}
            <div className="space-y-3 bg-card border border-border rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">Marquer une place comme prise</p>
              <Input
                placeholder="Pseudo du joueur (sans compte)..."
                className="bg-muted/50 border-border rounded-xl"
                value={freePseudo}
                onChange={(e) => setFreePseudo(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") assignPseudo(null, freePseudo); }}
                disabled={busy}
              />
              <Button
                onClick={() => assignPseudo(null, freePseudo)}
                disabled={!freePseudo.trim() || busy}
                variant="outline"
                className="w-full rounded-xl py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border-violet-500/40 text-violet-600 hover:bg-violet-500/10"
              >
                <Ticket size={14} /> Marquer cette place comme prise
              </Button>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Pour un paiement effectué hors site par un joueur sans compte : la place est décomptée immédiatement.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Aucun ticket pour ce tournoi.<br />
            Vérifie que le tournoi possède au moins une place disponible.
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => {
              const taken = !!(t.username || t.user_id);
              return (
                <div
                  key={t.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-colors ${
                    t.status === "valide" ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300" : "bg-muted/30 border-border"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <Switch disabled={!t.username} checked={t.status === "valide"} onCheckedChange={(v) => toggleTicket(t, v)} />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${t.status === "valide" ? "text-emerald-600" : "text-muted-foreground"}`}>
                        {t.status === "valide" ? "Validé" : t.username ? "Attente" : "Libre"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono font-black text-sm tracking-wider text-foreground">{t.code}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {t.username ? `${t.username}${t.user_id ? " · joueur inscrit" : " · hors site"} · attribué le ${new Date(t.created_at).toLocaleString("fr-FR")}` : "Disponible — pas encore attribué"}
                      </p>
                      {t.status === "valide" && t.validated_at && (
                        <p className="text-[10px] text-emerald-600 font-bold">
                          Confirmé le {new Date(t.validated_at).toLocaleString("fr-FR")} — ticket plus disponible
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {taken ? (
                      t.status === "valide" ? (
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-full">
                          ✅ Confirmé
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-100 border border-orange-300 px-3 py-1.5 rounded-full">
                          ⏳ À confirmer
                        </span>
                      )
                    ) : editingId === t.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          autoFocus
                          placeholder="Pseudo..."
                          className="h-9 w-36 bg-muted/50 border-border rounded-xl text-xs"
                          value={rowPseudo}
                          onChange={(e) => setRowPseudo(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") assignPseudo(t.id, rowPseudo); if (e.key === "Escape") setEditingId(null); }}
                        />
                        <Button
                          size="sm"
                          onClick={() => assignPseudo(t.id, rowPseudo)}
                          disabled={!rowPseudo.trim() || busy}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white h-9 px-3 text-[9px] font-black uppercase tracking-widest"
                        >
                          OK
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() => { setEditingId(t.id); setRowPseudo(""); }}
                        className="rounded-xl h-9 px-3 text-[9px] font-black uppercase tracking-widest text-violet-600 hover:bg-violet-500/10"
                      >
                        <UserPlus size={13} /> Attribuer
                      </Button>
                    )}

                    {taken && !t.user_id && (
                      <Button
                        variant="ghost"
                        onClick={() => releasePseudo(t)}
                        disabled={busy}
                        className="rounded-xl h-9 px-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
                        aria-label="Libérer ce ticket"
                      >
                        <Undo2 size={13} />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TicketsTab;
