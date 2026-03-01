"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Trophy, Settings, LogOut, Star, Mail, History, Zap, ShieldCheck, Palette, Copy, Link as LinkIcon, HelpCircle, Sun, Moon, Shield } from 'lucide-react';
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
        
        // Récupérer le profil depuis la table profiles
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
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
    showSuccess("Déconnexion réussie");
    navigate('/');
  };

  const copyAvatarLink = () => {
    const url = profile?.avatar_url || user?.user_metadata?.avatar_url;
    if (url) {
      navigator.clipboard.writeText(url);
      showSuccess("Lien de l'avatar copié !");
    } else {
      showError("Crée d'abord un avatar emoji !");
    }
  };

  const getLevelInfo = (count: number) => {
    if (count < 5) return { level: 1, next: 5, label: "Novice", progress: (count / 5) * 100 };
    if (count < 10) return { level: 2, next: 10, label: "Guerrier", progress: ((count - 5) / 5) * 100 };
    if (count < 20) return { level: 3, next: 20, label: "Élite", progress: ((count - 10) / 10) * 100 };
    if (count < 40) return { level: 4, next: 40, label: "Maître", progress: ((count - 20) / 20) * 100 };
    return { level: 5, next: 100, label: "Légende", progress: 100 };
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
            <div className="w-32 h-32 rounded-full border-4 border-violet-600 overflow-hidden bg-muted">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <Link to="/avatar-maker" className="absolute bottom-0 right-0 bg-violet-600 p-2 rounded-full border-4 border-background hover:scale-110 transition-transform text-white">
              <Palette size={16} />
            </Link>
          </div>
          <h1 className="text-3xl font-black mt-4">{username}</h1>
          
          {avatarUrl.startsWith('data:image') && (
            <button 
              onClick={copyAvatarLink}
              className="mt-4 flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-violet-400 transition-colors uppercase tracking-widest"
            >
              <LinkIcon size={14} /> Copier mon lien d'avatar
            </button>
          )}
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
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Tournois</p>
              <p className="text-xl font-black text-violet-500">{tournamentCount}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>Progression</span>
              <span>{tournamentCount} / {levelInfo.next}</span>
            </div>
            <Progress value={levelInfo.progress} className="h-3 bg-muted" />
          </div>
        </section>

        <div className="space-y-4">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border border-border font-bold shadow-sm"
          >
            <div className="flex items-center gap-4">
              {theme === 'dark' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-indigo-500" />}
              Mode {theme === 'dark' ? 'Clair' : 'Sombre'}
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-violet-600' : 'bg-muted'}`}>
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${theme === 'dark' ? 'right-1' : 'left-1'}`} />
            </div>
          </button>

          {isAdmin && (
            <Link to="/admin" className="block">
              <button className="w-full flex items-center justify-between p-5 bg-violet-600/10 rounded-2xl border border-violet-500/30 text-violet-500 font-bold">
                <div className="flex items-center gap-4"><ShieldCheck size={20} /> Panneau Admin</div>
              </button>
            </Link>
          )}
          
          <Link to="/contact" className="block">
            <button className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border border-border font-bold shadow-sm">
              <div className="flex items-center gap-4"><HelpCircle size={20} className="text-violet-500" /> Contact & Aide</div>
            </button>
          </Link>

          <Link to="/privacy" className="block">
            <button className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border border-border font-bold shadow-sm">
              <div className="flex items-center gap-4"><Shield size={20} className="text-cyan-500" /> Politique de Confidentialité</div>
            </button>
          </Link>

          <Link to="/avatar-maker" className="block">
            <button className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border border-border font-bold shadow-sm">
              <div className="flex items-center gap-4"><Palette size={20} className="text-pink-500" /> Studio d'Avatar (Emoji)</div>
            </button>
          </Link>
          
          <Link to="/edit-profile" className="block">
            <button className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border border-border font-bold shadow-sm">
              <div className="flex items-center gap-4"><Settings size={20} className="text-muted-foreground" /> Modifier mes infos</div>
            </button>
          </Link>
          
          <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border border-border text-red-400 font-bold shadow-sm">
            <div className="flex items-center gap-4"><LogOut size={20} /> Déconnexion</div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Profile;