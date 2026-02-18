"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Plus, Trash2, CheckCircle, Gamepad2, ArrowLeft } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Formulaire Nouveau Tournoi
  const [newTournament, setNewTournament] = useState({
    id: '', title: '', game: '', image_url: '', entry_fee: 0, prize_pool: '', type: 'Online'
  });

  // Formulaire Leaderboard
  const [newLeader, setNewLeader] = useState({
    username: '', game_id: '', wins: 0, avatar_url: ''
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email === 'egambenin@gmail.com') {
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
      setNewTournament({ id: '', title: '', game: '', image_url: '', entry_fee: 0, prize_pool: '', type: 'Online' });
    }
  };

  const handleAddLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('leaderboard').upsert([newLeader], { onConflict: 'username,game_id' });
    if (error) showError(error.message);
    else {
      showSuccess("Leaderboard mis à jour !");
      setNewLeader({ username: '', game_id: '', wins: 0, avatar_url: '' });
    }
  };

  const finishTournament = async (id: string) => {
    const winner = prompt("Pseudo du gagnant ?");
    const prize = prompt("Cash prize distribué ?");
    if (!winner || !prize) return;

    const { error } = await supabase.from('tournaments').update({
      status: 'finished',
      winner_name: winner,
      prize_pool: prize
    }).eq('id', id);

    if (error) showError(error.message);
    else showSuccess("Tournoi terminé !");
  };

  if (loading) return null;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black">Panneau Admin</h1>
          <div className="bg-violet-600/20 text-violet-500 px-4 py-1 rounded-full text-xs font-bold uppercase">Mode Maître</div>
        </div>

        <Tabs defaultValue="tournaments" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900 rounded-xl p-1 mb-8">
            <TabsTrigger value="tournaments" className="rounded-lg data-[state=active]:bg-violet-600">Tournois</TabsTrigger>
            <TabsTrigger value="leaderboard" className="rounded-lg data-[state=active]:bg-violet-600">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="tournaments" className="space-y-8">
            <form onSubmit={handleAddTournament} className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><Plus size={20} /> Nouveau Tournoi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ID Unique (ex: blur-01)</Label>
                  <Input value={newTournament.id} onChange={e => setNewTournament({...newTournament, id: e.target.value})} className="bg-zinc-800 border-zinc-700" required />
                </div>
                <div className="space-y-2">
                  <Label>Titre</Label>
                  <Input value={newTournament.title} onChange={e => setNewTournament({...newTournament, title: e.target.value})} className="bg-zinc-800 border-zinc-700" required />
                </div>
                <div className="space-y-2">
                  <Label>Jeu</Label>
                  <Input value={newTournament.game} onChange={e => setNewTournament({...newTournament, game: e.target.value})} className="bg-zinc-800 border-zinc-700" required />
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input value={newTournament.image_url} onChange={e => setNewTournament({...newTournament, image_url: e.target.value})} className="bg-zinc-800 border-zinc-700" />
                </div>
                <div className="space-y-2">
                  <Label>Frais d'entrée (FCFA)</Label>
                  <Input type="number" value={newTournament.entry_fee} onChange={e => setNewTournament({...newTournament, entry_fee: parseInt(e.target.value)})} className="bg-zinc-800 border-zinc-700" />
                </div>
                <div className="space-y-2">
                  <Label>Cash Prize</Label>
                  <Input value={newTournament.prize_pool} onChange={e => setNewTournament({...newTournament, prize_pool: e.target.value})} className="bg-zinc-800 border-zinc-700" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 font-bold py-6 rounded-xl">Créer le tournoi</Button>
            </form>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-8">
            <form onSubmit={handleAddLeader} className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><Trophy size={20} /> Gérer le Classement</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pseudo du joueur</Label>
                  <Input value={newLeader.username} onChange={e => setNewLeader({...newLeader, username: e.target.value})} className="bg-zinc-800 border-zinc-700" required />
                </div>
                <div className="space-y-2">
                  <Label>ID du Jeu (ex: blur, cod-mobile)</Label>
                  <Input value={newLeader.game_id} onChange={e => setNewLeader({...newLeader, game_id: e.target.value})} className="bg-zinc-800 border-zinc-700" required />
                </div>
                <div className="space-y-2">
                  <Label>Nombre de victoires</Label>
                  <Input type="number" value={newLeader.wins} onChange={e => setNewLeader({...newLeader, wins: parseInt(e.target.value)})} className="bg-zinc-800 border-zinc-700" required />
                </div>
                <div className="space-y-2">
                  <Label>Avatar URL (Optionnel)</Label>
                  <Input value={newLeader.avatar_url} onChange={e => setNewLeader({...newLeader, avatar_url: e.target.value})} className="bg-zinc-800 border-zinc-700" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 font-bold py-6 rounded-xl">Mettre à jour le joueur</Button>
            </form>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;