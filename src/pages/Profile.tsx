"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import PlayerBadge from '@/components/PlayerBadge';
import { motion } from 'framer-motion';
import { Trophy, Settings, LogOut, Star, Palette, HelpCircle, Sun, Moon, Shield, Activity, Zap, TrendingUp, Award, Bell, BellOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';
import { useTheme } from "next-themes";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import { requestNotificationPermission } from '@/lib/firebase';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tournamentCount, setTournamentCount] = useState(0);
  const [progressionData, setProgressionData] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/auth'); return; }
        setUser(user);
        
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        setProfile(profileData);
        
        const { data: payments, count } = await supabase
          .from('payments')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('status', 'Réussi')
          .order('created_at', { ascending: true });
        
        setTournamentCount(count || 0);

        if (payments) {
          let currentPoints = 0;
          const chartData = payments.map((p, i) => {
            currentPoints += 10;
            return {
              name: `T${i+1}`,
              points: currentPoints
            };
          });
          setProgressionData(chartData);
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

  const handleToggleNotifications = async () => {
    if (profile?.notifications_enabled) {
      showError("Désactivation manuelle non disponible pour le moment.");
      return;
    }

    setNotifLoading(true);
    try {
      await requestNotificationPermission(user.id);
      showSuccess("Notifications activées !");
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setNotifLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
  const username = profile?.username || user.user_metadata?.username || user.email?.split('@')[0];
  
  // On affiche soit les points de la DB, soit le calcul basé sur les tournois si la DB est à 0
  const displayPoints = profile?.points || (tournamentCount * 10);

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
          <div className="flex flex-col items-center gap-2 mt-4">
            <h1 className="text-3xl font-black">{username}</h1>
            <PlayerBadge 
              tournamentCount={tournamentCount} 
              mvpCount={profile?.mvp_count} 
              championCount={profile?.champion_count} 
              size="md" 
            />
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm text-center">
            <Activity className="mx-auto text-violet-500 mb-2" size={24} />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tournois</p>
            <p className="text-2xl font-black">{tournamentCount}</p>
          </div>
          <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm text-center">
            <Zap className="mx-auto text-yellow-500 mb-2" size={24} />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Points</p>
            <p className="text-2xl font-black">{displayPoints}</p>
          </div>
          <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm text-center">
            <Award className="mx-auto text-cyan-500 mb-2" size={24} />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Victoires</p>
            <p className="text-2xl font-black">{profile?.champion_count || 0}</p>
          </div>
          <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm text-center">
            <Star className="mx-auto text-orange-500 mb-2" size={24} />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">MVP</p>
            <p className="text-2xl font-black">{profile?.mvp_count || 0}</p>
          </div>
        </section>

        <section className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-violet-600/10 rounded-xl flex items-center justify-center text-violet-500"><TrendingUp size={20} /></div>
            <h2 className="text-sm font-black uppercase tracking-widest">Courbe de Progression</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#88888822" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <ChartTooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
                <Line type="monotone" dataKey="points" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="space-y-4">
          <button 
            onClick={handleToggleNotifications} 
            disabled={notifLoading || profile?.notifications_enabled}
            className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border border-border font-bold shadow-sm"
          >
            <div className="flex items-center gap-4">
              {profile?.notifications_enabled ? <Bell size={20} className="text-green-500" /> : <BellOff size={20} className="text-muted-foreground" />}
              {profile?.notifications_enabled ? "Notifications Activées" : "Activer les Notifications Push"}
            </div>
            {notifLoading && <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />}
          </button>

          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border border-border font-bold shadow-sm">
            <div className="flex items-center gap-4">{theme === 'dark' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-indigo-500" />} Mode {theme === 'dark' ? 'Clair' : 'Sombre'}</div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-violet-600' : 'bg-muted'}`}><div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${theme === 'dark' ? 'right-1' : 'left-1'}`} /></div>
          </button>
          
          <Link to="/contact" className="block"><button className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border border-border font-bold shadow-sm"><div className="flex items-center gap-4"><HelpCircle size={20} className="text-violet-500" /> Contact & Aide</div></button></Link>
          <Link to="/privacy" className="block"><button className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border border-border font-bold shadow-sm"><div className="flex items-center gap-4"><Shield size={20} className="text-cyan-500" /> Politique de Confidentialité</div></button></Link>
          <Link to="/edit-profile" className="block"><button className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border border-border font-bold shadow-sm"><div className="flex items-center gap-4"><Settings size={20} className="text-muted-foreground" /> Modifier mes infos</div></button></Link>
          <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border border-border text-red-400 font-bold shadow-sm"><div className="flex items-center gap-4"><LogOut size={20} /> Déconnexion</div></button>
        </div>
      </main>
    </div>
  );
};

export default Profile;