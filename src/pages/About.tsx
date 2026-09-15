"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { Target, Users, Shield, ArrowLeft, Trophy, UserPlus, Gamepad2, CreditCard, Hash, MessageSquare, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';

interface Step {
  icon: LucideIcon;
  title: string;
  desc: string;
  highlight?: boolean;
}

const STEPS: Step[] = [
  {
    icon: UserPlus,
    title: "Crée ton compte",
    desc: "Inscris-toi gratuitement avec ton e-mail ou ton compte Google. C'est rapide et sans engagement."
  },
  {
    icon: Gamepad2,
    title: "Choisis ton tournoi",
    desc: "Explore les tournois ouverts, sélectionne ton jeu préféré et vérifie la date, les frais et le Cash Prize."
  },
  {
    icon: CreditCard,
    title: "Paie tes frais d'inscription",
    desc: "Accepte le règlement du tournoi puis paie par Mobile Money (MTN, Moov, Celtiis) ou carte bancaire via KKiaPay ou FedaPay."
  },
  {
    icon: Hash,
    title: "Reçois ton code de validation",
    desc: "Dès que ton paiement est validé, un code unique (ex : EGB-A1B2C) t'est remis. Tu le retrouves aussi dans « Mes Inscriptions » sur ton profil."
  },
  {
    icon: MessageSquare,
    title: "Envoie ton code par WhatsApp",
    desc: "Envoie ton pseudo et ton code de validation au support WhatsApp officiel pour confirmer ton inscription auprès des arbitres.",
    highlight: true
  },
  {
    icon: Trophy,
    title: "Joue et encaisse",
    desc: "Rejoins la salle de jeu à l'heure indiquée, domine tes adversaires et reçois ton Cash Prize directement par Mobile Money."
  }
];

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-32 pt-24">
      <SEO title="À propos de eGame Bénin" description="La vision et la mission de la plateforme eSport panafricaine eGame Bénin." />
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 space-y-16">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#8888AA] hover:text-white transition-colors text-xs font-gaming font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> Retour
        </button>

        <div className="bg-[#0F0F1E] border border-[#8A2BE2]/30 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <img
            src="/portrait-moussa.webp"
            alt="Moussa Jae San Thierry, Fondateur de eGame Bénin"
            className="w-32 h-32 rounded-full border-4 border-[#8A2BE2] object-cover shrink-0 shadow-2xl shadow-[#8A2BE2]/30"
          />
          <div className="space-y-3">
            <div>
              <h2 className="text-xl font-gaming font-bold text-white">Moussa Jae San Thierry</h2>
              <p className="text-xs font-bold text-[#A855F7] uppercase tracking-wider">Fondateur de eGame Bénin</p>
            </div>
            <p className="text-sm text-[#8888AA] leading-relaxed">
              Passionné de gaming et d’eSport, Moussa a créé eGame Bénin avec l’ambition de rassembler les joueurs, développer la compétition et contribuer à la structuration de l’eSport au Bénin et progressivement à travers l’Afrique.
            </p>
          </div>
        </div>

        <div className="text-center space-y-6">
          <Logo size="lg" className="justify-center" />
          <h1 className="text-4xl md:text-5xl font-gaming font-black uppercase text-white tracking-tight">
            L'Arène des Champions
          </h1>
          <p className="text-base text-[#8888AA] max-w-2xl mx-auto leading-relaxed font-medium">
            eGame Bénin est une plateforme eSport où les joueurs s'inscrivent à des tournois, paient les frais d'inscription prévus pour la compétition, affrontent d'autres joueurs et peuvent remporter des récompenses en argent. Une partie des frais d'inscription sert notamment à constituer les cash prizes du tournoi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#0F0F1E] border border-[#8A2BE2]/30 p-8 rounded-3xl space-y-4">
            <Target className="text-[#8A2BE2]" size={36} />
            <h2 className="text-xl font-gaming font-bold uppercase text-white">Notre Mission</h2>
            <p className="text-sm text-[#8888AA] leading-relaxed">
              Professionnaliser la scène eSport africaine en offrant une infrastructure moderne, des règles strictes, des prix attractifs et des paiements instantanés.
            </p>
          </div>

          <div className="bg-[#0F0F1E] border border-[#8A2BE2]/30 p-8 rounded-3xl space-y-4">
            <Users className="text-[#8A2BE2]" size={36} />
            <h2 className="text-xl font-gaming font-bold uppercase text-white">La Communauté</h2>
            <p className="text-sm text-[#8888AA] leading-relaxed">
              Rassembler les gamers de tout le continent, de Dakar à Nairobi et de Casablanca à Johannesburg, autour du fair-play, de la passion du jeu et de la compétition de haut niveau.
            </p>
          </div>
        </div>

        {/* Guide : Comment participer à un tournoi */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 text-[#A855F7] text-[10px] font-gaming font-extrabold tracking-widest uppercase">
              <Zap size={14} className="text-[#FFD700]" />
              Guide de l'Arène
            </div>
            <h2 className="text-3xl font-gaming font-black uppercase text-white">
              Comment <span className="text-[#8A2BE2]">participer</span> à un tournoi ?
            </h2>
            <p className="text-sm text-[#8888AA] max-w-2xl mx-auto font-medium">
              De l'inscription jusqu'au Cash Prize, tout se fait en 6 étapes simples. Suis le guide !
            </p>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className={`relative bg-[#0F0F1E] border p-8 rounded-3xl space-y-4 ${
                  step.highlight
                    ? 'border-emerald-500/50 shadow-xl shadow-emerald-500/10'
                    : 'border-[#8A2BE2]/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-gaming font-black text-[#8A2BE2]/30">{String(i + 1).padStart(2, '0')}</span>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${step.highlight ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40' : 'bg-[#8A2BE2]/20 text-[#8A2BE2]'}`}>
                    <step.icon size={24} />
                  </div>
                </div>
                <h3 className="font-gaming font-bold text-base text-white uppercase flex flex-wrap items-center gap-2">
                  {step.title}
                  {step.highlight && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/40 font-extrabold">Étape clé</span>
                  )}
                </h3>
                <p className="text-xs text-[#8888AA] leading-relaxed">{step.desc}</p>
              </li>
            ))}
          </ol>

          {/* Rappel WhatsApp */}
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-3xl p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="w-16 h-16 bg-emerald-500/15 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/40 shrink-0">
                <MessageSquare size={30} />
              </div>
              <div className="space-y-2">
                <h3 className="font-gaming font-black text-lg text-white uppercase">Le réflexe à ne pas oublier</h3>
                <p className="text-xs text-[#8888AA] leading-relaxed max-w-xl">
                  Après chaque paiement, envoie ton <span className="text-white font-bold">pseudo</span> et ton <span className="text-emerald-400 font-bold">code de validation</span> (ex : EGB-A1B2C) par WhatsApp au support. C'est ce qui confirme officiellement ta place dans le tournoi.
                </p>
              </div>
            </div>
            <a
              href={`https://wa.me/2290141790790?text=${encodeURIComponent("Bonjour eGame Bénin ! Voici mon inscription au tournoi : Pseudo : | Code : ")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white font-gaming font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <MessageSquare size={16} />
              Support WhatsApp
            </a>
          </div>
        </section>

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