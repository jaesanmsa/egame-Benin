"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Trophy, Settings, LogOut, Star, Mail, History, Zap, ShieldCheck, Palette, Copy, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { showError, showSuccess } from '@/utils/toast';
import { Progress } from "@/components/ui/progress";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tournamentCount, setTournamentCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          navigate('/auth');
          return;
        }
        setUser(user);
        
        // On compte les tournois réussis (payés)
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
    const url = user.user_metadata?.avatar_url;
    if (url) {
      navigator.clipboard.writeText(url);
      showSuccess("Lien de l'avatar copié !");
    } else {
      showError("Crée d'abord un avatar emoji !");
    }
  };

  // Logique des niveaux
  const getLevelInfo = (count: number) => {
    if (count < 5) return { level: 1, next: 5, label: "Novice", progress: (count / 5) * 100 };
    if (count < 10) return { level: 2, next: 10, label: "Guerrier", progress: ((count - 5) / 5) * 100 };
    if (count < 20) return { level: 3, next: 20, label: "Élite", progress: ((count - 10) / 10) * 100 };
    if (count < 40) return { level: 4, next: 40, label: "Maître", progress: ((count - 20) / 20) * 100 };
    return { level: 5, next: 100, label: "Légende", progress: 100 };
  };

  const levelInfo = getLevelInfo(tournamentCount);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  const avatarUrl = user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
  const isAdmin = user.email === 'egamebenin@gmail.com';

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <section className="flex flex-col items-center mb-12">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-violet-600 overflow-hidden bg-zinc-800">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <Link to="/avatar-maker" className="absolute bottom-0 right-0 bg-violet-600 p-2 rounded-full border-4 border-zinc-950 hover:scale-110 transition-transform">
              <Palette size={16} />
            </Link>
          </div>
          <h1 className="text-3xl font-black mt-4">{user.user_metadata?.username || user.email?.split('@')[0]}</h1>
          
          {user.user_metadata?.avatar_url && (
            <button 
              onClick={copyAvatarLink}
              className="mt-4 flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-violet-400 transition-colors uppercase tracking-widest"
            >
              <LinkIcon size={14} /> Copier mon lien d'avatar
            </button>
          )}
        </section>

        {/* Carte de Niveau */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-violet-600/20 rounded-2xl flex items-center justify-center text-violet-500">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Niveau {levelInfo.level}</p>
                <h2 className="text-xl font-black">{levelInfo.label}</h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Tournois</p>
              <p className="text-xl font-black text-violet-500">{tournamentCount}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <span>Progression</span>
              <span>{tournamentCount} / {levelInfo.next}</span>
            </div>
            <Progress value={levelInfo.progress} className="h-3 bg-zinc-800" />
          </div>
        </section>

        <div className="space-y-4">
          {isAdmin && (
            <Link to="/admin" className="block">
              <button className="w-full flex items-center justify-between p-5 bg-violet-600/10 rounded-2xl border border-violet-500/30 text-violet-500 font-bold">
                <div className="flex items-center gap-4"><ShieldCheck size={20} /> Panneau Admin</div>
              </button>
            </Link>
          )}
          <Link to="/avatar-maker" className="block">
            <button className="w-full flex items-center justify-between p-5 bg-zinc-900 rounded-2xl border border-zinc-800 font-bold">
              <div className="flex items-center gap-4"><Palette size={20} className="text-pink-500" /> Studio d'Avatar (Emoji)</div>
            </button>
          </Link>
          <Link to="/edit-profile" className="block">
            <button className="w-full flex items-center justify-between p-5 bg-zinc-900 rounded-2xl border border-zinc-800 font-bold">
              <div className="flex items-center gap-4"><Settings size={20} className="text-zinc-400" /> Modifier mes infos</div>
            </button>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 bg-zinc-900 rounded-2xl border border-zinc-800 text-red-400 font-bold">
            <div className="flex items-center gap-4"><LogOut size={20} /> Déconnexion</div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Profile;