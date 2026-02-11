"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Trophy, Wallet, Settings, LogOut, Star, Phone, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { showError, showSuccess } from '@/utils/toast';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError(error.message);
    } else {
      showSuccess("Déconnexion réussie");
      navigate('/');
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;

  if (!user) {
    navigate('/auth');
    return null;
  }

  const stats = [
    { label: "Tournois", value: "0", icon: <Trophy size={18} /> },
    { label: "Victoires", value: "0", icon: <Star size={18} /> },
  ];

  const avatarUrl = user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0];
  const phone = user.user_metadata?.phone;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 pt-12 md:pt-24">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header Profil */}
        <section className="relative mb-12">
          <div className="h-48 w-full bg-gradient-to-r from-violet-600 to-cyan-600 rounded-[2.5rem] opacity-20" />
          <div className="flex flex-col items-center -mt-20">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-zinc-950 overflow-hidden bg-zinc-800">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 border-4 border-zinc-950 rounded-full" />
            </div>
            <h1 className="text-3xl font-black mt-4">{fullName}</h1>
            <div className="flex flex-col items-center gap-1 mt-2">
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Mail size={14} />
                <span>{user.email}</span>
              </div>
              {phone && (
                <div className="flex items-center gap-2 text-violet-400 text-sm font-bold">
                  <Phone size={14} />
                  <span>{phone}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Stats & Wallet */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl text-center">
                <div className="text-violet-500 flex justify-center mb-2">{stat.icon}</div>
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-zinc-500 text-xs uppercase font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex flex-col justify-center items-center">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={20} className="text-violet-500" />
              <span className="text-xs font-bold text-zinc-500 uppercase">Solde</span>
            </div>
            <p className="text-3xl font-black">0 FCFA</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Paramètres</h2>
          <Link to="/edit-profile" className="block">
            <button className="w-full flex items-center justify-between p-5 bg-zinc-900 hover:bg-zinc-800 rounded-2xl border border-zinc-800 transition-all group">
              <div className="flex items-center gap-4">
                <Settings size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
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