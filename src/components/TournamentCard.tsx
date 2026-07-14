"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Globe, MapPin, Share2, Zap } from 'lucide-react';
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

const TournamentCard = ({ id, title, game, image, date, participants, entryFee, type, status = 'active' }: TournamentProps) => {
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
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleClick}
      className={`group relative glass-card glass-card-hover rounded-[28px] overflow-hidden transition-all cursor-pointer ${
        status === 'finished' ? 'opacity-60 grayscale-[0.3]' : ''
      }`}
    >
      {/* Image de couverture avec overlay dégradé */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0414] via-[#0c0414]/40 to-transparent" />
        
        {/* Badge Type (En ligne / Présentiel) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <Badge className="bg-black/60 backdrop-blur-md text-white border-white/10 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider py-1 px-2.5 rounded-xl">
            {type === 'Online' ? (
              <Globe size={11} className="text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]" />
            ) : (
              <MapPin size={11} className="text-orange-400 drop-shadow-[0_0_4px_rgba(251,146,60,0.5)]" />
            )}
            {type === 'Online' ? 'En ligne' : 'Présentiel'}
          </Badge>
        </div>

        {/* Badge Live Pulsant */}
        {status === 'active' && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-green-500/10 backdrop-blur-md border border-green-500/30 px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Live</span>
          </div>
        )}

        {/* Badge Prix d'entrée */}
        <div className="absolute bottom-3 right-3">
          <div className={`text-[10px] font-black px-3 py-1 rounded-xl shadow-lg backdrop-blur-md border ${
            status === 'finished' 
              ? 'bg-zinc-800/80 border-zinc-700 text-zinc-400' 
              : 'bg-violet-600/90 border-violet-500/30 text-white shadow-violet-500/20'
          }`}>
            {status === 'finished' ? 'Terminé' : `${entryFee} FCFA`}
          </div>
        </div>
      </div>
      
      {/* Contenu de la carte */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Zap size={12} className="text-violet-400 fill-violet-400/20" />
            <p className="text-violet-400 text-[9px] font-black uppercase tracking-widest">{game}</p>
          </div>
          <button 
            onClick={handleShare}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-muted-foreground hover:text-white transition-colors"
          >
            <Share2 size={12} />
          </button>
        </div>
        
        <h3 className="font-bold text-base mb-4 line-clamp-1 group-hover:text-violet-400 transition-colors font-sora">
          {title}
        </h3>
        
        <div className="flex items-center justify-between text-muted-foreground text-xs font-medium pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-violet-500/60" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-violet-500/60" />
            <span>{participants}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TournamentCard;