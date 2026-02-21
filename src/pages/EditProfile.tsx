"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Phone, Save, AtSign } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    phone: '',
    avatar_url: ''
  });

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, username, phone, avatar_url')
          .eq('id', user.id)
          .single();

        setProfile({
          full_name: profileData?.full_name || user.user_metadata?.full_name || '',
          username: profileData?.username || user.user_metadata?.username || '',
          phone: profileData?.phone || user.user_metadata?.phone || '',
          avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
        });
      }
    } catch (error) {
      console.error("Erreur profil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      await supabase.auth.updateUser({
        data: { ...profile }
      });

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          username: profile.username,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      showSuccess("Profil mis à jour !");
      navigate('/profile');
    } catch (error: any) {
      showError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft size={20} />
          Retour au profil
        </button>

        <h1 className="text-3xl font-black mb-8">Modifier le profil</h1>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="space-y-6 bg-card p-8 rounded-[2rem] border border-border shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="username">Pseudo (Nom de joueur)</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input 
                  id="username" 
                  value={profile.username}
                  onChange={(e) => setProfile({...profile, username: e.target.value})}
                  className="pl-10 bg-muted border-border rounded-xl"
                  placeholder="Ex: ProGamer229"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input 
                  id="name" 
                  value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  className="pl-10 bg-muted border-border rounded-xl"
                  placeholder="Votre nom réel"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone (Bénin)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input 
                  id="phone" 
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="pl-10 bg-muted border-border rounded-xl"
                  placeholder="+229 01 XX XX XX XX"
                  required
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full py-8 rounded-2xl bg-violet-600 hover:bg-violet-700 text-lg font-bold shadow-xl shadow-violet-500/20 gap-2 text-white">
            <Save size={20} />
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default EditProfile;