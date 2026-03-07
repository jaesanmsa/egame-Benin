"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LeaderboardTabProps {
  newLeader: any;
  setNewLeader: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const LeaderboardTab = ({ newLeader, setNewLeader, onSubmit }: LeaderboardTabProps) => {
  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={onSubmit} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-8">
      <h2 className="text-xl font-black flex items-center gap-3"><Star className="text-yellow-500" /> Modifier le Top 5</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Rang (1-5)</Label>
          <Input type="number" min="1" max="5" value={newLeader.rank} onChange={e => setNewLeader({...newLeader, rank: parseInt(e.target.value)})} className="py-6 bg-muted/50 border-border rounded-xl" required />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Discipline</Label>
          <Select onValueChange={(v) => setNewLeader({...newLeader, game_id: v})} defaultValue="blur">
            <SelectTrigger className="py-6 bg-muted/50 border-border rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="blur" className="font-bold">Blur</SelectItem>
              <SelectItem value="cod-mw4" className="font-bold">COD MW4</SelectItem>
              <SelectItem value="cod-mobile" className="font-bold">COD Mobile</SelectItem>
              <SelectItem value="bombsquad" className="font-bold">BombSquad</SelectItem>
              <SelectItem value="clash-royale" className="font-bold">Clash Royale</SelectItem>
              <SelectItem value="clash-of-clans" className="font-bold">Clash of Clans</SelectItem>
              <SelectItem value="free-fire" className="font-bold">Free Fire</SelectItem>
              <SelectItem value="pubg-mobile" className="font-bold">PUBG Mobile</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Pseudo</Label>
          <Input placeholder="Nom du joueur" value={newLeader.username} onChange={e => setNewLeader({...newLeader, username: e.target.value})} className="py-6 bg-muted/50 border-border rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Points</Label>
          <Input type="number" value={newLeader.wins} onChange={e => setNewLeader({...newLeader, wins: parseInt(e.target.value)})} className="py-6 bg-muted/50 border-border rounded-xl" />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Lien Avatar Emoji</Label>
          <Input placeholder="ex: 🎮" value={newLeader.avatar_url} onChange={e => setNewLeader({...newLeader, avatar_url: e.target.value})} className="py-6 bg-muted/50 border-border rounded-xl" />
        </div>
      </div>
      <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 py-8 rounded-2xl font-black text-base shadow-xl shadow-violet-500/20 text-white">Mettre à jour le classement</Button>
    </motion.form>
  );
};

export default LeaderboardTab;