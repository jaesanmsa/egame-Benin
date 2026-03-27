"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Settings, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CITIES = ["Cotonou", "Porto-Novo", "Parakou", "Ouidah", "Abomey-Calavi", "Autre"];
const GAMES = ["Blur", "COD Modern Warfare 4", "COD Mobile", "BombSquad", "Clash Royale", "Clash of Clans", "Free Fire", "PUBG Mobile", "Autre"];

interface EditTournamentTabProps {
  activeTournaments: any[];
  editingTournament: any;
  setEditingTournament: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const EditTournamentTab = ({ activeTournaments, editingTournament, setEditingTournament, onSubmit }: EditTournamentTabProps) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
      <h2 className="text-xl font-black mb-8 flex items-center gap-3"><Edit3 className="text-cyan-500" /> Modifier les infos</h2>
      
      {!editingTournament ? (
        <div className="grid gap-4">
          {activeTournaments.map(t => (
            <div 
              key={t.id} 
              className="flex items-center justify-between p-5 bg-muted/30 rounded-2xl border border-border/50 hover:border-violet-500/30 transition-all"
            >
              <div className="text-left">
                <p className="font-black text-sm">
                  {t.title}
                </p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t.game} • {t.prize_pool} • {t.city}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setEditingTournament(t)}
                className="border-border hover:bg-muted rounded-xl h-10 px-4"
              >
                <Settings size={16} className="mr-2" />
                Gérer
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="flex items-center justify-between mb-6 bg-violet-600/5 p-4 rounded-2xl border border-violet-500/10">
            <h3 className="font-black text-violet-500">{editingTournament.title}</h3>
            <button type="button" onClick={() => setEditingTournament(null)} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">Annuler</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Ville</Label>
              <Select onValueChange={(v) => setEditingTournament({...editingTournament, city: v})} defaultValue={editingTournament.city}>
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
              <Select onValueChange={(v) => setEditingTournament({...editingTournament, game: v})} defaultValue={editingTournament.game}>
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

            <div className="md:col-span-2 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Lien de paiement (KKiaPay Direct)</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                <Input 
                  placeholder="https://direct.kkiapay.me/..." 
                  value={editingTournament.payment_url || ''} 
                  onChange={e => setEditingTournament({...editingTournament, payment_url: e.target.value})} 
                  className="pl-10 py-6 bg-muted/50 border-border rounded-xl" 
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Cash Prize</Label>
              <Input 
                value={editingTournament.prize_pool || ''} 
                onChange={e => setEditingTournament({...editingTournament, prize_pool: e.target.value})}
                className="py-6 bg-muted/50 border-border rounded-xl"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Description (Déroulement)</Label>
              <Textarea 
                value={editingTournament.description || ''} 
                onChange={e => setEditingTournament({...editingTournament, description: e.target.value})}
                className="bg-muted/50 border-border rounded-2xl min-h-[120px] p-4"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Règlement</Label>
              <Textarea 
                value={editingTournament.rules || ''} 
                onChange={e => setEditingTournament({...editingTournament, rules: e.target.value})}
                className="bg-muted/50 border-border rounded-2xl min-h-[120px] p-4"
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 py-8 rounded-2xl font-black text-base shadow-xl shadow-cyan-500/20 text-white">Enregistrer les modifications</Button>
        </form>
      )}
    </motion.div>
  );
};

export default EditTournamentTab;