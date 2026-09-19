"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Globe, MapPin, Share2, Trophy, ArrowRight, Zap } from 'lucide-react';
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
  prizePool?: string;
  type: 'Online' | 'Presentiel';
  status?: 'active' | 'finished';
}

const TournamentCard = ({ id, title, game, image, date, participants, entryFee, prizePool = "50.000 FCFA", type, status = 'active' }: TournamentProps) => {
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
      navigator.share({ title, text: `Rejoins le tournoi ${game} sur eGame Bénin !`, url });
    } else {
      navigator.clipboard.writeText(url);
      showSuccess("Lien copié dans le presse-papier !");
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
      whileHover={{ y: -6 }}
      onClick={handleClick}
      className={`group relative glass-panel overflow-hidden cursor-pointer ${
        status === 'finished' ? 'opacity-70 grayscale-[0.2]' : ''
      }`}
    >
      {/* Image de couverture */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={image || '/coc-tournament.webp'}
          alt={title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1E] via-[#0F0F1E]/40 to-transparent" />
        
        {/* Badge Mode */}
        <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
          <Badge className="bg-[#07070C]/80 backdrop-blur-md text-white border border-[#8A2BE2]/40 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">
            {type === 'Online' ? <Globe size={12} className="text-cyan-400" /> : <MapPin size={12} className="text-orange-400" />}
            {type === 'Online' ? 'En ligne' : 'Présentiel'}
          </Badge>
          {entryFee === "0" && (
            <Badge className="bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/50 text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">
              Gratuit
            </Badge>
          )}
        </div>

        {/* Badge Live */}
        {status === 'active' && (
          <div className="absolute top-3 right-3 flex items-center gap-2 bg-emerald-950/80 backdrop-blur-md border border-emerald-500/50 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest font-gaming">Ouvert</span>
          </div>
        )}

        <button 
          onClick={handleShare}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-[#07070C]/80 hover:bg-[#8A2BE2] text-white/80 hover:text-white border border-white/10 transition-colors"
        >
          <Share2 size={14} />
        </button>
      </div>

      {/* Contenu */}
      <div className="p-6 space-y-4">
        <div>
          <p className="text-[10px] font-extrabold text-[#A855F7] uppercase tracking-[0.2em] font-gaming mb-1 flex items-center gap-1.5">
            <Zap size={12} className="text-[#FFD700]" />
            {game}
          </p>
          <h3 className="font-gaming font-extrabold text-lg text-white group-hover:text-[#A855F7] transition-colors line-clamp-1">
            {title}
          </h3>
        </div>

        {/* Cash Prize */}
        <div className="bg-[#07070C] border border-[#FFD700]/40 p-3.5 rounded-2xl flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <Trophy className="text-[#FFD700]" size={20} />
            <span className="text-[10px] font-bold text-[#8888AA] uppercase tracking-wider">Cash Prize</span>
          </div>
          <span className="text-xl font-gaming font-black text-[#FFD700] text-glow-gold">
            {prizePool}
          </span>
        </div>

        {/* Metadonnées */}
        <div className="flex items-center justify-between text-xs font-semibold text-[#8888AA] pt-2 border-t border-[#8A2BE2]/15">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-[#8A2BE2]" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-[#8A2BE2]" />
            <span>{participants}</span>
          </div>
        </div>

        <button
          className="w-full btn-neon py-3 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2"
        >
          {entryFee === "0" ? "S'inscrire • Gratuit" : `S'inscrire • ${entryFee} FCFA`}
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
};

export default TournamentCard;