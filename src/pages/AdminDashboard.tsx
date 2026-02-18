"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Plus, Trash2, CheckCircle, Gamepad2 } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [newTournament, setNewTournament] = useState({
    id: '', title: '', game: '', image_url: '', entry_fee: 0, prize_pool: '', type: 'Online'
  });

  const [newLeader, setNewLeader] = useState({
    username: '', game_id: '', wins: 0, avatar_url: ''
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

  if (loading) return null;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-black mb-8">Panneau Admin (egamebenin)</h1>
        <Tabs defaultValue="tournaments">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900 mb-8">
            <TabsTrigger value="tournaments">Tournois</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>
          <TabsContent value="tournaments" className="space-y-6">
            <form onSubmit={handleAddTournament} className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-4">
              <h2 className="text-xl font-bold">Nouveau Tournoi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="ID (ex: blur-01)" value={newTournament.id} onChange={e => setNewTournament({...newTournament, id: e.target.value})} className="bg-zinc-800" required />
                <Input placeholder="Titre" value={newTournament.title} onChange={e => setNewTournament({...newTournament, title: e.target.value})} className="bg-zinc-800" required />
                <Input placeholder="Jeu" value={newTournament.game} onChange={e => setNewTournament({...newTournament, game: e.target.value})} className="bg-zinc-800" required />
                <Input placeholder="Image URL" value={newTournament.image_url} onChange={e => setNewTournament({...newTournament, image_url: e.target.value})} className="bg-zinc-800" />
                <Input type="number" placeholder="Frais" value={newTournament.entry_fee} onChange={e => setNewTournament({...newTournament, entry_fee: parseInt(e.target.value)})} className="bg-zinc-800" />
                <Input placeholder="Cash Prize" value={newTournament.prize_pool} onChange={e => setNewTournament({...newTournament, prize_pool: e.target.value})} className="bg-zinc-800" />
              </div>
              <Button type="submit" className="w-full bg-violet-600">Créer</Button>
            </form>
          </TabsContent>
          <TabsContent value="leaderboard">
            <form onSubmit={handleAddLeader} className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-4">
              <h2 className="text-xl font-bold">Mettre à jour le Classement</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Pseudo" value={newLeader.username} onChange={e => setNewLeader({...newLeader, username: e.target.value})} className="bg-zinc-800" required />
                <Input placeholder="ID Jeu (ex: blur, cod-mobile)" value={newLeader.game_id} onChange={e => setNewLeader({...newLeader, game_id: e.target.value})} className="bg-zinc-800" required />
                <Input type="number" placeholder="Victoires" value={newLeader.wins} onChange={e => setNewLeader({...newLeader, wins: parseInt(e.target.value)})} className="bg-zinc-800" required />
              </div>
              <Button type="submit" className="w-full bg-violet-600">Mettre à jour</Button>
            </form>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;