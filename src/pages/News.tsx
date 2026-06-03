"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import { Newspaper, ArrowRight, Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MOCK_NEWS = [
  {
    id: 'coc-rules',
    title: "RÈGLEMENT OFFICIEL : Tournoi Inter-Clan Clash of Clans - \"L'Arène Africaine\"",
    excerpt: "Découvrez le format, le code de conduite et les procédures officielles pour le plus grand tournoi de clans au Bénin.",
    content: `Format de la Compétition
Format : Guerre amicale (Friendly War).
Taille d'équipe : 5 contre 5.
Préparation : 24 heures.
Guerre : 24 heures.
Niveaux (Hôtels de Ville) : Les clans seront répartis par tranches de niveaux (TH) pour garantir une équité totale.
Logiciel de jeu : Seule la dernière version officielle de Clash of Clans est autorisée.

Code de Conduite et Fair-Play
Zéro Triche (Modding) : L'utilisation de logiciels tiers, d'outils de triche (bots, modding), ou de techniques de "match fixing" (trucage de guerre) entraînera une disqualification immédiate et un bannissement à vie de la plateforme eGame Bénin.
Enregistrement des preuves : Pour chaque guerre, les meilleures attaques de chaque clan doivent être enregistrées en vidéo (capture d'écran vidéo mobile). En cas de suspicion de triche, ces preuves seront demandées par l'organisation. Respect : Le respect envers les adversaires est obligatoire. Toute insulte dans le chat du jeu ou dans les groupes de communication entraînera des sanctions.

Responsabilités du Capitaine de Clan
Le Chef (ou le Co-chef désigné) est l'unique interlocuteur officiel. Il s'engage à :
- Être présent sur le groupe WhatsApp officiel des Capitaines.
- Assurer la présence de ses 5 membres à l'heure du lancement du défi.
- Signaler tout retard ou problème technique au moins 2 heures avant le début de la guerre.
Forfait : Un retard de plus de 15 minutes sur l'horaire de lancement du défi est considéré comme un forfait pour le clan en retard.

Procédure de Litige
En cas de désaccord, le Capitaine doit soumettre une réclamation officielle par e-mail à egamebenin@gmail.com avec les preuves vidéos (replay du jeu). L'équipe d'arbitrage d'eGame Bénin tranchera sous 12 heures. La décision est sans appel.

Inscription et Cash Prize
L'inscription se fait exclusivement via le formulaire sur egamebenin.com. Le paiement du Cash Prize sera effectué uniquement par Mobile Money (MTN, Moov, Celtis) sur le numéro du Chef de Clan enregistré lors de l'inscription.
Garantie : Les gains sont garantis et versés automatiquement dans les 24h suivant la finale du tournoi.

"L'Afrique prend sa couronne." Le tournoi est ouvert. Montrez au monde que les meilleurs stratèges du monde sont ici, en Afrique.`,
    image: "/coc-tournament.webp",
    readTime: "10 min",
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
      <SEO 
        title="Actualités Gaming Bénin" 
        description="Suivez toute l'actualité de l'eSport au Bénin. Règlements de tournois, conseils de pros et news sur vos jeux préférés."
      />
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

        {/* Article à la Une - Textes réduits et mieux disposés */}
        {featuredArticle && (
          <Link to={`/news/${featuredArticle.id}`} className="block mb-16">
            <motion.div 
              whileHover={{ y: -4 }}
              className="relative aspect-[16/14] md:aspect-[16/10] min-h-[600px] rounded-[3rem] overflow-hidden border border-violet-500/15 shadow-2xl group"
            >
              <img src={featuredArticle.image} alt={featuredArticle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-violet-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Zap size={12} fill="white" /> Règlement Officiel
                  </div>
                  <span className="text-white/80 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Clock size={14} /> {featuredArticle.readTime}
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-white mb-6 leading-tight max-w-4xl">{featuredArticle.title}</h2>
                <p className="text-white/80 text-sm md:text-base max-w-3xl line-clamp-4 mb-8 font-medium">{featuredArticle.excerpt}</p>
                <div className="flex items-center gap-3 text-violet-400 font-black text-sm uppercase tracking-widest group-hover:gap-5 transition-all">
                  Lire le règlement complet <ArrowRight size={20} />
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