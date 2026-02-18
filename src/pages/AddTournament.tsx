"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, PlusCircle, Image as ImageIcon } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const AddTournament = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    game: '',
    image_url: '',
    prize_pool: '',
    entry_fee: 0,
    max_participants: 32,
    type: 'Online',
    start_date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('tournaments')
        .insert([{
          ...formData,
          status: 'active' // C'est ici qu'on force le statut à 'active'
        }]);

      if (error) throw error;

      showSuccess("Tournoi ajouté avec succès !");
      navigate('/');
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} />
          Retour
        </button>

        <h1 className="text-3xl font-black mb-8">Ajouter un Tournoi</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/50 p-8 rounded-[2rem] border border-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Titre du tournoi</Label>
              <Input 
                placeholder="Ex: Coupe d'Afrique PUBG" 
                className="bg-zinc-800 border-zinc-700"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Nom du Jeu</Label>
              <Input 
                placeholder="Ex: PUBG Mobile" 
                className="bg-zinc-800 border-zinc-700"
                value={formData.game}
                onChange={(e) => setFormData({...formData, game: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>URL de l'image (Couverture)</Label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-3 text-zinc-500" size={18} />
              <Input 
                placeholder="https://..." 
                className="pl-10 bg-zinc-800 border-zinc-700"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Cash Prize (Récompense)</Label>
              <Input 
                placeholder="Ex: 50.000 FCFA" 
                className="bg-zinc-800 border-zinc-700"
                value={formData.prize_pool}
                onChange={(e) => setFormData({...formData, prize_pool: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Frais d'entrée (FCFA)</Label>
              <Input 
                type="number"
                className="bg-zinc-800 border-zinc-700"
                value={formData.entry_fee}
                onChange={(e) => setFormData({...formData, entry_fee: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="Online" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="Online">En ligne</SelectItem>
                  <SelectItem value="Presentiel">Présentiel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Input 
                type="date"
                className="bg-zinc-800 border-zinc-700"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full py-8 rounded-2xl bg-violet-600 hover:bg-violet-700 text-lg font-bold gap-2">
            <PlusCircle size={20} />
            {loading ? "Création..." : "Publier le tournoi"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default AddTournament;