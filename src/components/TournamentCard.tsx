"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Globe, MapPin, Share2, CheckCircle2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { showSuccess } from '@/utils/toast';

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
  status?: 'active' | 'finished';
}

const TournamentCard = ({ id, title, game, image, date, participants, entryFee, type, city, status = 'active' }: TournamentProps) => {
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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/tournament/${id}`;
    if (navigator.share) {
      navigator.share({ title, text: `Rejoins-moi sur eGame Bénin pour le tournoi ${game} !`, url });
    } else {
      navigator.clipboard.writeText(url);
      showSuccess("Lien copié !");
    }
  };

  const handleClick = () => {
    if (!isLoggedIn) {
      navigate('/auth');
    } else {
      navigate(`/tournament/${id}`);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={handleClick}
      className={`group relative bg-card rounded-[24px] overflow-hidden border transition-all cursor-pointer shadow-sm ${status === 'finished' ? 'opacity-75 grayscale-[0.5] border-border' : 'border-border hover:border-violet-500/40'}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          <Badge className="bg-black/60 backdrop-blur-md text-white border-white/10 flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter py-0.5 px-2 w-fit">
            {type === 'Online' ? <Globe size={10} className="text-cyan-400" /> : <MapPin size={10} className="text-orange-400" />}
            {type === 'Online' ? 'En ligne' : (tournamentCity || 'Local')}
          </Badge>
          
          {status === 'active' && (
            <div className="flex items-center gap-1.5 bg-green-500/20 backdrop-blur-md border border-green-500/30 px-2 py-0.5 rounded-full w-fit">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
              </span>
              <span className="text-[7px] font-black text-green-400 uppercase tracking-widest">En cours</span>
            </div>
          )}
        </div>

        <button 
          onClick={handleShare}
          className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Share2 size={12} />
        </button>

        <div className="absolute bottom-2.5 right-2.5">
          <div className={`${status === 'finished' ? 'bg-zinc-700' : 'bg-violet-600'} text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-lg`}>
            {status === 'finished' ? 'Terminé' : `${entryFee} FCFA`}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`w-1 h-1 rounded-full ${status === 'finished' ? 'bg-muted-foreground' : 'bg-violet-500'}`} />
          <p className={`${status === 'finished' ? 'text-muted-foreground' : 'text-violet-500'} text-[8px] font-black uppercase tracking-widest`}>{game}</p>
        </div>
        <h3 className="font-bold text-sm mb-3 line-clamp-1 group-hover:text-violet-500 transition-colors">{title}</h3>
        
        <div className="flex items-center justify-between text-muted-foreground text-[10px] font-bold">
          <div className="flex items-center gap-1">
            <Calendar size={12} className="text-muted-foreground/60" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={12} className="text-muted-foreground/60" />
            <span>{participants}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TournamentCard;