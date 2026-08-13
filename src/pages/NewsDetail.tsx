"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { ArrowLeft, Clock, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showSuccess } from '@/utils/toast';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      const { data } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) setArticle(data);
      setLoading(false);
    };
    fetchArticle();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#07070C] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#8A2BE2] border-t-transparent rounded-full animate-spin" /></div>;
  if (!article) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess("Lien de l'article copié !");
  };

  return (
    <div className="min-h-screen bg-[#07070C] text-white pb-32">
      <SEO 
        title={article.title} 
        description={article.excerpt} 
        image={article.image_url}
      />
      <Navbar />
      
      <div className="relative h-[45vh] w-full overflow-hidden">
        <img src={article.image_url} className="w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070C] via-[#07070C]/40 to-transparent" />
        <div className="absolute top-6 left-6 z-20">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-[#0F0F1E]/80 backdrop-blur-md rounded-full border border-[#8A2BE2]/40 text-white hover:bg-[#8A2BE2] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 -mt-24 relative z-10">
        <article className="glass-panel p-8 md:p-12 space-y-8">
          <header className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-gaming font-bold text-[#A855F7] uppercase flex items-center gap-2">
                <Clock size={14} /> {article.read_time} de lecture
              </span>
              <button onClick={handleShare} className="p-2 text-[#8888AA] hover:text-white transition-colors">
                <Share2 size={20} />
              </button>
            </div>
            <h1 className="text-3xl md:text-4xl font-gaming font-black text-white leading-tight">
              {article.title}
            </h1>
          </header>

          <p className="text-lg text-[#A855F7] font-medium leading-relaxed font-esport border-l-4 border-[#8A2BE2] pl-4">
            {article.excerpt}
          </p>

          <div className="text-[#8888AA] text-base leading-relaxed space-y-6 whitespace-pre-wrap">
            {article.content}
          </div>
        </article>
      </main>
    </div>
  );
};

export default NewsDetail;