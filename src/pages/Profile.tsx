"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Trophy, Settings, LogOut, Star, Mail, History, Zap, PlusCircle } from 'lucide-react';
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
        
        const { count } = await supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'Réussi');
        
        setTournamentCount(count || 0);
      } catch (err) {
        console.error(err);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };
    getUserData();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError(error.message);
    } else {
      showSuccess("Déconnexion réussie");
      navigate('/');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  const level = Math.floor(tournamentCount / 5) + 1;
  const progress = (tournamentCount % 5) * 20;
  const avatarUrl = user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 pt-12 md:pt-24">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        <section className="relative mb-12">
          <div className="h-48 w-full bg-gradient-to-r from-violet-600 to-cyan-600 rounded-[2.5rem] opacity-20" />
          <div className="flex flex-col items-center -mt-20">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-zinc-950 overflow-hidden bg-zinc-800">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-violet-600 text-white text-xs font-black w-10 h-10 rounded-full flex items-center justify-center border-4 border-zinc-950 shadow-lg">
                Lvl {level}
              </div>
            </div>
            <h1 className="text-3xl font-black mt-4">{fullName}</h1>
            <div className="flex items-center gap-2 text-zinc-400 text-sm mt-2">
              <Mail size={14} />
              <span>{user.email}</span>
            </div>
          </div>
        </section>

        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-yellow-500" />
              <span className="font-bold text-sm uppercase tracking-widest">Progression Joueur</span>
            </div>
            <span className="text-xs text-zinc-500 font-bold">{tournamentCount % 5} / 5 tournois</span>
          </div>
          <Progress value={progress} className="h-3 bg-zinc-800" />
        </div>

        <div className="space-y-4">
          {/* Bouton Admin pour ajouter un tournoi */}
          <Link to="/add-tournament" className="block">
            <button className="w-full flex items-center justify-between p-5 bg-violet-600/10 hover:bg-violet-600/20 rounded-2xl border border-violet-500/30 transition-all text-violet-400">
              <div className="flex items-center gap-4">
                <PlusCircle size={20} />
                <span className="font-bold">Ajouter un tournoi (Admin)</span>
              </div>
            </button>
          </Link>

          <Link to="/payments" className="block">
            <button className="w-full flex items-center justify-between p-5 bg-zinc-900 hover:bg-zinc-800 rounded-2xl border border-zinc-800 transition-all">
              <div className="flex items-center gap-4">
                <History size={20} className="text-violet-500" />
                <span className="font-bold">Historique des paiements</span>
              </div>
            </button>
          </Link>

          <Link to="/edit-profile" className="block">
            <button className="w-full flex items-center justify-between p-5 bg-zinc-900 hover:bg-zinc-800 rounded-2xl border border-zinc-800 transition-all">
              <div className="flex items-center gap-4">
                <Settings size={20} className="text-zinc-400" />
                <span className="font-bold">Modifier le profil</span>
              </div>
            </button>
          </Link>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-5 bg-zinc-900 hover:bg-red-500/10 rounded-2xl border border-zinc-800 hover:border-red-500/50 transition-all text-red-400"
          >
            <div className="flex items-center gap-4">
              <LogOut size={20} />
              <span className="font-bold">Déconnexion</span>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Profile;