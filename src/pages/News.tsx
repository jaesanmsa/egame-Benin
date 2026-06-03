"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Newspaper, ArrowRight, Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MOCK_NEWS = [
  {
    id: 'coc-rules',
    title: "RÈGLEMENT OFFICIEL : Tournoi Inter-Clan Clash of Clans - \"L'Arène Africaine\"",
    excerpt: "Bienvenue dans la première compétition eSport structurée pour les clans de Clash of Clans en Afrique. Skill, stratégie et cohésion.",
    content: "Bienvenue dans la première compétition eSport structurée pour les clans de Clash of Clans en Afrique. Ici, le skill, la stratégie et la cohésion d'équipe sont les seules armes. Vous ne jouez pas pour une simple victoire, vous jouez pour le titre de Champion Africain...",
    image: "/coc-tournament.webp",
    readTime: "8 min",
    featured: true
  },
  {
    id: '3',
    title: "Quels sont les jeux disponibles pour gagner des Cash Prizes ?",
    excerpt: "Découvrez la liste des disciplines compétitives disponibles sur notre plateforme.",
    content: "eGame Bénin propose une sélection variée de jeux pour tous les profils de joueurs...",
    image: "/games-news.webp",
    readTime: "6 min"
  },
  {
    id: '1',
    title: "eGame Bénin est né : La révolution eSport commence au Bénin.",
    excerpt: "Découvrez notre mission pour professionnaliser le gaming au Bénin avec des cash prizes via Mobile Money.",
    content: "eGame Bénin est officiellement lancé avec une mission claire...",
    image: "/news-hero.png",
    readTime: "5 min"
  },
  {
    id: '2',
    title: "3 conseils pour dominer ton premier tournoi sur eGame Bénin.",
    excerpt: "Préparez-vous comme un pro avec nos conseils techniques essentiels pour votre première compétition.",
    content: "Participer à son premier tournoi eSport peut être stressant...",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
    readTime: "4 min"
  }
];

const News = () => {
  const featuredArticle = MOCK_NEWS.find(a => a.featured);
  const otherArticles = MOCK_NEWS.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-violet-600/10 rounded-2xl flex items-center justify-center text-violet-500">
            <Newspaper size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase">Actualités</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Le mag du gaming au Bénin</p>
          </div>
        </div>

        {/* Article à la Une */}
        {featuredArticle && (
          <Link to={`/news/${featuredArticle.id}`} className="block mb-16">
            <motion.div 
              whileHover={{ y: -8 }}
              className="relative aspect-[16/9] md:aspect-[21/9] rounded-[3rem] overflow-hidden border border-violet-500/30 shadow-2xl group"
            >
              <img src={featuredArticle.image} alt={featuredArticle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-violet-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                    <Zap size={10} fill="white" /> Important
                  </div>
                  <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Clock size={12} /> {featuredArticle.readTime}
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-white mb-4 leading-tight max-w-3xl">{featuredArticle.title}</h2>
                <p className="text-white/70 text-sm md:text-base max-w-2xl line-clamp-2 mb-6">{featuredArticle.excerpt}</p>
                <div className="flex items-center gap-2 text-violet-400 font-black text-xs uppercase tracking-widest">
                  Lire l'article complet <ArrowRight size={16} />
                </div>
              </div>
            </motion.div>
          </Link>
        )}

        {/* Grille des autres articles */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {otherArticles.map((article) => (
            <Link key={article.id} to={`/news/${article.id}`}>
              <motion.article 
                whileHover={{ y: -8 }}
                className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm h-full flex flex-col group"
              >
                <div className="aspect-square overflow-hidden bg-zinc-900">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-[8px] font-bold text-violet-500 uppercase tracking-widest mb-3">
                    <Clock size={10} /> {article.readTime}
                  </div>
                  <h2 className="text-sm font-black mb-3 leading-tight group-hover:text-violet-500 transition-colors line-clamp-2">{article.title}</h2>
                  <p className="text-muted-foreground text-[10px] leading-relaxed mb-4 line-clamp-2">{article.excerpt}</p>
                  <div className="mt-auto flex items-center gap-1 text-violet-500 font-black text-[8px] uppercase tracking-widest">
                    Lire <ArrowRight size={12} />
                  </div>
                </div>
              </motion.article>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default News;