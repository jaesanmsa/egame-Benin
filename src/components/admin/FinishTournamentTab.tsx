"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FinishTournamentTabProps {
  activeTournaments: any[];
  finishData: any;
  setFinishData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const FinishTournamentTab = ({ activeTournaments, finishData, setFinishData, onSubmit }: FinishTournamentTabProps) => {
  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={onSubmit} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-8">
      <h2 className="text-xl font-black flex items-center gap-3"><History className="text-orange-500" /> Terminer un tournoi</h2>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Sélectionner le tournoi</Label>
          <Select onValueChange={(v) => setFinishData({...finishData, tournamentId: v})}>
            <SelectTrigger className="py-7 bg-muted/50 border-border rounded-2xl text-sm font-bold">
              <SelectValue placeholder="Choisir un tournoi actif" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {activeTournaments.map(t => (
                <SelectItem key={t.id} value={t.id} className="font-bold">{t.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Pseudo du gagnant</Label>
          <Input placeholder="Nom du champion" value={finishData.winnerName} onChange={e => setFinishData({...finishData, winnerName: e.target.value})} className="py-6 bg-muted/50 border-border rounded-xl" required />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Lien Avatar du gagnant (Emoji)</Label>
          <Input placeholder="ex: 🏆" value={finishData.winnerAvatar} onChange={e => setFinishData({...finishData, winnerAvatar: e.target.value})} className="py-6 bg-muted/50 border-border rounded-xl" />
        </div>
      </div>
      <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 py-8 rounded-2xl font-black text-base shadow-xl shadow-orange-500/20 text-white">Clôturer et afficher le gagnant</Button>
    </motion.form>
  );
};

export default FinishTournamentTab;