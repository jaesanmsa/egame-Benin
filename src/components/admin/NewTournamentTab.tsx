"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Image as ImageIcon, Calendar, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GAMES_CONFIG: Record<string, string> = {
  "Free Fire": "/freefire.webp",
  "Clash Royale": "/clash royal.webp",
  "Clash of Clans": "/clash of clans.webp",
  "COD Mobile": "/cod mobile.webp",
  "PUBG Mobile": "/pubg-mobile.webp",
  "Blur": "/blur.webp",
  "COD MW4": "/cod mw4.webp",
  "BombSquad": "/bombsquad.webp",
  "Mobile Legends": "/mobile legend.webp",
  "Autre": ""
};

const GAMES = Object.keys(GAMES_CONFIG);

interface NewTournamentTabProps {
  newTournament: any;
  setNewTournament: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const NewTournamentTab = ({ newTournament, setNewTournament, onSubmit }: NewTournamentTabProps) => {
  const handleGameChange = (game: string) => {
    const defaultImage = GAMES_CONFIG[game] || "";
    setNewTournament({
      ...newTournament,
      game: game,
      image_url: defaultImage
    });
  };

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
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Jeu</Label>
          <Select onValueChange={handleGameChange} defaultValue={newTournament.game || "Free Fire"}>
            <SelectTrigger className="py-6 bg-muted/50 border-border rounded-xl">
              <SelectValue placeholder="Jeu" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {GAMES.map(game => (
                <SelectItem key={game} value={game} className="font-bold">{game}</SelectItem>
              ))}
            </SelectContent></Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Passerelle de Paiement</Label>
          <Select onValueChange={(v) => setNewTournament({...newTournament, payment_gateway: v})} defaultValue={newTournament.payment_gateway || "kkiapay"}>
            <SelectTrigger className="py-6 bg-muted/50 border-border rounded-xl">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-violet-500" />
                <SelectValue placeholder="Choisir la passerelle" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="kkiapay" className="font-bold">KKiaPay (MTN, Moov, Celtiis)</SelectItem>
              <SelectItem value="fedapay" className="font-bold">FedaPay (MTN, Moov, Cartes)</SelectItem>
              <SelectItem value="maketou" className="font-bold">Maketou (MTN, Moov, Celtiis)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Date et Heure de début</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <Input 
              type="datetime-local" 
              value={newTournament.start_date} 
              onChange={e => setNewTournament({...newTournament, start_date: e.target.value})} 
              className="pl-10 py-6 bg-muted/50 border-border rounded-xl" 
              required 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-orange-500">Fin des inscriptions</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 text-orange-500/60" size={18} />
            <Input 
              type="datetime-local" 
              value={newTournament.registration_end_date} 
              onChange={e => setNewTournament({...newTournament, registration_end_date: e.target.value})} 
              className="pl-10 py-6 bg-muted/50 border-orange-500/20 rounded-xl focus:border-orange-500" 
              required 
            />
          </div>
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
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Image URL (Auto-rempli)</Label>
          <div className="relative">
            <ImageIcon className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <Input 
              placeholder="Lien de l'image" 
              value={newTournament.image_url} 
              onChange={e => setNewTournament({...newTournament, image_url: e.target.value})} 
              className="pl-10 py-6 bg-muted/50 border-border rounded-xl" 
            />
          </div>
          {newTournament.image_url && (
            <div className="mt-2 aspect-video rounded-xl overflow-hidden border border-border bg-muted">
              <img src={newTournament.image_url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Frais d'entrée (FCFA)</Label>
          <Input type="number" value={newTournament.entry_fee} onChange={e => setNewTournament({...newTournament, entry_fee: parseInt(e.target.value)})} className="py-6 bg-muted/50 border-border rounded-xl" />
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