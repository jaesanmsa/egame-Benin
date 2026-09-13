"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import TournamentCard from '@/components/TournamentCard';
import { ArrowLeft, Trophy, Gamepad2, Zap, Target, MessageSquare, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';

const GameDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const gameInfo = {
    'brawl-stars': {
      name: 'Brawl Stars',
      icon: '/icon brawl stars.webp',
      image: '/brawl stars.jpg',
      desc: "Combats 3v3 frénétiques et modes compétitifs explosifs. Choisis ton Brawler, débloque ses supers et domine l'arène.",
      whatsapp: "https://chat.whatsapp.com/INmxAExPcaPHT4DrVBIfiw?s=cl&p=i&mlu=4&ilr=4"
    },
    'free-fire': {
      name: 'Free Fire',
      icon: '/icon free fire.png',
      image: '/freefire.webp',
      desc: "Le Battle Royale mobile numéro 1 au Bénin. Domine le terrain, élimine tes adversaires et décroche le Booyah !",
      whatsapp: "https://chat.whatsapp.com/EzIhfwTxa4DL5g7E50cAwT?s=cl&p=i&mlu=4&ilr=4"
    },
    'clash-royale': {
      name: 'Clash Royale',
      icon: '/icon clash royal.jpg',
      image: '/clash royal.webp',
      desc: "Duel en temps réel, stratégie et gestion de decks. Détruis les tours royales ennemies.",
      whatsapp: "https://chat.whatsapp.com/GIzoOiID57AB7DELQsvVgt?s=cl&p=i&mlu=4&ilr=4"
    },
    'clash-of-clans': {
      name: 'Clash of Clans',
      icon: '/icon clash of clans.jpg',
      image: '/clash of clans.webp',
      desc: "Construis ton village, forme tes armées et mène ton clan à la victoire ultime.",
      whatsapp: "https://chat.whatsapp.com/FgkUCxPU1EvEBfmWhiMB0j?mode=gi_t"
    },
    'cod-mobile': {
      name: 'COD Mobile',
      icon: '/icon cod mobile.png',
      image: '/cod mobile.webp',
      desc: "FPS compétitif pur. Précision, réflexes et esprit d'équipe sur les cartes légendaires.",
      whatsapp: "https://chat.whatsapp.com/CyrUEEFw6Lr2di9GbCIVv4?s=cl&p=i&mlu=4&ilr=4"
    },
    'pubg-mobile': {
      name: 'PUBG Mobile',
      icon: '/icon pubg.png',
      image: '/pubg-mobile.webp',
      desc: "Battle Royale ultra-réaliste. Survis à 100 joueurs et remporte le repas de poulet.",
      whatsapp: "https://chat.whatsapp.com/EsuFIe4zeB13IJTUNO1bew?s=cl&p=i&mlu=4&ilr=4"
    },
    'mobile-legends': {
      name: 'Mobile Legends',
      icon: '/icon mobile legend.jpg',
      image: '/mobile legend.webp',
      desc: "MOBA 5v5 compétitif. Choisis ton héros et écrase la base ennemie.",
      whatsapp: "https://chat.whatsapp.com/KAeZjAXJQer7ZftNOqp1dp?s=cl&p=i&mlu=4&ilr=4"
    }
  }[id as string] || { name: id, icon: '🎮', image: '', desc: "Compétition eSport officielle.", whatsapp: "https://whatsapp.com/channel/0029Vb6qihB9MF8wGo02z93E" };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: activeTours } = await supabase
        .from('tournaments')
        .select('*')
        .ilike('game', `%${gameInfo.name}%`)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (activeTours) setTournaments(activeTours);

      const { data: finished } = await supabase
        .from('tournaments')
        .select('winner_name, winner_avatar, title, prize_pool')
        .ilike('game', `%${gameInfo.name}%`)
        .eq('status', 'finished')
        .not('winner_name', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(5);
      
      if (finished) setWinners(finished);

      setLoading(false);
    };
    fetchData();
  }, [id, gameInfo.name]);

  return (
    <div className="min-h-screen bg-[#07070C] text-white pb-32">
      <Navbar />
      
      <section className="relative h-[45vh] w-full overflow-hidden">
        <img src={gameInfo.image} className="w-full h-full object-cover opacity-30" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070C] via-[#07070C]/40 to-transparent" />
        
        <div className="absolute top-6 left-6 z-20">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-[#0F0F1E]/80 backdrop-blur-md rounded-full border border-[#8A2BE2]/40 text-white hover:bg-[#8A2BE2] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="absolute bottom-10 left-6 md:left-12 z-10">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-[#8A2BE2]/50 shadow-2xl bg-[#0F0F1E]">
              {gameInfo.icon.startsWith('/') ? (
                <img src={gameInfo.icon} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl flex items-center justify-center h-full">{gameInfo.icon}</span>
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-gaming font-black uppercase text-white tracking-wide">{gameInfo.name}</h1>
              <p className="text-[#A855F7] text-xs font-gaming font-bold uppercase tracking-widest mt-2">Discipline Officielle eGame Bénin</p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 space-y-12 relative z-20 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel p-8 space-y-3">
              <h2 className="text-sm font-gaming font-bold uppercase text-[#A855F7] flex items-center gap-2">
                <Target size={18} /> À propos de la discipline
              </h2>
              <p className="text-sm text-[#8888AA] leading-relaxed font-medium">{gameInfo.desc}</p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-gaming font-black uppercase text-white flex items-center gap-3">
                <Zap size={24} className="text-[#FFD700]" />
                Tournois Ouverts
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-3xl bg-[#0F0F1E]" />)
                ) : tournaments.length === 0 ? (
                  <div className="col-span-full py-12 text-center glass-panel">
                    <Gamepad2 size={40} className="mx-auto text-[#8888AA] mb-3 opacity-40" />
                    <p className="text-sm font-gaming text-[#8888AA]">Aucun tournoi actif pour ce jeu.</p>
                  </div>
                ) : (
                  tournaments.map((t) => (
                    <TournamentCard 
                      key={t.id} 
                      id={t.id} 
                      title={t.title} 
                      game={t.game} 
                      image={t.image_url} 
                      date={new Date(t.start_date).toLocaleDateString('fr-FR')} 
                      participants={`${t.max_participants} places`} 
                      entryFee={t.entry_fee.toString()} 
                      prizePool={t.prize_pool}
                      type={t.type as any} 
                      status="active" 
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass-panel-gold p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Trophy className="text-[#FFD700]" size={22} />
                <h2 className="text-sm font-gaming font-bold uppercase text-white">Gagnants {gameInfo.name}</h2>
              </div>

              {winners.length === 0 ? (
                <p className="text-xs text-[#8888AA] font-gaming text-center py-6">Pas encore de gagnant enregistré.</p>
              ) : (
                <div className="space-y-3">
                  {winners.map((w, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 bg-[#07070C] rounded-2xl border border-[#FFD700]/20">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{w.winner_avatar || '🏆'}</span>
                        <div>
                          <p className="font-gaming font-bold text-xs text-white">{w.winner_name}</p>
                          <p className="text-[10px] text-[#8888AA] line-clamp-1">{w.title}</p>
                        </div>
                      </div>
                      <span className="text-xs font-gaming font-black text-[#FFD700]">{w.prize_pool}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#8A2BE2] rounded-3xl p-8 space-y-6 shadow-xl shadow-[#8A2BE2]/20">
              <div className="flex items-center gap-3 text-white">
                <MessageSquare size={24} />
                <h3 className="font-gaming font-bold text-base uppercase">Groupe WhatsApp</h3>
              </div>
              <p className="text-xs text-white/80 leading-relaxed font-medium">
                Rejoins la communauté des joueurs de <span className="font-bold text-white">{gameInfo.name}</span> au Bénin.
              </p>
              <a href={gameInfo.whatsapp} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full bg-white text-[#07070C] hover:bg-gray-100 font-gaming font-bold text-xs py-6 rounded-2xl uppercase tracking-wider flex items-center justify-center gap-2">
                  Rejoindre sur WhatsApp
                  <ChevronRight size={16} />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameDetails;