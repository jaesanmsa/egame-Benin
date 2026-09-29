"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import PhoneCountryInput, { setPhoneCountry } from '@/components/PhoneCountryInput';
import { AFRICAN_COUNTRIES, getCountryByCode } from '@/lib/countries';
import { getTimezonesForCountry, proposeTimezone, isValidTimezone } from '@/lib/timezones';
import { ArrowLeft, User, Save, AtSign, MapPin, Globe, Clock, Hourglass } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkin, setCheckin] = useState<any>(null);
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    phone: '',
    country: '',
    city: '',
    avatar_url: '',
    timezone: ''
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
          .select('full_name, username, phone, country, city, avatar_url, timezone')
          .eq('id', user.id)
          .maybeSingle();

        setProfile({
          full_name: profileData?.full_name || user.user_metadata?.full_name || '',
          username: profileData?.username || user.user_metadata?.username || '',
          phone: profileData?.phone || user.user_metadata?.phone || '',
          // Pas de pays par défaut : le joueur DOIT choisir son pays lui-même
          // (notamment après une inscription Google) pour activer le check-in.
          country: profileData?.country || '',
          city: profileData?.city || '',
          avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
          timezone: isValidTimezone(profileData?.timezone)
            ? profileData.timezone
            : (profileData?.country ? proposeTimezone(profileData.country) : '')
        });

        // État check-in : bannière du changement programmé + série active.
        const { data: cs } = await supabase.rpc('get_checkin_state');
        setCheckin(cs || null);
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
    if (!profile.country) return showError("Sélectionne ton pays : il est obligatoire pour le check-in quotidien.");
    if (!profile.timezone) return showError("Sélectionne ton fuseau horaire : il est obligatoire pour le check-in quotidien.");

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      // Profil actuel pour détecter les changements
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('country, timezone')
        .eq('id', user.id)
        .maybeSingle();

      const countryChanged = !!currentProfile && currentProfile.country !== profile.country;
      const timezoneChanged = !!currentProfile && currentProfile.timezone !== profile.timezone;
      const geoChanged = countryChanged || timezoneChanged;

      // État check-in frais : y a-t-il une série de 7 jours en cours ?
      const { data: cs } = await supabase.rpc('get_checkin_state');
      const activeCycle = cs?.country_configured === true && cs?.cycle_status === 'active';

      let savedCountry = profile.country;
      let savedTimezone = profile.timezone;
      let pendingRequested = false;

      if (geoChanged && activeCycle) {
        // Pendant une série active : le changement est PROGRAMMÉ (une seule fois
        // par série) et sera appliqué à la fin de la série, après le Jour 7.
        // La série en cours garde son pays/fuseau verrouillé : impossible de tricher.
        const { error: pendingError } = await supabase.rpc('request_checkin_country_change', {
          p_country: profile.country,
          p_timezone: profile.timezone,
        });
        if (pendingError) {
          if (pendingError.message.includes('DEJA_MODIFIE_PENDANT_SERIE')) {
            return showError("Tu as déjà programmé un changement de pays pour cette série de 7 jours. Il sera appliqué après le Jour 7.");
          }
          if (pendingError.message.includes('AUCUNE_SERIE_ACTIVE')) {
            // La série vient de se terminer : changement direct autorisé.
          } else {
            throw new Error(pendingError.message);
          }
        } else {
          // Le profil garde l'ANCIEN pays/fuseau jusqu'à la fin de la série.
          savedCountry = currentProfile!.country || profile.country;
          savedTimezone = currentProfile!.timezone || profile.timezone;
          pendingRequested = true;
        }
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          username: username,
          phone: profile.phone,
          country: savedCountry,
          city: profile.city,
          avatar_url: profile.avatar_url,
          timezone: savedTimezone,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // Historique des changements directs. Quand le changement est programmé,
      // c'est le serveur qui enregistre l'historique à son application (Jour 7).
      if (currentProfile && !pendingRequested) {
        const countryChangedNow = currentProfile.country !== savedCountry;
        const timezoneChangedNow = currentProfile.timezone !== savedTimezone;

        if (countryChangedNow || timezoneChangedNow) {
          await supabase.from('profile_history').insert({
            user_id: user.id,
            country: savedCountry,
            timezone: savedTimezone
          });
        }
      }

      await supabase.auth.updateUser({
        data: { ...profile, country: savedCountry, timezone: savedTimezone, username: username }
      });

      showSuccess(pendingRequested
        ? "Changement programmé ! Il sera appliqué après le Jour 7 de ta série en cours."
        : "Profil mis à jour !");
      navigate('/profil');
    } catch (error: any) {
      showError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#8A2BE2] border-t-transparent rounded-full animate-spin" /></div>;

  const pendingCountry = checkin?.pending_country ? getCountryByCode(checkin.pending_country) : null;
  const activeCycle = checkin?.cycle_status === 'active';

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
            {pendingCountry && checkin?.pending_timezone && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 flex items-center gap-2">
                <Hourglass size={14} className="text-amber-400 shrink-0" />
                <p className="text-[10px] text-amber-200/90 font-bold leading-relaxed">
                  Changement déjà programmé : {pendingCountry.flag} {pendingCountry.name} • {checkin.pending_timezone}.
                  Il sera appliqué après le Jour 7 de ta série en cours — une seule modification par série.
                </p>
              </div>
            )}

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
                <Label htmlFor="country" className="text-xs font-gaming uppercase text-[#8888AA]">
                  Pays <span className="text-[#A855F7]">*</span>
                </Label>
                <Select value={profile.country} onValueChange={(country) => setProfile({ ...profile, country, phone: setPhoneCountry(profile.phone, country), timezone: proposeTimezone(country) })}>
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

            <div className="space-y-1.5">
              <Label htmlFor="timezone" className="text-xs font-gaming uppercase text-[#8888AA] flex items-center gap-1.5">
                <Clock size={13} className="text-[#8A2BE2]" /> Fuseau horaire <span className="text-[#A855F7]">*</span>
              </Label>
              <Select value={profile.timezone} onValueChange={(timezone) => setProfile({ ...profile, timezone })}>
                <SelectTrigger id="timezone" className="bg-[#0A0A0F] border-[#8A2BE2]/30 rounded-xl text-white font-medium">
                  <span className="text-xs font-mono">{profile.timezone || 'Sélectionner'}</span>
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F1E] border-[#8A2BE2]/40 text-white max-h-80">
                  {profile.country ? (
                    <>
                      {getTimezonesForCountry(profile.country).map((tz) => (
                        <SelectItem key={tz} value={tz} className="text-xs font-mono">
                          {tz}
                        </SelectItem>
                      ))}
                      {profile.timezone && !getTimezonesForCountry(profile.country).includes(profile.timezone) && (
                        <SelectItem key={profile.timezone} value={profile.timezone} className="text-xs font-mono text-orange-400">
                          {profile.timezone} (personnalisé)
                        </SelectItem>
                      )}
                    </>
                  ) : (
                    <div className="px-3 py-2 text-[10px] text-[#8888AA]">
                      Choisis d'abord ton pays : le fuseau sera proposé automatiquement.
                    </div>
                  )}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-[#8888AA]/70">
                Utilisé pour ton check-in quotidien (série 7 jours).
                {activeCycle
                  ? " Série en cours : ton changement sera programmé (une seule fois par série) et appliqué après le Jour 7."
                  : " Hors série, le changement s'applique directement à ta prochaine série."}
              </p>
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
