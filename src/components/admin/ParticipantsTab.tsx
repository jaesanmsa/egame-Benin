"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Users, User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';

interface ParticipantsTabProps {
  activeTournaments: any[];
  fetchParticipants: (id: string) => void;
  selectedTournamentId: string;
  participants: any[];
}

const ParticipantsTab = ({ activeTournaments, fetchParticipants, selectedTournamentId, participants }: ParticipantsTabProps) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
      <h2 className="text-xl font-black mb-8 flex items-center gap-3"><Users className="text-cyan-500" /> Liste des Champions</h2>
      
      <div className="mb-10">
        <Label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sélectionner un tournoi actif</Label>
        <Select onValueChange={fetchParticipants}>
          <SelectTrigger className="py-7 bg-muted/50 border-border rounded-2xl text-sm font-bold">
            <SelectValue placeholder="Choisir un tournoi" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {activeTournaments.map(t => (
              <SelectItem key={t.id} value={t.id} className="font-bold">{t.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTournamentId && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{participants.length} Joueurs confirmés</p>
            <Button variant="outline" size="sm" className="text-[9px] font-black uppercase tracking-widest rounded-xl h-8">Exporter CSV</Button>
          </div>
          {participants.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-3xl border border-dashed border-border">
              <Users size={32} className="mx-auto text-muted-foreground/20 mb-3" />
              <p className="text-muted-foreground text-xs font-bold italic">Aucun joueur inscrit pour le moment.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {participants.map((p, i) => (
                <div key={i} className="bg-muted/30 p-5 rounded-2xl border border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-violet-600/10 rounded-full flex items-center justify-center text-violet-500 border border-violet-500/20">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="font-black text-sm">{p.profiles?.username || "Sans pseudo"}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{p.profiles?.full_name} • {p.profiles?.city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-violet-500">{p.profiles?.phone || "Pas de numéro"}</p>
                    <p className="text-[9px] text-muted-foreground font-mono mt-1">{p.validation_code}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ParticipantsTab;