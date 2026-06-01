"use client";

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Share2 } from 'lucide-react';
import { MOCK_NEWS } from './News';
import { showSuccess } from '@/utils/toast';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = MOCK_NEWS.find(a => a.id === id);

  if (!article) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess("Lien copié !");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <Navbar />
      
      <div className="relative h-[50vh] w-full overflow-hidden">
        <img src={article.image} className="w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute top-6 left-6 z-20">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-card/80 backdrop-blur-md rounded-full border border-border shadow-lg">
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 -mt-32 relative z-10">
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-[3rem] p-8 md:p-12 shadow-2xl"
        >
          <header className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6 text-[10px] font-black text-violet-500 uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2"><Clock size={14} /> {article.readTime} de lecture</span>
              </div>
              <button onClick={handleShare} className="text-muted-foreground hover:text-violet-500 transition-colors">
                <Share2 size={20} />
              </button>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-6">
              {article.title}
            </h1>
          </header>

          <div className="prose prose-invert max-w-none">
            <p className="text-lg md:text-xl text-foreground/90 leading-relaxed mb-8 font-medium">
              {article.excerpt}
            </p>
            <div className="text-muted-foreground text-base md:text-lg leading-loose space-y-6">
              <p>{article.content}</p>
              <p>
                L'engagement de la communauté est au cœur de cette évolution. Les tournois réguliers permettent non seulement de gagner des prix, mais aussi de se faire un nom dans le milieu. eGame Bénin s'engage à fournir la meilleure expérience possible pour tous les compétiteurs, quel que soit leur niveau.
              </p>
              <h2 className="text-2xl font-black text-white pt-6">Pourquoi c'est important pour vous ?</h2>
              <p>
                Participer à ces événements vous permet de développer vos compétences stratégiques, votre esprit d'équipe et votre réactivité. C'est aussi une excellente occasion de rencontrer d'autres passionnés et de partager votre expérience de jeu.
              </p>
            </div>
          </div>
        </motion.article>
      </main>
    </div>
  );
};

export default NewsDetail;