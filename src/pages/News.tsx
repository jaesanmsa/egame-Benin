"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Newspaper, ArrowRight, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MOCK_NEWS = [
  {
    id: '1',
    title: "L'essor de l'eSport au Bénin : Une nouvelle ère pour les gamers",
    excerpt: "Découvrez comment la scène compétitive béninoise se structure et quelles sont les opportunités pour les jeunes talents locaux.",
    content: "L'eSport n'est plus seulement un passe-temps au Bénin, c'est devenu une véritable discipline compétitive. Avec l'arrivée de plateformes comme eGame Bénin, les joueurs ont désormais un cadre pour s'affronter et gagner des prix réels. Cette professionnalisation attire de plus en plus de sponsors et de spectateurs, créant un écosystème dynamique à Cotonou et dans tout le pays.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
    date: "15 Mars 2024",
    readTime: "5 min"
  },
  {
    id: '2',
    title: "Top 5 des jeux mobiles les plus joués au Bénin en 2024",
    excerpt: "De Free Fire à Clash Royale, voici les titres qui dominent les smartphones des joueurs béninois cette année.",
    content: "Le gaming mobile est roi au Bénin. En tête de liste, on retrouve inévitablement Free Fire, apprécié pour sa fluidité sur tous types de smartphones. Clash Royale suit de près avec sa dimension stratégique. COD Mobile, PUBG et Mobile Legends complètent ce top 5, portés par des communautés de plus en plus actives et organisées.",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
    date: "12 Mars 2024",
    readTime: "4 min"
  },
  {
    id: '3',
    title: "Comment optimiser votre connexion pour les tournois en ligne",
    excerpt: "Nos conseils pratiques pour réduire votre ping et éviter les lags pendant vos matchs cruciaux.",
    content: "Le lag est l'ennemi numéro 1 du gamer. Pour performer lors des tournois eGame Bénin, assurez-vous d'utiliser une connexion stable. Privilégiez la 4G/5G ou le Wi-Fi fibre si possible. Fermez les applications en arrière-plan et désactivez les mises à jour automatiques pendant vos sessions de jeu pour garantir une latence minimale.",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
    date: "10 Mars 2024",
    readTime: "6 min"
  }
];

const News = () => {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_NEWS.map((article) => (
            <Link key={article.id} to={`/news/${article.id}`}>
              <motion.article 
                whileHover={{ y: -8 }}
                className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm h-full flex flex-col"
              >
                <div className="aspect-video overflow-hidden">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {article.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime}</span>
                  </div>
                  <h2 className="text-xl font-black mb-4 leading-tight group-hover:text-violet-500 transition-colors">{article.title}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">{article.excerpt}</p>
                  <div className="mt-auto flex items-center gap-2 text-violet-500 font-black text-[10px] uppercase tracking-widest">
                    Lire l'article <ArrowRight size={14} />
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