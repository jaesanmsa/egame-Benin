"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { History, Trash2, AlertTriangle, Trophy, Medal, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const PODIUM_REWARDS = { first: 50, second: 20, third: 10 };

interface FinishTournamentTabProps {
  activeTournaments: any[];
  finishData: {
    tournamentId: string;
    winnerName: string;
    secondPlace: string;
    thirdPlace: string;
    mvpName: string;
  };
  setFinishData: (data: {
    tournamentId: string;
    winnerName: string;
    secondPlace: string;
    thirdPlace: string;
    mvpName: string;
  }) => void;
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
          <>
            <div className="space-y-2">
              <Label htmlFor="winner-name" className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                <Trophy size={14} className="text-[#FFD700]" /> Pseudo du gagnant — 1ère place (obligatoire)
              </Label>
              <Input
                id="winner-name"
                placeholder="Pseudo du champion"
                value={finishData.winnerName}
                onChange={(event) => setFinishData({ ...finishData, winnerName: event.target.value })}
                className="py-6 bg-muted/50 border-[#FFD700]/30 rounded-xl"
                required
              />
              <p className="text-[10px] font-bold text-muted-foreground">+1 Victoire sur son profil et +{PODIUM_REWARDS.first} points eGame</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="second-place" className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Medal size={14} className="text-slate-300" /> 2ème place (optionnel)
                </Label>
                <Input
                  id="second-place"
                  placeholder="Pseudo du finaliste"
                  value={finishData.secondPlace}
                  onChange={(event) => setFinishData({ ...finishData, secondPlace: event.target.value })}
                  className="py-6 bg-muted/50 border-border rounded-xl"
                />
                <p className="text-[10px] font-bold text-muted-foreground">+{PODIUM_REWARDS.second} points eGame</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="third-place" className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Medal size={14} className="text-orange-400" /> 3ème place (optionnel)
                </Label>
                <Input
                  id="third-place"
                  placeholder="Pseudo de la 3ème place"
                  value={finishData.thirdPlace}
                  onChange={(event) => setFinishData({ ...finishData, thirdPlace: event.target.value })}
                  className="py-6 bg-muted/50 border-border rounded-xl"
                />
                <p className="text-[10px] font-bold text-muted-foreground">+{PODIUM_REWARDS.third} points eGame</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mvp-name" className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                <Star size={14} className="text-orange-400" /> MVP du tournoi (optionnel)
              </Label>
              <Input
                id="mvp-name"
                placeholder="Pseudo du MVP — le meilleur joueur du tournoi"
                value={finishData.mvpName}
                onChange={(event) => setFinishData({ ...finishData, mvpName: event.target.value })}
                className="py-6 bg-muted/50 border-orange-500/20 rounded-xl"
              />
              <p className="text-[10px] font-bold text-muted-foreground">+1 MVP sur son profil. Un joueur peut gagner sans être MVP, ce champ n'est pas obligatoire.</p>
            </div>
          </>
        )}
      </div>

      {isTestTournament ? (
        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 py-8 rounded-2xl font-black text-base shadow-xl shadow-red-500/20 text-white">
          <Trash2 size={20} className="mr-2" />
          Supprimer définitivement ce tournoi d'essai
        </Button>
      ) : (
        <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 py-8 rounded-2xl font-black text-base shadow-xl shadow-orange-500/20 text-white">
          Clôturer et publier les résultats
        </Button>
      )}
    </motion.form>
  );
};

export default FinishTournamentTab;
