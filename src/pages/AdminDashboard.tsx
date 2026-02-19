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
import { Trophy, Plus, Users, Globe, MapPin, Check, X, CreditCard, History, Search } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTournaments, setActiveTournaments] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  
  const [newTournament, setNewTournament] = useState({
    id: '', title: '', game: '', image_url: '', entry_fee: 0, prize_pool: '', type: 'Online', max_participants: 40
  });

  const [newLeader, setNewLeader] = useState({
    username: '', game_id: 'blur', wins: 0, avatar_url: '', rank: 1
  });

  const [finishData, setFinishData] = useState({
    tournamentId: '', winnerName: '', winnerAvatar: ''
  });

  useEffect(() => {
    checkAdmin();
    fetchData();
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

  const fetchData = async () => {
    // Tournois actifs
    const { data: tours } = await supabase.from('tournaments').select('*').eq('status', 'active');
    if (tours) setActiveTournaments(tours);

    // Tous les paiements (Historique)
    const { data: pays } = await supabase
      .from('payments')
      .select('*, profiles(username, full_name)')
      .order('created_at', { ascending: false });
    if (pays) setAllPayments(pays);
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
      fetchData();
    }
  };

  const handleFinishTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('tournaments')
      .update({ 
        status: 'finished',
        winner_name: finishData.winnerName,
        winner_avatar: finishData.winnerAvatar
      })
      .eq('id', finishData.tournamentId);
    
    if (error) showError(error.message);
    else {
      showSuccess("Tournoi clôturé !");
      setFinishData({ tournamentId: '', winnerName: '', winnerAvatar: '' });
      fetchData();
    }
  };

  const handleUpdateLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('leaderboard').upsert([{
      rank: newLeader.rank,
      username: newLeader.username,
      game_id: newLeader.game_id,
      wins: newLeader.wins,
      avatar_url: newLeader.avatar_url
    }], { onConflict: 'rank,game_id' });

    if (error) showError(error.message);
    else showSuccess(`Rang ${newLeader.rank} mis à jour !`);
  };

  if (loading) return null;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-black mb-8">Gestion eGame Bénin</h1>
        
        <Tabs defaultValue="payments">
          <TabsList className="grid w-full grid-cols-4 bg-zinc-900 mb-8 h-auto p-1">
            <TabsTrigger value="payments" className="py-3">Transactions</TabsTrigger>
            <TabsTrigger value="tournaments" className="py-3">Nouveau</TabsTrigger>
            <TabsTrigger value="finish" className="py-3">Clôturer</TabsTrigger>
            <TabsTrigger value="leaderboard" className="py-3">Top 5</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-6">
            <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><CreditCard className="text-violet-500" /> Historique des paiements</h2>
              <div className="space-y-4">
                {allPayments.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8 italic">Aucune transaction enregistrée</p>
                ) : (
                  allPayments.map((pay) => (
                    <div key={pay.id} className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{pay.profiles?.username || pay.profiles?.full_name || "Joueur"}</p>
                        <p className="text-xs text-zinc-400">{pay.tournament_name} • {pay.amount} FCFA</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${pay.status === 'Réussi' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                        {pay.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tournaments" className="space-y-6">
            <form onSubmit={handleAddTournament} className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-4">
              <h2 className="text-xl font-bold">Nouveau Tournoi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="ID Unique (ex: blur-01)" value={newTournament.id} onChange={e => setNewTournament({...newTournament, id: e.target.value})} className="bg-zinc-800" required />
                <Input placeholder="Titre" value={newTournament.title} onChange={e => setNewTournament({...newTournament, title: e.target.value})} className="bg-zinc-800" required />
                <Select onValueChange={(v) => setNewTournament({...newTournament, type: v as any})} defaultValue="Online">
                  <SelectTrigger className="bg-zinc-800 border-zinc-700"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="Online">En ligne</SelectItem>
                    <SelectItem value="Presentiel">Présentiel</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Max participants" value={newTournament.max_participants} onChange={e => setNewTournament({...newTournament, max_participants: parseInt(e.target.value)})} className="bg-zinc-800" required />
                <Input placeholder="Jeu" value={newTournament.game} onChange={e => setNewTournament({...newTournament, game: e.target.value})} className="bg-zinc-800" required />
                <Input placeholder="Image URL" value={newTournament.image_url} onChange={e => setNewTournament({...newTournament, image_url: e.target.value})} className="bg-zinc-800" />
                <Input type="number" placeholder="Frais d'entrée" value={newTournament.entry_fee} onChange={e => setNewTournament({...newTournament, entry_fee: parseInt(e.target.value)})} className="bg-zinc-800" />
                <Input placeholder="Cash Prize" value={newTournament.prize_pool} onChange={e => setNewTournament({...newTournament, prize_pool: e.target.value})} className="bg-zinc-800" />
              </div>
              <Button type="submit" className="w-full bg-violet-600 py-6 font-bold">Créer le tournoi</Button>
            </form>
          </TabsContent>

          <TabsContent value="finish" className="space-y-6">
            <form onSubmit={handleFinishTournament} className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><History className="text-orange-500" /> Terminer un tournoi</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Sélectionner le tournoi</Label>
                  <Select onValueChange={(v) => setFinishData({...finishData, tournamentId: v})}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700"><SelectValue placeholder="Choisir un tournoi actif" /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      {activeTournaments.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input placeholder="Pseudo du gagnant" value={finishData.winnerName} onChange={e => setFinishData({...finishData, winnerName: e.target.value})} className="bg-zinc-800" required />
                <Input placeholder="Lien Avatar du gagnant (Emoji)" value={finishData.winnerAvatar} onChange={e => setFinishData({...finishData, winnerAvatar: e.target.value})} className="bg-zinc-800" />
              </div>
              <Button type="submit" className="w-full bg-orange-600 py-6 font-bold">Clôturer et afficher le gagnant</Button>
            </form>
          </TabsContent>

          <TabsContent value="leaderboard">
            <form onSubmit={handleUpdateLeader} className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-4">
              <h2 className="text-xl font-bold">Modifier le Top 5</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input type="number" min="1" max="5" placeholder="Rang (1-5)" value={newLeader.rank} onChange={e => setNewLeader({...newLeader, rank: parseInt(e.target.value)})} className="bg-zinc-800" required />
                <Select onValueChange={(v) => setNewLeader({...newLeader, game_id: v})} defaultValue="blur">
                  <SelectTrigger className="bg-zinc-800 border-zinc-700"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="blur">Blur</SelectItem>
                    <SelectItem value="cod-mw4">COD MW4</SelectItem>
                    <SelectItem value="cod-mobile">COD Mobile</SelectItem>
                    <SelectItem value="bombsquad">BombSquad</SelectItem>
                    <SelectItem value="clash-royale">Clash Royale</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Pseudo" value={newLeader.username} onChange={e => setNewLeader({...newLeader, username: e.target.value})} className="bg-zinc-800" />
                <Input type="number" placeholder="Points" value={newLeader.wins} onChange={e => setNewLeader({...newLeader, wins: parseInt(e.target.value)})} className="bg-zinc-800" />
                <div className="md:col-span-2">
                  <Input placeholder="Lien Avatar Emoji" value={newLeader.avatar_url} onChange={e => setNewLeader({...newLeader, avatar_url: e.target.value})} className="bg-zinc-800" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-violet-600 py-6 font-bold">Mettre à jour le classement</Button>
            </form>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;