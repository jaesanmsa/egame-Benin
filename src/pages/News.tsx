"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Newspaper, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MOCK_NEWS = [
  {
    id: 'coc-rules',
    title: "RÈGLEMENT OFFICIEL : Tournoi Inter-Clan Clash of Clans - \"L'Arène Africaine\"",
    excerpt: "Bienvenue dans la première compétition eSport structurée pour les clans de Clash of Clans en Afrique. Skill, stratégie et cohésion.",
    content: "Bienvenue dans la première compétition eSport structurée pour les clans de Clash of Clans en Afrique. Ici, le skill, la stratégie et la cohésion d'équipe sont les seules armes. Vous ne jouez pas pour une simple victoire, vous jouez pour le titre de Champion Africain.\n\n1. Format de la Compétition\nFormat : Guerre amicale (Friendly War).\nTaille d'équipe : 5 contre 5.\nPréparation : 24 heures.\nGuerre : 24 heures.\nNiveaux (Hôtels de Ville) : Les clans seront répartis par tranches de niveaux (TH) pour garantir une équité totale.\nLogiciel de jeu : Seule la dernière version officielle de Clash of Clans est autorisée.\n\n2. Code de Conduite et Fair-Play\nZéro Triche (Modding) : L'utilisation de logiciels tiers, d'outils de triche (bots, modding), ou de techniques de \"match fixing\" (trucage de guerre) entraînera une disqualification immédiate et un bannissement à vie de la plateforme eGame Bénin.\nEnregistrement des preuves : Pour chaque guerre, les meilleures attaques de chaque clan doivent être enregistrées en vidéo (capture d'écran vidéo mobile). En cas de suspicion de triche, ces preuves seront demandées par l'organisation.\nRespect : Le respect envers les adversaires est obligatoire. Toute insulte dans le chat du jeu ou dans les groupes de communication entraînera des sanctions.\n\n3. Responsabilités du Capitaine de Clan\nLe Chef (ou le Co-chef désigné) est l'unique interlocuteur officiel. Il s'engage à :\nÊtre présent sur le groupe WhatsApp officiel des Capitaines.\nAssurer la présence de ses 5 membres à l'heure du lancement du défi.\nSignaler tout retard ou problème technique au moins 2 heures avant le début de la guerre.\nForfait : Un retard de plus de 15 minutes sur l'horaire de lancement du défi est considéré comme un forfait pour le clan en retard.\n\n4. Procédure de Litige\nEn cas de désaccord, le Capitaine doit soumettre une réclamation officielle par e-mail à egamebenin@gmail.com avec les preuves vidéos (replay du jeu).\nL'équipe d'arbitrage d'eGame Bénin tranchera sous 12 heures. La décision est sans appel.\n\n5. Inscription et Cash Prize\nL'inscription se fait exclusivement via le formulaire sur egamebenin.com.\nLe paiement du Cash Prize sera effectué uniquement par Mobile Money (MTN, Moov, Celtis) sur le numéro du Chef de Clan enregistré lors de l'inscription.\nGarantie : Les gains sont garantis et versés automatiquement dans les 24h suivant la finale du tournoi.\n\n\"L'Afrique prend sa couronne.\"\nLe tournoi est ouvert. Montrez au monde que les meilleurs stratèges du monde sont ici, en Afrique.",
    image: "/coc-tournament.webp",
    readTime: "8 min"
  },
  {
    id: '1',
    title: "eGame Bénin est né : La révolution eSport commence au Bénin.",
    excerpt: "Découvrez notre mission pour professionnaliser le gaming au Bénin avec des cash prizes via Mobile Money.",
    content: "eGame Bénin est officiellement lancé avec une mission claire : transformer la passion du jeu vidéo en une véritable opportunité professionnelle. Notre équipe s'engage à structurer le secteur de l'eSport local en organisant des tournois réguliers et sécurisés. L'innovation majeure réside dans notre système de récompenses : les gagnants reçoivent leurs Cash Prizes directement via MTN ou Moov Money, garantissant une rapidité et une transparence totale. Notre ambition est de faire du Bénin un hub majeur du gaming en Afrique de l'Ouest.",
    image: "/news-hero.png",
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