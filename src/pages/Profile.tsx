"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import PlayerBadge from '@/components/PlayerBadge';
import { motion } from 'framer-motion';
import { Trophy, Settings, LogOut, Star, Mail, History, Zap, ShieldCheck, Palette, Copy, Link as LinkIcon, HelpCircle, Sun, Moon, Shield, Award, Activity, Share2, Bell, BellOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { showError, showSuccess } from '@/utils/toast';
import { useTheme } from "next-themes";
import { requestNotificationPermission } from '@/lib/firebase';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tournamentCount, setTournamentCount] = useState(0);
  const [winCount, setWinCount] = useState(0);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          navigate('/auth');
          return;
        }
        setUser(user);
        
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        setProfile(profileData);
        
        const { count } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'Réussi');
        setTournamentCount(count || 0);

        if (profileData?.username) {
          const { data: leaderData } = await supabase.from('leaderboard').select('wins').eq('username', profileData.username);
          const totalWins = leaderData?.reduce((acc, curr) => acc + (curr.wins || 0), 0) || 0;
          setWinCount(totalWins);
        }
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
    showSuccess("Déconnexion réussie");
    navigate('/');
  };

  const toggleNotifications = async () => {
    try {
      if (!profile?.notifications_enabled) {
        const token = await requestNotificationPermission(user.id);
        if (token) {
          setProfile({ ...profile, notifications_enabled: true, fcm_token: token });
          showSuccess("Notifications activées !");
        } else {
          showError("Veuillez autoriser les notifications dans votre navigateur.");
        }
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({ notifications_enabled: false })
          .eq('id', user.id);
        
        if (!error) {
          setProfile({ ...profile, notifications_enabled: false });
          showSuccess("Notifications désactivées.");
        }
      }
    } catch (error: any) {
      console.error("Erreur toggle notifications:", error);
      showError("Erreur lors de la configuration des notifications.");
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
  const username = profile?.username || user.user_metadata?.username || user.email?.split('@')[0];
  const isAdmin = user.email === 'egamebenin@gmail.com';

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <section className="flex flex-col items-center mb-12">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-violet-600 overflow-hidden bg-muted shadow-2xl">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <Link to="/avatar-maker" className="absolute bottom-0 right-0 bg-violet-600 p-2 rounded-full border-4 border-background hover:scale-110 transition-transform text-white">
              <Palette size={16} />
            </Link>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <h1 className="text-3xl font-black">{username}</h1>
            <PlayerBadge tournamentCount={tournamentCount} size="md" />
          </div>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-1">{profile?.city || 'Bénin'}</p>
        </section>

        <section className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm text-center">
            <Activity className="mx-auto text-violet-500 mb-2" size={24} />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tournois</p>
            <p className="text-2xl font-black">{tournamentCount}</p>
          </div>
          <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm text-center">
            <Trophy className="mx-auto text-yellow-500 mb-2" size={24} />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Victoires</p>
            <p className="text-2xl font-black">{winCount}</p>
          </div>
        </section>

        <div className="space-y-4">
          <button onClick={toggleNotifications} className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border border-border font-bold shadow-sm">
            <div className="flex items-center gap-4">
              {profile?.notifications_enabled ? <Bell size={20} className="text-green-500" /> : <BellOff size={20} className="text-muted-foreground" />}
              Notifications Push
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${profile?.notifications_enabled ? 'bg-green-500' : 'bg-muted'}`}>
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${profile?.notifications_enabled ? 'right-1' : 'left-1'}`} />
            </div>
          </button>

          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border border-border font-bold shadow-sm">
            <div className="flex items-center gap-4">{theme === 'dark' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-indigo-500" />} Mode {theme === 'dark' ? 'Clair' : 'Sombre'}</div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-violet-600' : 'bg-muted'}`}><div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${theme === 'dark' ? 'right-1' : 'left-1'}`} /></div>
          </button>

          {isAdmin && (
            <Link to="/admin" className="block">
              <button className="w-full flex items-center justify-between p-5 bg-violet-600/10 rounded-2xl border border-violet-500/30 text-violet-500 font-bold"><div className="flex items-center gap-4"><ShieldCheck size={20} /> Panneau Admin</div></button>
            </Link>
          )}
          
          <Link to="/contact" className="block">
            <button className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border border-border font-bold shadow-sm"><div className="flex items-center gap-4"><HelpCircle size={20} className="text-violet-500" /> Contact & Aide</div></button>
          </Link>

          <Link to="/privacy" className="block">
            <button className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border border-border font-bold shadow-sm"><div className="flex items-center gap-4"><Shield size={20} className="text-cyan-500" /> Politique de Confidentialité</div></button>
          </Link>
          
          <Link to="/edit-profile" className="block">
            <button className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border border-border font-bold shadow-sm"><div className="flex items-center gap-4"><Settings size={20} className="text-muted-foreground" /> Modifier mes infos</div></button>
          </Link>
          
          <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border border-border text-red-400 font-bold shadow-sm"><div className="flex items-center gap-4"><LogOut size={20} /> Déconnexion</div></button>
        </div>
      </main>
    </div>
  );
};

export default Profile;