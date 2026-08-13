"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import { Newspaper, ArrowRight, Clock, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

const News = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const { data } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setNews(data);
      setLoading(false);
    };
    fetchNews();
  }, []);

  const featuredArticle = news.find(a => a.is_featured) || news[0];
  const otherArticles = news.filter(a => a.id !== featuredArticle?.id);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-32 pt-24">
      <SEO 
        title="Actualités Gaming & eSport Bénin" 
        description="Le Mag de l'eSport au Bénin. Règlements de tournois, conseils pour progresser et actualité gaming."
      />
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#8A2BE2]/20 border border-[#8A2BE2]/50 rounded-2xl flex items-center justify-center text-[#8A2BE2]">
            <Newspaper size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-gaming font-black uppercase text-white">Le Mag eSport</h1>
            <p className="text-xs text-[#8888AA] font-esport uppercase tracking-wider mt-1">L'actualité gaming du Bénin</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-8">
            <Skeleton className="h-72 w-full rounded-3xl bg-[#0F0F1E]" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-56 rounded-3xl bg-[#0F0F1E]" />
              <Skeleton className="h-56 rounded-3xl bg-[#0F0F1E]" />
              <Skeleton className="h-56 rounded-3xl bg-[#0F0F1E]" />
            </div>
          </div>
        ) : news.length === 0 ? (
          <div className="py-20 text-center bg-[#0F0F1E] rounded-3xl border border-[#8A2BE2]/20">
            <SearchX size={48} className="mx-auto text-[#8888AA] mb-3 opacity-40" />
            <p className="text-sm font-gaming text-[#8888AA]">Aucun article publié pour le moment.</p>
          </div>
        ) : (
          <>
            {/* Article à la une */}
            {featuredArticle && (
              <Link to={`/news/${featuredArticle.id}`} className="block">
                <motion.div 
                  whileHover={{ y: -6 }}
                  className="bg-[#0F0F1E] border border-[#8A2BE2]/40 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2 group"
                >
                  <div className="aspect-video md:aspect-auto overflow-hidden relative">
                    <img src={featuredArticle.image_url} alt={featuredArticle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="p-8 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-gaming font-bold text-[#A855F7] uppercase tracking-wider">
                        <Clock size={12} /> {featuredArticle.read_time} de lecture
                      </div>
                      <h2 className="text-2xl font-gaming font-black text-white group-hover:text-[#A855F7] transition-colors leading-tight">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-sm text-[#8888AA] leading-relaxed line-clamp-3">
                        {featuredArticle.excerpt}
                      </p>
                    </div>
                    <div className="text-xs font-gaming font-bold text-[#FFD700] uppercase flex items-center gap-2">
                      Lire l'article complet <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              </Link>
            )}

            {/* Grille des autres articles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherArticles.map((article) => (
                <Link key={article.id} to={`/news/${article.id}`}>
                  <motion.article 
                    whileHover={{ y: -6 }}
                    className="bg-[#0F0F1E] border border-[#8A2BE2]/20 hover:border-[#8A2BE2] rounded-3xl overflow-hidden shadow-xl flex flex-col h-full group"
                  >
                    <div className="aspect-video overflow-hidden relative">
                      <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-gaming font-bold text-[#A855F7] uppercase tracking-wider">
                          <Clock size={12} /> {article.read_time}
                        </div>
                        <h3 className="font-gaming font-bold text-base text-white group-hover:text-[#A855F7] transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-xs text-[#8888AA] line-clamp-2 leading-relaxed">
                          {article.excerpt}
                        </p>
                      </div>
                      <div className="text-xs font-gaming font-bold text-[#FFD700] uppercase flex items-center gap-1">
                        Lire <ArrowRight size={14} />
                      </div>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default News;