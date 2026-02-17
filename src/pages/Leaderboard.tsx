"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, ArrowLeft, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Leaderboard = () => {
  const navigate = useNavigate();

  const topPlayers = [
    { rank: 1, name: "BeninGhost", wins: 12, points: 2500, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ghost" },
    { rank: 2, name: "CotonouKing", wins: 10, points: 2100, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=King" },
    { rank: 3, name: "ProGamer229", wins: 8, points: 1850, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pro" },
    { rank: 4, name: "ShadowNinja", wins: 5, points: 1200, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ninja" },
    { rank: 5, name: "ElitePlayer", wins: 4, points: 950, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elite" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} />
          Retour
        </button>

        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-violet-600/20 rounded-full mb-4">
            <Trophy size={40} className="text-violet-500" />
          </div>
          <h1 className="text-3xl font-black mb-2">Classement Élite</h1>
          <p className="text-zinc-400">Les meilleurs guerriers de l'arène béninoise</p>
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-4 mb-12 pt-8">
          {/* 2nd */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-zinc-400 overflow-hidden mb-2">
              <img src={topPlayers[1].avatar} alt="" />
            </div>
            <div className="h-20 w-16 bg-zinc-800 rounded-t-xl flex items-center justify-center relative">
              <span className="text-2xl font-black text-zinc-400">2</span>
              <Medal className="absolute -top-3 text-zinc-400" size={20} />
            </div>
          </div>
          {/* 1st */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-4 border-yellow-500 overflow-hidden mb-2 shadow-lg shadow-yellow-500/20">
              <img src={topPlayers[0].avatar} alt="" />
            </div>
            <div className="h-28 w-20 bg-violet-600 rounded-t-xl flex items-center justify-center relative">
              <span className="text-3xl font-black text-white">1</span>
              <Crown className="absolute -top-4 text-yellow-500" size={24} />
            </div>
          </div>
          {/* 3rd */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-orange-600 overflow-hidden mb-2">
              <img src={topPlayers[2].avatar} alt="" />
            </div>
            <div className="h-16 w-16 bg-zinc-800 rounded-t-xl flex items-center justify-center relative">
              <span className="text-2xl font-black text-orange-600">3</span>
              <Medal className="absolute -top-3 text-orange-600" size={20} />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {topPlayers.map((player, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={player.rank} 
              className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl"
            >
              <div className="flex items-center gap-4">
                <span className="w-6 text-center font-black text-zinc-500">{player.rank}</span>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800">
                  <img src={player.avatar} alt="" />
                </div>
                <div>
                  <p className="font-bold">{player.name}</p>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">{player.wins} Victoires</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-violet-400 font-black">
                  <Star size={14} />
                  <span>{player.points}</span>
                </div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">Points</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;