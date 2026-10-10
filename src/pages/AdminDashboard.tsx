"use client";

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { beninNowInput, beninInputToIso } from '@/utils/datetime';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, MessageSquareText, CheckCircle2, AlertTriangle, Loader2, RotateCcw, X } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import DiscordLogo from '@/components/DiscordLogo';

// Import des composants modulaires
import PaymentsTab from '@/components/admin/PaymentsTab';
import ParticipantsTab from '@/components/admin/ParticipantsTab';
import NewTournamentTab from '@/components/admin/NewTournamentTab';
import EditTournamentTab from '@/components/admin/EditTournamentTab';
import FinishTournamentTab, { PODIUM_REWARDS } from '@/components/admin/FinishTournamentTab';
import LeaderboardTab from '@/components/admin/LeaderboardTab';
import NewsTab from '@/components/admin/NewsTab';
import PartnershipsTab from '@/components/admin/PartnershipsTab';
import TicketsTab from '@/components/admin/TicketsTab';
import PartnersAdminTab from '@/components/admin/PartnersAdminTab';
import CheckInsAdminTab from '@/components/admin/CheckInsAdminTab';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("payments");
  const [activeTournaments, setActiveTournaments] = useState<any[]>([]);
  const [allTournaments, setAllTournaments] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [ticketTournamentId, setTicketTournamentId] = useState<string>("");
  const [participantsList, setParticipantsList] = useState<any[]>([]);
  
  const [newTournament, setNewTournament] = useState({
    id: '',
    title: '',
    game: 'Free Fire',
    image_url: '/freefire.webp',
    entry_fee: 0,
    prize_pool: '',
    type: 'Online',
    max_participants: 40,
    rules: '',
    description: '',
    payment_url: '',
    payment_gateway: 'kkiapay',
    is_test: false,
    registration_start_date: beninNowInput(),
    start_date: beninNowInput(),
    registration_end_date: beninNowInput()
  });

  const [editingTournament, setEditingTournament] = useState<any>(null);

  // Configuration du support Discord privé (salon contact-support + panneau).
  const [supportSetupLoading, setSupportSetupLoading] = useState(false);
  const handleSetupDiscordSupport = async () => {
    setSupportSetupLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('discord-support-setup');
      const payload = data as any;
      if (fnError || payload?.error) {
        showError("Support Discord : " + (payload?.error || fnError?.message || 'échec'));
      } else {
        showSuccess(payload?.panel_channel?.already_posted
          ? "✅ Support Discord déjà configuré (panneau déjà publié)."
          : "✅ Support Discord configuré : salon contact-support + panneau publiés.");
      }
    } catch (err: any) {
      showError("Support Discord : " + (err?.message || 'échec'));
    } finally {
      setSupportSetupLoading(false);
    }
  };

  // Espace Discord automatique : activé par défaut à la création d'un tournoi.
  const [createDiscordSpace, setCreateDiscordSpace] = useState(true);
  const [discordStatus, setDiscordStatus] = useState<null | {
    tournamentId: string;
    title: string;
    status: 'creating' | 'ok' | 'failed';
    message?: string;
  }>(null);

  const [newLeader, setNewLeader] = useState({
    username: '', game_id: 'free-fire', wins: 0, avatar_url: '', rank: 1
  });

  const [finishData, setFinishData] = useState({
    tournamentId: '', winnerName: '', secondPlace: '', thirdPlace: '', mvpName: ''
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

  // Appelle l'Edge Function discord-create-tournament-space (idempotente) et
  // met à jour la bannière de statut. Le tournoi n'est jamais supprimé en cas d'échec.
  const invokeDiscordSpaceCreation = async (tournamentId: string, title: string) => {
    setDiscordStatus({ tournamentId, title, status: 'creating' });
    try {
      const { data, error: fnError } = await supabase.functions.invoke('discord-create-tournament-space', {
        body: { tournament_id: tournamentId },
      });
      const payload = data as any;
      if (fnError || payload?.error) {
        const message = payload?.error || fnError?.message || 'Erreur inconnue';
        setDiscordStatus({ tournamentId, title, status: 'failed', message });
        showError("⚠️ Espace Discord non créé : " + message);
      } else {
        setDiscordStatus({ tournamentId, title, status: 'ok' });
        showSuccess(payload?.already_exists
          ? "✅ Espace Discord déjà existant pour ce tournoi."
          : "✅ Espace Discord créé : rôle, catégorie privée et 5 salons configurés.");
      }
    } catch (err: any) {
      setDiscordStatus({ tournamentId, title, status: 'failed', message: err?.message || 'Erreur réseau' });
      showError("⚠️ Espace Discord non créé : " + (err?.message || 'Erreur réseau'));
    }
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
    const { data: createdTournament, error } = await supabase.from('tournaments').insert([{
      ...newTournament,
      // Les heures saisies (GMT+1) sont converties en instants exacts.
      registration_start_date: beninInputToIso(newTournament.registration_start_date),
      start_date: beninInputToIso(newTournament.start_date),
      registration_end_date: beninInputToIso(newTournament.registration_end_date),
      status: 'active',
      created_at: new Date().toISOString()
    }]).select('id').single();
    if (error) showError(error.message);
    else {
      if (newTournament.is_test) {
        showSuccess("Tournoi d'essai créé : visible uniquement par toi, aucune notification envoyée.");
      } else {
        showSuccess(`${newTournament.max_participants} tickets générés. Ils sont prêts dans le panneau Tickets !`);
      }
      setTicketTournamentId(createdTournament.id);
      setActiveTab("tickets");

      // Espace Discord automatique : le tournoi reste créé même si l'appel échoue.
      // Jamais pour un tournoi d'essai (supprimé à la clôture).
      if (createDiscordSpace && !newTournament.is_test) {
        invokeDiscordSpaceCreation(createdTournament.id, newTournament.title);
      }
      // Notification push à tous les joueurs abonnés (jamais pour un tournoi d'essai)
      if (!newTournament.is_test) {
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
      }
      setNewTournament({
        id: '', title: '', game: 'Free Fire', image_url: '', entry_fee: 0, prize_pool: '', type: 'Online', max_participants: 40, rules: '', description: '', payment_url: '', payment_gateway: 'kkiapay', is_test: false,
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

    // Un tournoi d'essai ne se clôture pas : il est supprimé définitivement,
    // avec tous ses paiements et tickets. Rien n'est conservé ni comptabilisé.
    const selectedTournament = allTournaments.find((t: any) => t.id === finishData.tournamentId);
    if (selectedTournament?.is_test) {
      const { error } = await supabase.rpc('delete_test_tournament', { p_tournament_id: finishData.tournamentId });
      if (error) {
        showError("Suppression impossible : " + error.message);
        return;
      }
      showSuccess("Tournoi d'essai supprimé : paiements, tickets et données effacés de la base.");
      setFinishData({ tournamentId: '', winnerName: '', secondPlace: '', thirdPlace: '', mvpName: '' });
      fetchData();
      return;
    }

    const winnerName = finishData.winnerName.trim();
    const secondPlace = finishData.secondPlace.trim();
    const thirdPlace = finishData.thirdPlace.trim();
    const mvpName = finishData.mvpName.trim();

    if (!finishData.tournamentId || !winnerName) {
      showError("Sélectionnez un tournoi et saisissez le pseudo du gagnant (obligatoire).");
      return;
    }

    // Le gagnant ne peut pas figurer à deux places du podium.
    const podium = [winnerName, secondPlace, thirdPlace].filter(Boolean);
    if (new Set(podium).size !== podium.length) {
      showError("Le même pseudo ne peut pas apparaître à deux places du podium.");
      return;
    }

    const { data, error } = await supabase.rpc('finish_tournament_rewards', {
      p_id: finishData.tournamentId,
      p_winner: winnerName,
      p_second: secondPlace || null,
      p_third: thirdPlace || null,
      p_mvp: mvpName || null,
    });
    if (error) {
      showError(error.message);
      return;
    }
    const rewarded: string[] = data.rewarded;
    const notFound: string[] = data.missing;

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

    let summary = `Tournoi clôturé ! ${rewarded.length} joueur(s) récompensé(s) — Gagnant : +${PODIUM_REWARDS.first} pts + 1 Victoire (tous les podiums reçoivent +1 Victoire)`;
    if (secondPlace) summary += `, 2e : +${PODIUM_REWARDS.second} pts`;
    if (thirdPlace) summary += `, 3e : +${PODIUM_REWARDS.third} pts`;
    if (mvpName) summary += `, MVP : +1 MVP`;
    showSuccess(summary);
    if (notFound.length > 0) {
      showError(`Pseudos introuvables (aucun point attribué) : ${notFound.join(', ')}`);
    }
    setFinishData({ tournamentId: '', winnerName: '', secondPlace: '', thirdPlace: '', mvpName: '' });
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Administration</h1>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Gestion de l'arène eGame Bénin</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("tickets")}
              className="w-full sm:w-auto rounded-2xl bg-emerald-600 px-5 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-500 flex items-center justify-center gap-2"
            >
              <MessageSquareText size={18} /> Tickets & validation
            </button>
            <Link
            to="/admin/organizers"
            className="w-full sm:w-auto rounded-2xl border border-[#8A2BE2]/40 bg-[#0F0F1E] px-5 py-3.5 text-xs font-black uppercase tracking-wider text-white transition-colors hover:border-[#A855F7] hover:bg-[#8A2BE2]/10 flex items-center justify-center gap-2"
          >
            Organisateurs V2
          </Link>
          <button
            type="button"
            onClick={handleSetupDiscordSupport}
              disabled={supportSetupLoading}
              className="w-full sm:w-auto rounded-2xl bg-[#5865F2] px-5 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#5865F2]/20 transition-colors hover:bg-[#4752C4] flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <DiscordLogo size={18} /> {supportSetupLoading ? "Configuration…" : "Support Discord"}
            </button>
          </div>
        </div>
        
        {/* Bannière de statut : création automatique de l'espace Discord du tournoi */}
        {discordStatus && (
          <div className={`bg-card p-6 rounded-[2.5rem] border shadow-sm space-y-4 relative ${
            discordStatus.status === 'ok' ? 'border-emerald-500/40' :
            discordStatus.status === 'failed' ? 'border-amber-500/50' : 'border-[#5865F2]/40'
          }`}>
            <button
              onClick={() => setDiscordStatus(null)}
              aria-label="Fermer"
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X size={14} />
            </button>

            <div className="flex items-center gap-3 pr-8 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#5865F2]/15 border border-[#5865F2]/40 flex items-center justify-center shrink-0">
                <DiscordLogo size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black break-words">
                  Espace Discord — {discordStatus.title || discordStatus.tournamentId}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Automatisation des tournois</p>
              </div>
            </div>

            {discordStatus.status === 'creating' && (
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-[#5865F2]" />
                Création de l'espace Discord en cours : rôle, catégorie privée et 5 salons…
              </p>
            )}

            {discordStatus.status === 'ok' && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Tournoi créé
                </p>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Espace Discord créé
                </p>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Automatisation des participants active
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed pt-1">
                  Rôle « 🏆 Participant — {discordStatus.title || 'tournoi'} » + catégorie privée avec
                  annonces, présence, matchs, preuves et aide. Les joueurs inscrits reçoivent le rôle
                  via « Activer mon accès Discord » sur la page du tournoi.
                </p>
              </div>
            )}

            {discordStatus.status === 'failed' && (
              <div className="space-y-3">
                <p className="text-sm font-black text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle size={16} /> Espace Discord non créé
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Le tournoi est bien créé et fonctionnel ; seule la création Discord a échoué
                  {discordStatus.message ? ` (${discordStatus.message})` : ''}.
                  Tu peux réessayer : aucune ressource ne sera dupliquée si l'espace existe déjà.
                </p>
                <button
                  onClick={() => invokeDiscordSpaceCreation(discordStatus.tournamentId, discordStatus.title)}
                  className="px-5 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={14} />
                  Réessayer la création Discord
                </button>
              </div>
            )}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
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
              <TabsTrigger value="checkins" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-[20px] data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all">Check-ins</TabsTrigger>
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
              createDiscordSpace={createDiscordSpace}
              setCreateDiscordSpace={setCreateDiscordSpace}
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
            <TicketsTab tournaments={allTournaments} initialTournamentId={ticketTournamentId} refreshTournaments={fetchData} />
          </TabsContent>

          <TabsContent value="partners-admin">
            <PartnersAdminTab />
          </TabsContent>

          <TabsContent value="checkins">
            <CheckInsAdminTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;