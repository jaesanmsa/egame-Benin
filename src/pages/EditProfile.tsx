"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import PhoneCountryInput, { setPhoneCountry } from '@/components/PhoneCountryInput';
import { AFRICAN_COUNTRIES, getCountryByCode } from '@/lib/countries';
import { ArrowLeft, User, Save, AtSign, MapPin, Globe } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    phone: '',
    country: 'BJ',
    city: '',
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
          .select('full_name, username, phone, country, city, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        setProfile({
          full_name: profileData?.full_name || user.user_metadata?.full_name || '',
          username: profileData?.username || user.user_metadata?.username || '',
          phone: profileData?.phone || user.user_metadata?.phone || '',
          country: profileData?.country || 'BJ',
          city: profileData?.city || '',
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
    const username = profile.username.trim();
    if (!username) return showError("Le pseudo est obligatoire");
    if (username.length < 3) return showError("Le pseudo doit faire au moins 3 caractères");

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          username: username,
          phone: profile.phone,
          country: profile.country,
          city: profile.city,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      await supabase.auth.updateUser({
        data: { ...profile, username: username }
      });

      showSuccess("Profil mis à jour !");
      navigate('/profil');
    } catch (error: any) {
      showError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#8A2BE2] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-32 pt-24">
      <SEO title="Modifier mon profil" noindex />
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 space-y-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#8888AA] hover:text-white transition-colors text-xs font-gaming font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> Retour
        </button>

        <h1 className="text-3xl font-gaming font-black uppercase text-white">Modifier le profil</h1>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-[#0F0F1E] border border-[#8A2BE2]/30 p-8 rounded-3xl space-y-5 shadow-2xl">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-gaming uppercase text-[#8888AA]">Pseudo de Joueur</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-3 text-[#8888AA]" size={18} />
                <Input 
                  id="username" 
                  value={profile.username}
                  onChange={(e) => setProfile({...profile, username: e.target.value})}
                  className="pl-10 bg-[#0A0A0F] border-[#8A2BE2]/30 rounded-xl text-white font-medium"
                  placeholder="Ex: ProGamer229"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-gaming uppercase text-[#8888AA]">Nom Complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-[#8888AA]" size={18} />
                <Input 
                  id="name" 
                  value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  className="pl-10 bg-[#0A0A0F] border-[#8A2BE2]/30 rounded-xl text-white font-medium"
                  placeholder="Votre nom réel"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-gaming uppercase text-[#8888AA]">Numéro Mobile Money</Label>
              <PhoneCountryInput
                id="phone"
                value={profile.phone}
                onChange={(phone) => setProfile({ ...profile, phone })}
                defaultCountryCode={profile.country}
              />
              <p className="text-[10px] text-[#8888AA]/70">Sélectionne ton pays africain puis saisis ton numéro (Orange, MTN, Moov, M-Pesa, Wave...)</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="country" className="text-xs font-gaming uppercase text-[#8888AA]">Pays</Label>
                <Select value={profile.country} onValueChange={(country) => setProfile({ ...profile, country, phone: setPhoneCountry(profile.phone, country) })}>
                  <SelectTrigger id="country" className="bg-[#0A0A0F] border-[#8A2BE2]/30 rounded-xl text-white font-medium">
                    <span className="flex items-center gap-2 text-sm">
                      <Globe size={16} className="text-[#8A2BE2] shrink-0" />
                      {getCountryByCode(profile.country)
                        ? `${getCountryByCode(profile.country)!.flag} ${getCountryByCode(profile.country)!.name}`
                        : '🌍 Choisis ton pays'}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F0F1E] border-[#8A2BE2]/40 text-white max-h-80">
                    {AFRICAN_COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code} className="text-xs">
                        {country.flag} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-gaming uppercase text-[#8888AA]">Ville</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-[#8888AA]" size={18} />
                  <Input
                    id="city"
                    value={profile.city}
                    onChange={(e) => setProfile({...profile, city: e.target.value})}
                    className="pl-10 bg-[#0A0A0F] border-[#8A2BE2]/30 rounded-xl text-white font-medium"
                    placeholder="Ex : Cotonou, Abidjan, Lagos..."
                  />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full btn-glow-border py-4 text-xs tracking-widest uppercase flex items-center justify-center gap-2">
            <Save size={18} />
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default EditProfile;