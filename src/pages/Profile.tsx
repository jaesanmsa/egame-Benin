"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import PlayerBadge from '@/components/PlayerBadge';
import SEO from '@/components/SEO';
import { Settings, LogOut, Star, Palette, Activity, Zap, Award, Bell, BellOff, History, LayoutDashboard, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getCountryByCode } from '@/lib/countries';
import { useNavigate, Link } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';
import { requestNotificationPermission } from '@/lib/firebase';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tournamentCount, setTournamentCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/auth'); return; }
        setUser(user);
        
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        setProfile(profileData);
        
        const { count } = await supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'Réussi');
        
        setTournamentCount(count || 0);
      } catch (err) {
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };
    getUserData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showSuccess("Déconnexion réussie !");
    navigate('/');
  };

  const handleToggleNotifications = async () => {
    setNotifLoading(true);
    try {
      if (profile?.notifications_enabled) {
        await supabase
          .from('profiles')
          .update({ notifications_enabled: false })
          .eq('id', user.id);
        showSuccess("Notifications désactivées.");
      } else {
        await requestNotificationPermission(user.id);
        showSuccess("Notifications activées !");
      }
      
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setNotifLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#07070C] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#8A2BE2] border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
  const username = profile?.username || user.user_metadata?.username || user.email?.split('@')[0];
  const country = getCountryByCode(profile?.country);
  const city = profile?.city || "";
  const location = [city, country?.name].filter(Boolean).join(', ') || "Afrique";
  const phone = profile?.phone || "Non renseigné";
  const isAdmin = user.email?.toLowerCase() === 'egamebenin@gmail.com';
  const displayPoints = profile?.points || (tournamentCount * 10);

  return (
    <div className="min-h-screen bg-[#07070C] text-white pb-32 pt-28">
      <SEO title={`Profil de ${username}`} noindex />
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 space-y-8">
        <div className="glass-panel p-8 text-center space-y-4 relative overflow-hidden">
          <div className="relative inline-block mx-auto">
            <div className="w-28 h-28 rounded-full border-4 border-[#8A2BE2] overflow-hidden bg-[#07070C] shadow-2xl mx-auto">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <Link to="/avatar-maker" className="absolute bottom-0 right-0 bg-[#8A2BE2] p-2.5 rounded-full border-2 border-[#07070C] hover:scale-110 transition-transform text-white shadow-lg">
              <Palette size={16} />
            </Link>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-gaming font-black text-white">{username}</h1>
            <p className="text-xs font-bold text-[#8888AA] flex items-center justify-center gap-1">
              <MapPin size={14} className="text-[#8A2BE2]" /> {country ? `${country.flag} ` : ''}{location}
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <PlayerBadge 
              tournamentCount={tournamentCount} 
              mvpCount={profile?.mvp_count} 
              championCount={profile?.champion_count} 
              size="md" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-5 text-center space-y-1">
            <Activity className="mx-auto text-[#8A2BE2]" size={22} />
            <p className="text-[10px] font-gaming font-bold text-[#8888AA] uppercase">Tournois</p>
            <p className="text-xl font-gaming font-black text-white">{tournamentCount}</p>
          </div>

          <div className="glass-panel p-5 text-center space-y-1 border-[#FFD700]/30">
            <Zap className="mx-auto text-[#FFD700]" size={22} />
            <p className="text-[10px] font-gaming font-bold text-[#8888AA] uppercase">Points</p>
            <p className="text-xl font-gaming font-black text-[#FFD700]">{displayPoints}</p>
          </div>

          <div className="glass-panel p-5 text-center space-y-1 border-emerald-500/30">
            <Award className="mx-auto text-emerald-400" size={22} />
            <p className="text-[10px] font-gaming font-bold text-[#8888AA] uppercase">Victoires</p>
            <p className="text-xl font-gaming font-black text-emerald-400">{profile?.champion_count || 0}</p>
          </div>

          <div className="glass-panel p-5 text-center space-y-1 border-orange-500/30">
            <Star className="mx-auto text-orange-400" size={22} />
            <p className="text-[10px] font-gaming font-bold text-[#8888AA] uppercase">MVP</p>
            <p className="text-xl font-gaming font-black text-orange-400">{profile?.mvp_count || 0}</p>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Phone size={20} className="text-[#8A2BE2]" />
            <div>
              <p className="text-xs font-gaming font-bold text-white">Numéro Mobile Money</p>
              <p className="text-xs text-[#8888AA] font-mono">{phone}</p>
            </div>
          </div>
          <Link to="/edit-profile" className="text-xs font-gaming font-bold text-[#A855F7] hover:underline">
            Modifier
          </Link>
        </div>

        <div className="space-y-3">
          {isAdmin && (
            <Link to="/admin" className="block">
              <button className="w-full btn-neon p-4 rounded-2xl font-gaming font-black text-xs uppercase tracking-wider flex items-center justify-between shadow-lg shadow-[#8A2BE2]/30 transition-all">
                <span className="flex items-center gap-3"><LayoutDashboard size={18} /> Dashboard Administration</span>
                <span>→</span>
              </button>
            </Link>
          )}

          <Link to="/payments" className="block">
            <button className="w-full glass-panel hover:border-[#8A2BE2] p-4 rounded-2xl font-gaming font-bold text-xs uppercase text-white flex items-center justify-between transition-all">
              <span className="flex items-center gap-3"><History size={18} className="text-[#8A2BE2]" /> Historique des Inscriptions</span>
              <span>→</span>
            </button>
          </Link>

          <button 
            onClick={handleToggleNotifications} 
            disabled={notifLoading}
            className="w-full glass-panel hover:border-[#8A2BE2] p-4 rounded-2xl font-gaming font-bold text-xs uppercase text-white flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-3">
              {profile?.notifications_enabled ? <Bell size={18} className="text-emerald-400" /> : <BellOff size={18} className="text-[#8888AA]" />}
              {profile?.notifications_enabled ? "Notifications Activées" : "Activer les Notifications Push"}
            </span>
          </button>

          <Link to="/edit-profile" className="block">
            <button className="w-full glass-panel hover:border-[#8A2BE2] p-4 rounded-2xl font-gaming font-bold text-xs uppercase text-white flex items-center justify-between transition-all">
              <span className="flex items-center gap-3"><Settings size={18} className="text-[#8888AA]" /> Modifier mon profil</span>
              <span>→</span>
            </button>
          </Link>

          <button 
            onClick={handleLogout} 
            className="w-full glass-panel border-red-500/20 hover:border-red-500 text-red-400 p-4 rounded-2xl font-gaming font-bold text-xs uppercase flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-3"><LogOut size={18} /> Déconnexion</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Profile;