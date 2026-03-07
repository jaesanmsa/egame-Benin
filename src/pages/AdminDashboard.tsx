"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

// Import des composants modulaires
import PaymentsTab from '@/components/admin/PaymentsTab';
import ParticipantsTab from '@/components/admin/ParticipantsTab';
import NewTournamentTab from '@/components/admin/NewTournamentTab';
import EditTournamentTab from '@/components/admin/EditTournamentTab';
import FinishTournamentTab from '@/components/admin/FinishTournamentTab';
import LeaderboardTab from '@/components/admin/LeaderboardTab';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTournaments, setActiveTournaments] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [participantsList, setParticipantsList] = useState<any[]>([]);
  
  const [newTournament, setNewTournament] = useState({
    id: '', title: '', game: 'Blur', image_url: '', entry_fee: 0, prize_pool: '', type: 'Online', max_participants: 40, rules: '', description: '', payment_url: '', city: 'Cotonou'
  });

  const [editingTournament, setEditingTournament] = useState<any>(null);

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
    const { data: tours } = await supabase.from('tournaments').select('*').eq('status', 'active');
    if (tours) setActiveTournaments(tours);

    const { data: pays } = await supabase
      .from('payments')
      .select('*, profiles(username, full_name, phone)')
      .order('created_at', { ascending: false });
    if (pays) setAllPayments(pays);
  };

  const fetchParticipants = async (tournamentId: string) => {
    setSelectedTournamentId(tournamentId);
    const { data } = await supabase
      .from('payments')
      .select('*, profiles(username, full_name, phone, city)')
      .eq('tournament_id', tournamentId)
      .eq('status', 'Réussi');
    if (data) setParticipantsList(data);
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
      setNewTournament({ id: '', title: '', game: 'Blur', image_url: '', entry_fee: 0, prize_pool: '', type: 'Online', max_participants: 40, rules: '', description: '', payment_url: '', city: 'Cotonou' });
      fetchData();
    }
  };

  const handleUpdateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('tournaments')
      .update({ 
        rules: editingTournament.rules,
        description: editingTournament.description,
        prize_pool: editingTournament.prize_pool,
        payment_url: editingTournament.payment_url,
        city: editingTournament.city,
        game: editingTournament.game
      })
      .eq('id', editingTournament.id);
    
    if (error) showError(error.message);
    else {
      showSuccess("Tournoi mis à jour !");
      setEditingTournament(null);
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

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Administration</h1>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Gestion de l'arène eGame Bénin</p>
          </div>
        </div>
        
        <Tabs defaultValue="payments" className="space-y-8">
          <div className="bg-muted/50 p-1.5 rounded-[25px] border border-border overflow-x-auto no-scrollbar">
            <TabsList className="flex w-full bg-transparent h-auto gap-1 min-w-max px-4">
              <TabsTrigger value="payments" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-[20px] data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all">Transactions</TabsTrigger>
              <TabsTrigger value="participants" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-[20px] data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all">Joueurs</TabsTrigger>
              <TabsTrigger value="tournaments" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-[20px] data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all">Nouveau</TabsTrigger>
              <TabsTrigger value="edit" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-[20px] data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all">Modifier</TabsTrigger>
              <TabsTrigger value="finish" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-[20px] data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all">Clôturer</TabsTrigger>
              <TabsTrigger value="leaderboard" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-[20px] data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all">Top 5</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="payments">
            <PaymentsTab payments={allPayments} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </TabsContent>

          <TabsContent value="participants">
            <ParticipantsTab 
              activeTournaments={activeTournaments} 
              fetchParticipants={fetchParticipants} 
              selectedTournamentId={selectedTournamentId} 
              participants={participantsList} 
            />
          </TabsContent>

          <TabsContent value="tournaments">
            <NewTournamentTab 
              newTournament={newTournament} 
              setNewTournament={setNewTournament} 
              onSubmit={handleAddTournament} 
            />
          </TabsContent>

          <TabsContent value="edit">
            <EditTournamentTab 
              activeTournaments={activeTournaments} 
              editingTournament={editingTournament} 
              setEditingTournament={setEditingTournament} 
              onSubmit={handleUpdateTournament} 
            />
          </TabsContent>

          <TabsContent value="finish">
            <FinishTournamentTab 
              activeTournaments={activeTournaments} 
              finishData={finishData} 
              setFinishData={setFinishData} 
              onSubmit={handleFinishTournament} 
            />
          </TabsContent>

          <TabsContent value="leaderboard">
            <LeaderboardTab 
              newLeader={newLeader} 
              setNewLeader={setNewLeader} 
              onSubmit={handleUpdateLeader} 
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;