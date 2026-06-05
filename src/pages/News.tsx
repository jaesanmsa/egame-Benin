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

  const featuredArticle = news.find(a => a.is_featured);
  const otherArticles = news.filter(a => a.id !== featuredArticle?.id);

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

        {loading ? (
          <div className="space-y-12">
            <Skeleton className="h-64 w-full rounded-[2.5rem]" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <Skeleton className="h-48 rounded-[2.5rem]" />
              <Skeleton className="h-48 rounded-[2.5rem]" />
              <Skeleton className="h-48 rounded-[2.5rem]" />
            </div>
          </div>
        ) : news.length === 0 ? (
          <div className="py-20 text-center bg-card/30 rounded-[40px] border border-dashed border-border">
            <SearchX size={48} className="mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground text-sm font-bold italic">Aucun article publié pour le moment.</p>
          </div>
        ) : (
          <>
            {featuredArticle && (
              <div className="mb-16">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-500 mb-6">À la une</h2>
                <Link to={`/news/${featuredArticle.id}`} className="block max-w-md">
                  <motion.div 
                    whileHover={{ y: -8 }}
                    className="bg-[#1a0b2e] border border-violet-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl group"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img src={featuredArticle.image_url} alt={featuredArticle.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-[8px] font-black text-violet-400 uppercase tracking-widest mb-3">
                        <Clock size={10} /> {featuredArticle.read_time}
                      </div>
                      <h3 className="text-white font-bold text-xs mb-3 line-clamp-2 group-hover:text-violet-400 transition-colors">{featuredArticle.title}</h3>
                      <p className="text-violet-200/60 text-[9px] leading-relaxed line-clamp-2">{featuredArticle.excerpt}</p>
                    </div>
                  </motion.div>
                </Link>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {otherArticles.map((article) => (
                <Link key={article.id} to={`/news/${article.id}`}>
                  <motion.article 
                    whileHover={{ y: -8 }}
                    className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm h-full flex flex-col group"
                  >
                    <div className="aspect-square overflow-hidden bg-zinc-900">
                      <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-[8px] font-bold text-violet-500 uppercase tracking-widest mb-3">
                        <Clock size={10} /> {article.read_time}
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
          </>
        )}
      </main>
    </div>
  );
};

export default News;