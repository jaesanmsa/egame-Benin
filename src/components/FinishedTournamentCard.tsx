"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, User } from 'lucide-react';

interface FinishedTournamentProps {
  title: string;
  game: string;
  image: string;
  prizePool: string;
  winnerName: string;
  winnerAvatar?: string;
}

const FinishedTournamentCard = ({ title, game, image, prizePool, winnerName, winnerAvatar }: FinishedTournamentProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-zinc-900/40 rounded-3xl overflow-hidden border border-zinc-800/50 grayscale hover:grayscale-0 transition-all duration-500"
    >
      <div className="aspect-video overflow-hidden relative">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Terminé</span>
        </div>
      </div>
      
      <div className="p-5 -mt-12 relative z-10">
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">{game}</p>
        <h3 className="text-white font-bold text-base mb-4 line-clamp-1">{title}</h3>
        
        <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center overflow-hidden">
              {winnerAvatar ? (
                <img src={winnerAvatar} alt={winnerName} className="w-full h-full object-cover" />
              ) : (
                <User size={18} className="text-violet-500" />
              )}
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Gagnant</p>
              <p className="text-white font-black text-sm">{winnerName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-yellow-500 font-bold uppercase">Prix</p>
            <p className="text-white font-black text-sm">{prizePool}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FinishedTournamentCard;