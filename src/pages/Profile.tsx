"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Trophy, Settings, LogOut, Star, Mail, History, Zap, ShieldCheck, Palette, Copy, Link as LinkIcon, HelpCircle, Sun, Moon, Shield, Award, Activity, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { showError, showSuccess } from '@/utils/toast';
import { Progress } from "@/components/ui/progress";
import { useTheme } from "next-themes";

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

        // On simule ou récupère les victoires depuis le leaderboard si le pseudo correspond
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

  const handleShareProfile = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    showSuccess("Lien du profil copié !");
  };

  const getLevelInfo = (count: number) => {
    if (count < 5) return { level: 1, next: 5, label: "Novice", progress: (count / 5) * 100, color: "text-zinc-400" };
    if (count < 10) return { level: 2, next: 10, label: "Guerrier", progress: ((count - 5) / 5) * 100, color: "text-orange-500" };
    if (count < 20) return { level: 3, next: 20, label: "Élite", progress: ((count - 10) / 10) * 100, color: "text-violet-500" };
    return { level: 4, next: 40, label: "Maître", progress: ((count - 20) / 20) * 100, color: "text-yellow-500" };
  };

  const levelInfo = getLevelInfo(tournamentCount);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
  const username = profile?.username || user.user_metadata?.username || user.email?.split('@')[0];
  const isAdmin = user.email === 'egamebenin@gmail.com';

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 pt-12 md:pt-24">
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
          <h1 className="text-3xl font-black mt-4">{username}</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className={`px-3 py-1 rounded-full bg-muted border border-border text-[10px] font-black uppercase tracking-widest ${levelInfo.color}`}>
              {levelInfo.label}
            </div>
            <button onClick={handleShareProfile} className="p-2 bg-muted rounded-full border border-border hover:text-violet-500 transition-colors">
              <Share2 size={14} />
            </button>
          </div>
        </section>

        {/* Player Stats Card */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
          <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm text-center">
            <Star className="mx-auto text-cyan-500 mb-2" size={24} />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Points</p>
            <p className="text-2xl font-black">{winCount * 100}</p>
          </div>
        </section>

        <section className="bg-card border border-border rounded-[2rem] p-8 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-violet-600/20 rounded-2xl flex items-center justify-center text-violet-500">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Niveau {levelInfo.level}</p>
                <h2 className="text-xl font-black">{levelInfo.label}</h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Progression</p>
              <p className="text-xl font-black text-violet-500">{Math.round(levelInfo.progress)}%</p>
            </div>
          </div>
          <Progress value={levelInfo.progress} className="h-3 bg-muted" />
        </section>

        {/* Section Badges */}
        <section className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-2">Badges de l'Arène</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Novice", min: 0, icon: <Star size={20} />, color: "text-zinc-400" },
              { label: "Guerrier", min: 5, icon: <Trophy size={20} />, color: "text-orange-500" },
              { label: "Élite", min: 10, icon: <Zap size={20} />, color: "text-violet-500" },
              { label: "Maître", min: 20, icon: <ShieldCheck size={20} />, color: "text-yellow-500" }
            ].map((badge, i) => (
              <div key={i} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${tournamentCount >= badge.min ? 'bg-card border-border shadow-sm' : 'bg-muted/20 border-dashed border-border opacity-30 grayscale'}`}>
                <div className={badge.color}>{badge.icon}</div>
                <span className="text-[8px] font-black uppercase tracking-tighter">{badge.label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-4">
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