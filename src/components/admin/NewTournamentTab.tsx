"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CITIES = ["Cotonou", "Porto-Novo", "Parakou", "Ouidah", "Abomey-Calavi", "Autre"];
const GAMES = ["Free Fire", "Clash Royale", "Clash of Clans", "COD Mobile", "PUBG Mobile", "Blur", "COD MW4", "BombSquad", "Autre"];

interface NewTournamentTabProps {
  newTournament: any;
  setNewTournament: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const NewTournamentTab = ({ newTournament, setNewTournament, onSubmit }: NewTournamentTabProps) => {
  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={onSubmit} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-8">
      <h2 className="text-xl font-black flex items-center gap-3"><Plus className="text-violet-500" /> Nouveau Tournoi</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">ID Unique</Label>
          <Input placeholder="ex: blur-01" value={newTournament.id} onChange={e => setNewTournament({...newTournament, id: e.target.value})} className="py-6 bg-muted/50 border-border rounded-xl" required />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Titre</Label>
          <Input placeholder="Nom du tournoi" value={newTournament.title} onChange={e => setNewTournament({...newTournament, title: e.target.value})} className="py-6 bg-muted/50 border-border rounded-xl" required />
        </div>
        
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Ville</Label>
          <Select onValueChange={(v) => setNewTournament({...newTournament, city: v})} defaultValue="Cotonou">
            <SelectTrigger className="py-6 bg-muted/50 border-border rounded-xl">
              <SelectValue placeholder="Ville" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {CITIES.map(city => (
                <SelectItem key={city} value={city} className="font-bold">{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Jeu</Label>
          <Select onValueChange={(v) => setNewTournament({...newTournament, game: v})} defaultValue="Free Fire">
            <SelectTrigger className="py-6 bg-muted/50 border-border rounded-xl">
              <SelectValue placeholder="Jeu" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {GAMES.map(game => (
                <SelectItem key={game} value={game} className="font-bold">{game}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Type</Label>
          <Select onValueChange={(v) => setNewTournament({...newTournament, type: v as any})} defaultValue="Online">
            <SelectTrigger className="py-6 bg-muted/50 border-border rounded-xl">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="Online" className="font-bold">En ligne</SelectItem>
              <SelectItem value="Presentiel" className="font-bold">Présentiel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Max participants</Label>
          <Input type="number" value={newTournament.max_participants} onChange={e => setNewTournament({...newTournament, max_participants: parseInt(e.target.value)})} className="py-6 bg-muted/50 border-border rounded-xl" required />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Image URL</Label>
          <Input placeholder="Lien de l'image" value={newTournament.image_url} onChange={e => setNewTournament({...newTournament, image_url: e.target.value})} className="py-6 bg-muted/50 border-border rounded-xl" />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Frais d'entrée (FCFA)</Label>
          <Input type="number" value={newTournament.entry_fee} onChange={e => setNewTournament({...newTournament, entry_fee: parseInt(e.target.value)})} className="py-6 bg-muted/50 border-border rounded-xl" />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Lien de paiement (KKiaPay Direct)</Label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
            <Input 
              placeholder="https://direct.kkiapay.me/..." 
              value={newTournament.payment_url || ''} 
              onChange={e => setNewTournament({...newTournament, payment_url: e.target.value})} 
              className="pl-10 py-6 bg-muted/50 border-border rounded-xl" 
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Cash Prize</Label>
          <Input placeholder="ex: 50.000 FCFA" value={newTournament.prize_pool} onChange={e => setNewTournament({...newTournament, prize_pool: e.target.value})} className="py-6 bg-muted/50 border-border rounded-xl" />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Description (Déroulement)</Label>
          <Textarea placeholder="Expliquez comment le tournoi va se dérouler..." value={newTournament.description} onChange={e => setNewTournament({...newTournament, description: e.target.value})} className="bg-muted/50 border-border rounded-2xl min-h-[100px] p-4" />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Règlement</Label>
          <Textarea placeholder="Règlement du tournoi..." value={newTournament.rules} onChange={e => setNewTournament({...newTournament, rules: e.target.value})} className="bg-muted/50 border-border rounded-2xl min-h-[100px] p-4" />
        </div>
      </div>
      <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 py-8 rounded-2xl font-black text-base shadow-xl shadow-violet-500/20 text-white">Créer le tournoi</Button>
    </motion.form>
  );
};

export default NewTournamentTab;