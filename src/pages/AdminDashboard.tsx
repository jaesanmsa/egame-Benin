"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Plus, Users, Globe, MapPin, Check, X, CreditCard, History, Search, Settings, Edit3, Star, Link as LinkIcon, User, LayoutDashboard, BarChart3 } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { motion } from 'framer-motion';

const CITIES = ["Cotonou", "Porto-Novo", "Parakou", "Ouidah", "Abomey-Calavi", "Autre"];
const GAMES = ["Blur", "COD Modern Warfare 4", "COD Mobile", "BombSquad", "Clash Royale", "Clash of Clans", "Free Fire", "Autre"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTournaments, setActiveTournaments] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedTournamentForParticipants, setSelectedTournamentForParticipants] = useState<string>("");
  const [participantsList, setParticipantsList] = useState<any[]>([]);
  
  const [newTournament, setNewTournament] = useState({
    id: '', title: '', game: 'Blur', image_url: '', entry_fee: 0, prize_pool: '', type: 'Online', max_participants: 40, rules: '', payment_url: '', city: 'Cotonou'
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
    setSelectedTournamentForParticipants(tournamentId);
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
      setNewTournament({ id: '', title: '', game: 'Blur', image_url: '', entry_fee: 0, prize_pool: '', type: 'Online', max_participants: 40, rules: '', payment_url: '', city: 'Cotonou' });
      fetchData();
    }
  };

  const handleUpdateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('tournaments')
      .update({ 
        rules: editingTournament.rules,
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

  const filteredPayments = allPayments.filter(pay => {
    const query = searchQuery.toLowerCase();
    return (
      pay.validation_code?.toLowerCase().includes(query) ||
      pay.profiles?.username?.toLowerCase().includes(query) ||
      pay.profiles?.full_name?.toLowerCase().includes(query) ||
      pay.tournament_name?.toLowerCase().includes(query)
    );
  });

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

          <TabsContent value="payments" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <h2 className="text-xl font-black flex items-center gap-3"><CreditCard className="text-violet-500" /> Historique des Flux</h2>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-3.5 text-muted-foreground" size={18} />
                  <Input 
                    placeholder="Rechercher un code ou pseudo..." 
                    className="pl-12 py-6 bg-muted/50 border-border rounded-2xl focus:ring-violet-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4">
                {filteredPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <Search size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground font-bold italic">Aucune transaction trouvée</p>
                  </div>
                ) : (
                  filteredPayments.map((pay) => (
                    <div key={pay.id} className="bg-muted/30 p-5 rounded-2xl border border-border/50 flex items-center justify-between hover:border-violet-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pay.status === 'Réussi' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <p className="font-black text-sm">{pay.profiles?.username || pay.profiles?.full_name || "Joueur"}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{pay.tournament_name} • {pay.amount} FCFA</p>
                          {pay.status === 'Réussi' && (
                            <p className="text-[10px] font-mono text-violet-500 mt-1 bg-violet-500/5 px-2 py-0.5 rounded inline-block border border-violet-500/10">Code: {pay.validation_code}</p>
                          )}
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${pay.status === 'Réussi' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                        {pay.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="participants" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
              <h2 className="text-xl font-black mb-8 flex items-center gap-3"><Users className="text-cyan-500" /> Liste des Champions</h2>
              
              <div className="mb-10">
                <Label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sélectionner un tournoi actif</Label>
                <Select onValueChange={fetchParticipants}>
                  <SelectTrigger className="py-7 bg-muted/50 border-border rounded-2xl text-sm font-bold">
                    <SelectValue placeholder="Choisir un tournoi" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {activeTournaments.map(t => (
                      <SelectItem key={t.id} value={t.id} className="font-bold">{t.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTournamentForParticipants && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{participantsList.length} Joueurs confirmés</p>
                    <Button variant="outline" size="sm" className="text-[9px] font-black uppercase tracking-widest rounded-xl h-8">Exporter CSV</Button>
                  </div>
                  {participantsList.length === 0 ? (
                    <div className="text-center py-12 bg-muted/20 rounded-3xl border border-dashed border-border">
                      <Users size={32} className="mx-auto text-muted-foreground/20 mb-3" />
                      <p className="text-muted-foreground text-xs font-bold italic">Aucun joueur inscrit pour le moment.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {participantsList.map((p, i) => (
                        <div key={i} className="bg-muted/30 p-5 rounded-2xl border border-border/50 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-violet-600/10 rounded-full flex items-center justify-center text-violet-500 border border-violet-500/20">
                              <User size={24} />
                            </div>
                            <div>
                              <p className="font-black text-sm">{p.profiles?.username || "Sans pseudo"}</p>
                              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{p.profiles?.full_name} • {p.profiles?.city}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-violet-500">{p.profiles?.phone || "Pas de numéro"}</p>
                            <p className="text-[9px] text-muted-foreground font-mono mt-1">{p.validation_code}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="tournaments" className="space-y-6">
            <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleAddTournament} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-8">
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
                  <Select onValueChange={(v) => setNewTournament({...newTournament, game: v})} defaultValue="Blur">
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
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Cash Prize</Label>
                  <Input placeholder="ex: 50.000 FCFA" value={newTournament.prize_pool} onChange={e => setNewTournament({...newTournament, prize_pool: e.target.value})} className="py-6 bg-muted/50 border-border rounded-xl" />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Lien de paiement FedaPay</Label>
                  <Input placeholder="https://me.fedapay.com/..." value={newTournament.payment_url} onChange={e => setNewTournament({...newTournament, payment_url: e.target.value})} className="py-6 bg-muted/50 border-border rounded-xl" />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Règlement</Label>
                  <Textarea placeholder="Règlement du tournoi..." value={newTournament.rules} onChange={e => setNewTournament({...newTournament, rules: e.target.value})} className="bg-muted/50 border-border rounded-2xl min-h-[120px] p-4" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 py-8 rounded-2xl font-black text-base shadow-xl shadow-violet-500/20 text-white">Créer le tournoi</Button>
            </motion.form>
          </TabsContent>

          <TabsContent value="edit" className="space-y-6">
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
                <form onSubmit={handleUpdateTournament} className="space-y-6">
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
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Lien de paiement FedaPay</Label>
                      <Input 
                        value={editingTournament.payment_url || ''} 
                        onChange={e => setEditingTournament({...editingTournament, payment_url: e.target.value})}
                        className="py-6 bg-muted/50 border-border rounded-xl"
                        placeholder="https://me.fedapay.com/..."
                      />
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
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Règlement</Label>
                      <Textarea 
                        value={editingTournament.rules || ''} 
                        onChange={e => setEditingTournament({...editingTournament, rules: e.target.value})}
                        className="bg-muted/50 border-border rounded-2xl min-h-[150px] p-4"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 py-8 rounded-2xl font-black text-base shadow-xl shadow-cyan-500/20 text-white">Enregistrer les modifications</Button>
                </form>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="finish" className="space-y-6">
            <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleFinishTournament} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-8">
              <h2 className="text-xl font-black flex items-center gap-3"><History className="text-orange-500" /> Terminer un tournoi</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Sélectionner le tournoi</Label>
                  <Select onValueChange={(v) => setFinishData({...finishData, tournamentId: v})}>
                    <SelectTrigger className="py-7 bg-muted/50 border-border rounded-2xl text-sm font-bold">
                      <SelectValue placeholder="Choisir un tournoi actif" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {activeTournaments.map(t => (
                        <SelectItem key={t.id} value={t.id} className="font-bold">{t.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Pseudo du gagnant</Label>
                  <Input placeholder="Nom du champion" value={finishData.winnerName} onChange={e => setFinishData({...finishData, winnerName: e.target.value})} className="py-6 bg-muted/50 border-border rounded-xl" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Lien Avatar du gagnant (Emoji)</Label>
                  <Input placeholder="ex: 🏆" value={finishData.winnerAvatar} onChange={e => setFinishData({...finishData, winnerAvatar: e.target.value})} className="py-6 bg-muted/50 border-border rounded-xl" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 py-8 rounded-2xl font-black text-base shadow-xl shadow-orange-500/20 text-white">Clôturer et afficher le gagnant</Button>
            </motion.form>
          </TabsContent>

          <TabsContent value="leaderboard">
            <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleUpdateLeader} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-8">
              <h2 className="text-xl font-black flex items-center gap-3"><Star className="text-yellow-500" /> Modifier le Top 5</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Rang (1-5)</Label>
                  <Input type="number" min="1" max="5" value={newLeader.rank} onChange={e => setNewLeader({...newLeader, rank: parseInt(e.target.value)})} className="py-6 bg-muted/50 border-border rounded-xl" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Discipline</Label>
                  <Select onValueChange={(v) => setNewLeader({...newLeader, game_id: v})} defaultValue="blur">
                    <SelectTrigger className="py-6 bg-muted/50 border-border rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="blur" className="font-bold">Blur</SelectItem>
                      <SelectItem value="cod-mw4" className="font-bold">COD MW4</SelectItem>
                      <SelectItem value="cod-mobile" className="font-bold">COD Mobile</SelectItem>
                      <SelectItem value="bombsquad" className="font-bold">BombSquad</SelectItem>
                      <SelectItem value="clash-royale" className="font-bold">Clash Royale</SelectItem>
                      <SelectItem value="clash-of-clans" className="font-bold">Clash of Clans</SelectItem>
                      <SelectItem value="free-fire" className="font-bold">Free Fire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Pseudo</Label>
                  <Input placeholder="Nom du joueur" value={newLeader.username} onChange={e => setNewLeader({...newLeader, username: e.target.value})} className="py-6 bg-muted/50 border-border rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Points</Label>
                  <Input type="number" value={newLeader.wins} onChange={e => setNewLeader({...newLeader, wins: parseInt(e.target.value)})} className="py-6 bg-muted/50 border-border rounded-xl" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Lien Avatar Emoji</Label>
                  <Input placeholder="ex: 🎮" value={newLeader.avatar_url} onChange={e => setNewLeader({...newLeader, avatar_url: e.target.value})} className="py-6 bg-muted/50 border-border rounded-xl" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 py-8 rounded-2xl font-black text-base shadow-xl shadow-violet-500/20 text-white">Mettre à jour le classement</Button>
            </motion.form>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;