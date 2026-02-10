"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Trophy, Wallet, Settings, LogOut, Gamepad2, Star } from 'lucide-react';

const Profile = () => {
  const stats = [
    { label: "Tournois", value: "12", icon: <Trophy size={18} /> },
    { label: "Victoires", value: "4", icon: <Star size={18} /> },
    { label: "Rang", value: "Gold IV", icon: <Gamepad2 size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 md:pt-20">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header Profil */}
        <section className="relative mb-12">
          <div className="h-48 w-full bg-gradient-to-r from-violet-600 to-cyan-600 rounded-[2.5rem] opacity-20" />
          <div className="flex flex-col items-center -mt-20">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-zinc-950 overflow-hidden bg-zinc-800">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" />
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 border-4 border-zinc-950 rounded-full" />
            </div>
            <h1 className="text-3xl font-black mt-4">Gamer_Benin_229</h1>
            <p className="text-zinc-400">Membre depuis Mai 2024</p>
          </div>
        </section>

        {/* Stats & Wallet */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="md:col-span-2 grid grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl text-center">
                <div className="text-violet-500 flex justify-center mb-2">{stat.icon}</div>
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-zinc-500 text-xs uppercase font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-br from-violet-600 to-violet-800 p-6 rounded-3xl shadow-xl shadow-violet-500/20">
            <div className="flex items-center justify-between mb-4">
              <Wallet size={24} />
              <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">SOLDE</span>
            </div>
            <p className="text-3xl font-black mb-1">$145.50</p>
            <p className="text-violet-200 text-xs mb-4">Prêt pour le prochain tournoi</p>
            <button className="w-full bg-white text-violet-600 py-2 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-colors">
              Recharger
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Paramètres</h2>
          <button className="w-full flex items-center justify-between p-5 bg-zinc-900 hover:bg-zinc-800 rounded-2xl border border-zinc-800 transition-all">
            <div className="flex items-center gap-4">
              <Settings size={20} className="text-zinc-400" />
              <span className="font-bold">Modifier le profil</span>
            </div>
          </button>
          <button className="w-full flex items-center justify-between p-5 bg-zinc-900 hover:bg-zinc-800 rounded-2xl border border-zinc-800 transition-all text-red-400">
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