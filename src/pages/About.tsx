"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Trophy, Target, Users, Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-12 transition-colors">
          <ArrowLeft size={20} /> Retour
        </button>

        <div className="text-center mb-20">
          <Logo size="lg" className="justify-center mb-8" />
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 uppercase">L'Arène des Champions</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            eGame Bénin est la plateforme de référence pour l'eSport au Bénin, connectant les joueurs passionnés aux compétitions de haut niveau.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-card border border-border p-10 rounded-[3rem] shadow-sm">
            <Target className="text-violet-500 mb-6" size={40} />
            <h2 className="text-2xl font-black mb-4 uppercase">Notre Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              Démocratiser l'eSport au Bénin en offrant un cadre professionnel, sécurisé et accessible à tous les talents locaux pour s'exprimer et gagner.
            </p>
          </div>
          <div className="bg-card border border-border p-10 rounded-[3rem] shadow-sm">
            <Users className="text-violet-500 mb-6" size={40} />
            <h2 className="text-2xl font-black mb-4 uppercase">La Communauté</h2>
            <p className="text-muted-foreground leading-relaxed">
              Plus qu'une plateforme, nous bâtissons une famille de gamers qui partagent les mêmes valeurs de fair-play, de respect et d'excellence.
            </p>
          </div>
        </div>

        <section className="bg-violet-600/5 border border-violet-500/20 rounded-[3rem] p-12 text-center">
          <h2 className="text-3xl font-black mb-8 uppercase">Pourquoi nous choisir ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            <div className="space-y-4">
              <Shield className="text-violet-500 mx-auto" size={32} />
              <h3 className="font-black text-sm uppercase">Sécurité</h3>
              <p className="text-xs text-muted-foreground">Paiements et données protégés.</p>
            </div>
            <div className="space-y-4">
              <Trophy className="text-violet-500 mx-auto" size={32} />
              <h3 className="font-black text-sm uppercase">Gains Réels</h3>
              <p className="text-xs text-muted-foreground">Cash prizes payés rapidement.</p>
            </div>
            <div className="space-y-4">
              <Users className="text-violet-500 mx-auto" size={32} />
              <h3 className="font-black text-sm uppercase">Support 24/7</h3>
              <p className="text-xs text-muted-foreground">Une équipe à votre écoute.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;