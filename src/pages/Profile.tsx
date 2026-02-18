"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Trophy, Settings, LogOut, Star, Mail, History, Zap, ShieldCheck, Palette } from 'lucide-react';
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
        const { count } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'Réussi');
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