"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { Target, Users, Shield, ArrowLeft, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-32 pt-24">
      <SEO title="À propos de eGame Bénin" description="La vision et la mission de la plateforme eSport numéro 1 au Bénin." />
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 space-y-16">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#8888AA] hover:text-white transition-colors text-xs font-gaming font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> Retour
        </button>

        <div className="text-center space-y-6">
          <Logo size="lg" className="justify-center" />
          <h1 className="text-4xl md:text-5xl font-gaming font-black uppercase text-white tracking-tight">
            L'Arène des Champions
          </h1>
          <p className="text-base text-[#8888AA] max-w-2xl mx-auto leading-relaxed font-medium">
            eGame Bénin est la plateforme eSport de référence dédiée à l'organisation de compétitions de jeux vidéo compétitifs au Bénin avec remise directe des Cash Prizes par Mobile Money.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#0F0F1E] border border-[#8A2BE2]/30 p-8 rounded-3xl space-y-4">
            <Target className="text-[#8A2BE2]" size={36} />
            <h2 className="text-xl font-gaming font-bold uppercase text-white">Notre Mission</h2>
            <p className="text-sm text-[#8888AA] leading-relaxed">
              Professionnaliser la scène eSport béninoise en offrant une infrastructure moderne, des règles strictes, des prix attractifs et des paiements instantanés.
            </p>
          </div>

          <div className="bg-[#0F0F1E] border border-[#8A2BE2]/30 p-8 rounded-3xl space-y-4">
            <Users className="text-[#8A2BE2]" size={36} />
            <h2 className="text-xl font-gaming font-bold uppercase text-white">La Communauté</h2>
            <p className="text-sm text-[#8888AA] leading-relaxed">
              Rassembler les gamers de Cotonou, Porto-Novo, Parakou et de tout le Bénin autour du fair-play, de la passion du jeu et de la compétition de haut niveau.
            </p>
          </div>
        </div>

        <div className="bg-[#0F0F1E] border border-[#FFD700]/30 rounded-3xl p-10 text-center space-y-8">
          <h2 className="text-2xl font-gaming font-black uppercase text-white">Pourquoi nous faire confiance ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-2">
              <Shield className="text-[#8A2BE2] mx-auto" size={32} />
              <h3 className="font-gaming font-bold text-sm text-white">100% Sécurisé</h3>
              <p className="text-xs text-[#8888AA]">Paiements certifiés via KKiaPay & FedaPay.</p>
            </div>
            <div className="space-y-2">
              <Trophy className="text-[#FFD700] mx-auto" size={32} />
              <h3 className="font-gaming font-bold text-sm text-white">Cash Prizes Garantie</h3>
              <p className="text-xs text-[#8888AA]">Gains distribués à la fin des tournois.</p>
            </div>
            <div className="space-y-2">
              <Users className="text-[#8A2BE2] mx-auto" size={32} />
              <h3 className="font-gaming font-bold text-sm text-white">Support 24/7</h3>
              <p className="text-xs text-[#8888AA]">Une équipe d'arbitres toujours à l'écoute.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;