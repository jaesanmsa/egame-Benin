"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Plus, Users, Globe, MapPin } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [newTournament, setNewTournament] = useState({
    id: '', title: '', game: '', image_url: '', entry_fee: 0, prize_pool: '', type: 'Online', max_participants: 40
  });

  const [newLeader, setNewLeader] = useState({
    username: '', game_id: 'blur', wins: 0, avatar_url: '', rank: 1
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email === 'egamebenin@gmail.com') {
      setIsAdmin(true);
    } else {
      navigate('/');
      showError("Accès refusé");
    }
    setLoading(false);
  };

  const handleAddTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('tournaments').insert([{
      ...newTournament,
      status: 'active',
      created_at: new Date().toISOString()
    }]);
    if (error) showError(error.message);
    else {
      showSuccess("Tournoi ajouté !");
      setNewTournament({ id: '', title: '', game: '', image_url: '', entry_fee: 0, prize_pool: '', type: 'Online', max_participants: 40 });
    }
  };

  const handleUpdateLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    // On utilise le rang comme identifiant unique pour le Top 5 par jeu
    const { error } = await supabase.from('leaderboard').upsert([{
      rank: newLeader.rank,
      username: newLeader.username,
      game_id: newLeader.game_id,
      wins: newLeader.wins,
      avatar_url: newLeader.avatar_url
    }], { onConflict: 'rank,game_id' });

    if (error) showError(error.message);
    else showSuccess(`Rang ${newLeader.rank} mis à jour pour ${newLeader.game_id} !`);
  };

  if (loading) return null;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-black mb-8">Gestion eGame Bénin</h1>
        
        <Tabs defaultValue="tournaments">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900 mb-8">
            <TabsTrigger value="tournaments">Tournois</TabsTrigger>
            <TabsTrigger value="leaderboard">Top 5 Classement</TabsTrigger>
          </TabsList>

          <TabsContent value="tournaments" className="space-y-6">
            <form onSubmit={handleAddTournament} className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-4">
              <h2 className="text-xl font-bold">Nouveau Tournoi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ID Unique</Label>
                  <Input placeholder="ex: blur-01" value={newTournament.id} onChange={e => setNewTournament({...newTournament, id: e.target.value})} className="bg-zinc-800" required />
                </div>
                <div className="space-y-2">
                  <Label>Titre</Label>
                  <Input placeholder="Nom du tournoi" value={newTournament.title} onChange={e => setNewTournament({...newTournament, title: e.target.value})} className="bg-zinc-800" required />
                </div>
                <div className="space-y-2">
                  <Label>Type de tournoi</Label>
                  <Select onValueChange={(v) => setNewTournament({...newTournament, type: v as any})} defaultValue="Online">
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Choisir le type" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="Online">En ligne</SelectItem>
                      <SelectItem value="Presentiel">Présentiel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nombre max de participants</Label>
                  <Input type="number" value={newTournament.max_participants} onChange={e => setNewTournament({...newTournament, max_participants: parseInt(e.target.value)})} className="bg-zinc-800" required />
                </div>
                <Input placeholder="Jeu" value={newTournament.game} onChange={e => setNewTournament({...newTournament, game: e.target.value})} className="bg-zinc-800" required />
                <Input placeholder="Image URL" value={newTournament.image_url} onChange={e => setNewTournament({...newTournament, image_url: e.target.value})} className="bg-zinc-800" />
                <Input type="number" placeholder="Frais d'entrée" value={newTournament.entry_fee} onChange={e => setNewTournament({...newTournament, entry_fee: parseInt(e.target.value)})} className="bg-zinc-800" />
                <Input placeholder="Cash Prize" value={newTournament.prize_pool} onChange={e => setNewTournament({...newTournament, prize_pool: e.target.value})} className="bg-zinc-800" />
              </div>
              <Button type="submit" className="w-full bg-violet-600 py-6 font-bold">Créer le tournoi</Button>
            </form>
          </TabsContent>

          <TabsContent value="leaderboard">
            <form onSubmit={handleUpdateLeader} className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-4">
              <h2 className="text-xl font-bold">Modifier une place du Top 5</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Position (1 à 5)</Label>
                  <Input type="number" min="1" max="5" value={newLeader.rank} onChange={e => setNewLeader({...newLeader, rank: parseInt(e.target.value)})} className="bg-zinc-800" required />
                </div>
                <div className="space-y-2">
                  <Label>Jeu</Label>
                  <Select onValueChange={(v) => setNewLeader({...newLeader, game_id: v})} defaultValue="blur">
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="blur">Blur</SelectItem>
                      <SelectItem value="cod-mw4">COD MW4</SelectItem>
                      <SelectItem value="cod-mobile">COD Mobile</SelectItem>
                      <SelectItem value="bombsquad">BombSquad</SelectItem>
                      <SelectItem value="clash-royale">Clash Royale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input placeholder="Pseudo du joueur" value={newLeader.username} onChange={e => setNewLeader({...newLeader, username: e.target.value})} className="bg-zinc-800" />
                <Input type="number" placeholder="Points / Victoires" value={newLeader.wins} onChange={e => setNewLeader({...newLeader, wins: parseInt(e.target.value)})} className="bg-zinc-800" />
                <div className="md:col-span-2">
                  <Label>Lien de la photo (Lien Avatar Emoji)</Label>
                  <Input placeholder="Coller le lien data:image/svg+xml..." value={newLeader.avatar_url} onChange={e => setNewLeader({...newLeader, avatar_url: e.target.value})} className="bg-zinc-800" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-violet-600 py-6 font-bold">Enregistrer cette position</Button>
            </form>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;