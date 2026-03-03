"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Lock, Globe, MapPin } from 'lucide-react';
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
  city?: string;
}

const TournamentCard = ({ id, title, game, image, date, participants, entryFee, type, city }: TournamentProps) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tournamentCity, setTournamentCity] = useState(city);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    if (!city) {
      supabase.from('tournaments').select('city').eq('id', id).single().then(({ data }) => {
        if (data) setTournamentCity(data.city);
      });
    }

    return () => subscription.unsubscribe();
  }, [id, city]);

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
      className="group relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-violet-500/50 transition-all cursor-pointer shadow-lg shadow-black/20"
    >
      <div className="aspect-video overflow-hidden relative">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
        
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={`bg-zinc-950/80 backdrop-blur-md text-white border-zinc-800 flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter py-1 px-2`}>
            {type === 'Online' ? <Globe size={10} className="text-cyan-400" /> : <MapPin size={10} className="text-orange-400" />}
            {type === 'Online' ? 'Online' : (tournamentCity || 'Local')}
          </Badge>
        </div>

        <div className="absolute bottom-3 right-3">
          <div className="bg-violet-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
            {entryFee} FCFA
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
          <p className="text-violet-400 text-[10px] font-black uppercase tracking-widest">{game}</p>
        </div>
        <h3 className="text-white font-bold text-base mb-4 line-clamp-1 group-hover:text-violet-400 transition-colors">{title}</h3>
        
        <div className="flex items-center justify-between text-zinc-500 text-[11px] font-bold">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-zinc-600" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-zinc-600" />
            <span>{participants}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TournamentCard;