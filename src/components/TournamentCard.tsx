"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Lock } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface TournamentProps {
  id: string;
  title: string;
  game: string;
  image: string;
  date: string;
  participants: string;
  entryFee: string;
  type: 'Online' | 'Presentiel';
}

const TournamentCard = ({ id, title, game, image, date, participants, entryFee, type }: TournamentProps) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleClick = () => {
    if (!isLoggedIn) {
      navigate('/auth');
    } else {
      navigate(`/tournament/${id}`);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={handleClick}
      className="group relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-violet-500/50 transition-all cursor-pointer"
    >
      <div className="aspect-video overflow-hidden relative">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
        <Badge className={`absolute top-4 right-4 ${type === 'Online' ? 'bg-cyan-500' : 'bg-orange-500'} text-white border-none`}>
          {type === 'Online' ? 'En ligne' : 'Présentiel'}
        </Badge>
      </div>
      
      <div className="p-5">
        <p className="text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">{game}</p>
        <h3 className="text-white font-bold text-lg mb-4 line-clamp-1">{title}</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Calendar size={16} className="text-violet-500" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Users size={16} className="text-violet-500" />
            <span>{participants}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-1">
                <span className="text-zinc-500 text-xs">Entrée :</span>
                <span className="text-white font-bold">{entryFee} FCFA</span>
              </div>
              <button className="bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                Participer
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 py-2 text-zinc-500 text-sm font-medium">
              <Lock size={14} />
              <span>Connectez-vous pour voir le prix</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TournamentCard;