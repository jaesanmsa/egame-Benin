"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { beninNowInput, beninInputToIso } from '@/utils/datetime';
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
import NewsTab from '@/components/admin/NewsTab';
import PartnershipsTab from '@/components/admin/PartnershipsTab';
import TicketsTab from '@/components/admin/TicketsTab';
import PartnersAdminTab from '@/components/admin/PartnersAdminTab';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTournaments, setActiveTournaments] = useState<any[]>([]);
  const [allTournaments, setAllTournaments] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [participantsList, setParticipantsList] = useState<any[]>([]);
  
  const [newTournament, setNewTournament] = useState({
    id: '',
    title: '',
    game: 'Free Fire',
    image_url: '',
    entry_fee: 0,
    prize_pool: '',
    type: 'Online',
    max_participants: 40,
    rules: '',
    description: '',
    payment_url: '',
    payment_gateway: 'kkiapay',
    registration_start_date: beninNowInput(),
    start_date: beninNowInput(),
    registration_end_date: beninNowInput()
  });

  const [editingTournament, setEditingTournament] = useState<any>(null);

  const [newLeader, setNewLeader] = useState({
    username: '', game_id: 'free-fire', wins: 0, avatar_url: '', rank: 1
  });

  const [finishData, setFinishData] = useState({
    tournamentId: '', winnerName: ''
  });

  useEffect(() => {
    checkAdmin();
    fetchData();

    const channel = supabase
      .channel('admin-payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => { fetchPayments(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (user?.email?.toLowerCase() === 'egamebenin@gmail.com') {
      setIsAdmin(true);
    } else {
      navigate('/');
      showError("Accès refusé : Réservé à l'administration.");
    }
    setLoading(false);
  };

  const fetchPayments = async () => {
    const { data: pays, error } = await supabase
      .from('payments')
      .select('*, profiles(username, full_name, phone)')
      .order('created_at', { ascending: false });
    if (error) showError("Impossible de charger les transactions : " + error.message);
    setAllPayments(pays ?? []);
  };

  const fetchData = async () => {
    const { data: tours, error } = await supabase.from('tournaments').select('*');
    if (error) showError("Impossible de charger les tournois : " + error.message);
    setAllTournaments(tours ?? []);
    setActiveTournaments((tours ?? []).filter((t: any) => t.status === 'active'));
    await fetchPayments();
  };

  const fetchParticipants = async (tournamentId: string) => {
    setSelectedTournamentId(tournamentId);
    const { data, error } = await supabase
      .from('payments')
      .select('*, profiles(username, full_name, phone)')
      .eq('tournament_id', tournamentId)
      .eq('status', 'Réussi');
    if (error) showError("Impossible de charger les participants : " + error.message);
    setParticipantsList(data ?? []);
  };

  const handleAddTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('tournaments').insert([{
      ...newTournament,
      // Les heures saisies (GMT+1) sont converties en instants exacts.
      registration_start_date: beninInputToIso(newTournament.registration_start_date),
      start_date: beninInputToIso(newTournament.start_date),
      registration_end_date: beninInputToIso(newTournament.registration_end_date),
      status: 'active',
      created_at: new Date().toISOString()
    }]);
    if (error) showError(error.message);
    else {
      showSuccess("Tournoi ajouté !");
      // Notification push à tous les joueurs abonnés (Chrome/Android via FCM)
      supabase.functions.invoke('send-push-notification', {
        body: {
          type: 'NEW_TOURNAMENT',
          game: newTournament.game,
          slots: newTournament.max_participants,
          fee: newTournament.entry_fee,
          prize: newTournament.prize_pool,
          tournament_id: newTournament.id
        }
      }).then(({ error: pushError }) => {
        if (pushError) showError("Notification non envoyée : " + pushError.message);
      });
      setNewTournament({
        id: '', title: '', game: 'Free Fire', image_url: '', entry_fee: 0, prize_pool: '', type: 'Online', max_participants: 40, rules: '', description: '', payment_url: '', payment_gateway: 'kkiapay',
        registration_start_date: beninNowInput(),
        start_date: beninNowInput(),
        registration_end_date: beninNowInput()
      });
      fetchData();
    }
  };

  const handleUpdateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('tournaments')
      .update({ 
        title: editingTournament.title,
        game: editingTournament.game,
        image_url: editingTournament.image_url,
        entry_fee: editingTournament.entry_fee,
        max_participants: editingTournament.max_participants,
        type: editingTournament.type,
        prize_pool: editingTournament.prize_pool,
        description: editingTournament.description,
        rules: editingTournament.rules,
        payment_url: editingTournament.payment_url,
        payment_gateway: editingTournament.payment_gateway,
        registration_start_date: beninInputToIso(editingTournament.registration_start_date),
        start_date: beninInputToIso(editingTournament.start_date),
        registration_end_date: beninInputToIso(editingTournament.registration_end_date)
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

    const winnerName = finishData.winnerName.trim();
    if (!finishData.tournamentId || !winnerName) {
      showError("Sélectionnez un tournoi et saisissez le pseudo du gagnant.");
      return;
    }
    
    const { error } = await supabase
      .from('tournaments')
      .update({
        status: 'finished',
        winner_name: winnerName
      })
      .eq('id', finishData.tournamentId);
    
    if (error) {
      showError(error.message);
      return;
    }

    const { data: winnerProfile } = await supabase
      .from('profiles')
      .select('id, points, champion_count')
      .eq('username', winnerName)
      .maybeSingle();

    if (winnerProfile) {
      await supabase
        .from('profiles')
        .update({
          points: (winnerProfile.points || 0) + 50,
          champion_count: (winnerProfile.champion_count || 0) + 1
        })
        .eq('id', winnerProfile.id);
    }

    // Notification push aux participants du tournoi clôturé
    const tournament = activeTournaments.find((t: any) => t.id === finishData.tournamentId);
    supabase.functions.invoke('send-push-notification', {
      body: {
        type: 'RESULTS_PUBLISHED',
        tournament_id: finishData.tournamentId,
        tournament_name: tournament?.title ?? 'Tournoi eGame Bénin',
        winner: winnerName
      }
    }).then(({ error: pushError }) => {
      if (pushError) showError("Notification non envoyée : " + pushError.message);
    });

    showSuccess("Tournoi clôturé et points attribués !");
    setFinishData({ tournamentId: '', winnerName: '' });
    fetchData();
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
              <TabsTrigger value="news" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-[20px] data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all">Actualités</TabsTrigger>
              <TabsTrigger value="finish" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-[20px] data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all">Clôturer</TabsTrigger>
              <TabsTrigger value="leaderboard" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-[20px] data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all">Top 5</TabsTrigger>
              <TabsTrigger value="partnerships" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-[20px] data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all">Partenariats</TabsTrigger>
              <TabsTrigger value="tickets" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-[20px] data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all">Tickets</TabsTrigger>
              <TabsTrigger value="partners-admin" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-[20px] data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all">Partenaires</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="payments">
            <PaymentsTab tournaments={allTournaments} payments={allPayments} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
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

          <TabsContent value="news">
            <NewsTab />
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

          <TabsContent value="partnerships">
            <PartnershipsTab />
          </TabsContent>

          <TabsContent value="tickets">
            <TicketsTab tournaments={allTournaments} />
          </TabsContent>

          <TabsContent value="partners-admin">
            <PartnersAdminTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;