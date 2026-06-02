"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Newspaper, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MOCK_NEWS = [
  {
    id: '1',
    title: "eGame Bénin est né : La révolution eSport commence au Bénin.",
    excerpt: "Découvrez notre mission pour professionnaliser le gaming au Bénin avec des cash prizes via Mobile Money.",
    content: "eGame Bénin est officiellement lancé avec une mission claire : transformer la passion du jeu vidéo en une véritable opportunité professionnelle. Notre équipe s'engage à structurer le secteur de l'eSport local en organisant des tournois réguliers et sécurisés. L'innovation majeure réside dans notre système de récompenses : les gagnants reçoivent leurs Cash Prizes directement via MTN ou Moov Money, garantissant une rapidité et une transparence totale. Notre ambition est de faire du Bénin un hub majeur du gaming en Afrique de l'Ouest.",
    image: "https://ajbpdaxtynkazdrzyopd.supabase.co/storage/v1/object/public/assets/logo-email.png",
    readTime: "5 min"
  },
  {
    id: '2',
    title: "3 conseils pour dominer ton premier tournoi sur eGame Bénin.",
    excerpt: "Préparez-vous comme un pro avec nos conseils techniques essentiels pour votre première compétition.",
    content: "Participer à son premier tournoi eSport peut être stressant. Voici trois conseils pour maximiser vos chances : 1. La Connexion : Assurez-vous d'être sur une connexion 4G stable ou fibre optique pour éviter tout lag fatal. 2. L'Énergie : Vérifiez que votre batterie est à 100% et gardez votre chargeur à proximité. Un téléphone qui s'éteint en pleine finale est votre pire ennemi. 3. La Concentration : Isolez-vous dans un endroit calme. Le mental fait souvent la différence entre un bon joueur et un champion.",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
    readTime: "4 min"
  },
  {
    id: '3',
    title: "Quels sont les jeux disponibles pour gagner des Cash Prizes ?",
    excerpt: "Découvrez la liste des disciplines compétitives disponibles sur notre plateforme.",
    content: "eGame Bénin propose une sélection variée de jeux pour tous les profils de joueurs. Free Fire et PUBG Mobile dominent la scène Battle Royale par leur intensité. Pour les amateurs de stratégie, Clash Royale offre des duels rapides et tactiques. Les fans de FPS peuvent s'illustrer sur COD Mobile, tandis que les amateurs de sport et de course trouveront leur bonheur avec nos tournois Blur et FIFA. Chaque jeu a été choisi pour son potentiel compétitif et sa popularité au sein de la communauté béninoise.",
    image: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=800",
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
                <div className="aspect-video overflow-hidden bg-zinc-900 flex items-center justify-center">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-4">
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