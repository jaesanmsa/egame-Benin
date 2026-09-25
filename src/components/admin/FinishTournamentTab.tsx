"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { History, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FinishTournamentTabProps {
  activeTournaments: any[];
  finishData: {
    tournamentId: string;
    winnerName: string;
  };
  setFinishData: (data: { tournamentId: string; winnerName: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const FinishTournamentTab = ({ activeTournaments, finishData, setFinishData, onSubmit }: FinishTournamentTabProps) => {
  const selectedTournament = activeTournaments.find((t) => t.id === finishData.tournamentId);
  const isTestTournament = !!selectedTournament?.is_test;

  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={onSubmit} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-8">
      <h2 className="text-xl font-black flex items-center gap-3"><History className="text-orange-500" /> Terminer un tournoi</h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Sélectionner le tournoi</Label>
          <Select value={finishData.tournamentId} onValueChange={(tournamentId) => setFinishData({ ...finishData, tournamentId })} required>
            <SelectTrigger className="py-7 bg-muted/50 border-border rounded-2xl text-sm font-bold">
              <SelectValue placeholder="Choisir un tournoi actif" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {activeTournaments.map((tournament) => (
                <SelectItem key={tournament.id} value={tournament.id} className="font-bold">
                  {tournament.is_test ? `🧪 ${tournament.title} (ESSAI)` : tournament.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isTestTournament ? (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 space-y-3">
            <p className="text-sm font-black text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle size={18} /> Tournoi d'essai sélectionné
            </p>
            <p className="text-xs font-bold text-amber-700 dark:text-amber-300 leading-relaxed">
              Sa clôture le supprimera <span className="underline">définitivement</span> de la base de données : paiements, tickets et statistiques seront effacés. Aucun point ne sera attribué et aucune notification ne sera envoyée.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="winner-name" className="text-[10px] font-black uppercase tracking-widest ml-1">Pseudo du gagnant (1ère place)</Label>
            <Input
              id="winner-name"
              placeholder="Pseudo du champion"
              value={finishData.winnerName}
              onChange={(event) => setFinishData({ ...finishData, winnerName: event.target.value })}
              className="py-6 bg-muted/50 border-border rounded-xl"
              required
            />
          </div>
        )}
      </div>

      {isTestTournament ? (
        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 py-8 rounded-2xl font-black text-base shadow-xl shadow-red-500/20 text-white">
          <Trash2 size={20} className="mr-2" />
          Supprimer définitivement ce tournoi d'essai
        </Button>
      ) : (
        <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 py-8 rounded-2xl font-black text-base shadow-xl shadow-orange-500/20 text-white">
          Clôturer et publier le résultat
        </Button>
      )}
    </motion.form>
  );
};

export default FinishTournamentTab;
