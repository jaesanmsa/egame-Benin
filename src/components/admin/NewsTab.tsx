"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Plus, Trash2, Edit3, Image as ImageIcon, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { showError, showSuccess } from '@/utils/toast';

const NewsTab = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    image_url: '',
    read_time: '5 min',
    is_featured: false
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    if (data) setNews(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase.from('news').update(formData).eq('id', editingId);
        if (error) throw error;
        showSuccess("Article mis à jour !");
      } else {
        const { error } = await supabase.from('news').insert([formData]);
        if (error) throw error;
        showSuccess("Article publié !");
      }
      setFormData({ title: '', excerpt: '', content: '', image_url: '', read_time: '5 min', is_featured: false });
      setEditingId(null);
      fetchNews();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) showError(error.message);
    else {
      showSuccess("Article supprimé");
      fetchNews();
    }
  };

  const startEdit = (article: any) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      image_url: article.image_url,
      read_time: article.read_time,
      is_featured: article.is_featured
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-10">
      <motion.form 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        onSubmit={handleSubmit} 
        className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6"
      >
        <h2 className="text-xl font-black flex items-center gap-3">
          <Newspaper className="text-violet-500" /> 
          {editingId ? "Modifier l'article" : "Nouvel Article"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Titre</Label>
            <Input 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              className="py-6 bg-muted/50 border-border rounded-xl" 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Temps de lecture</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <Input 
                value={formData.read_time} 
                onChange={e => setFormData({...formData, read_time: e.target.value})} 
                className="pl-10 py-6 bg-muted/50 border-border rounded-xl" 
              />
            </div>
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Image URL</Label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <Input 
                value={formData.image_url} 
                onChange={e => setFormData({...formData, image_url: e.target.value})} 
                className="pl-10 py-6 bg-muted/50 border-border rounded-xl" 
              />
            </div>
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Résumé (Excerpt)</Label>
            <Input 
              value={formData.excerpt} 
              onChange={e => setFormData({...formData, excerpt: e.target.value})} 
              className="py-6 bg-muted/50 border-border rounded-xl" 
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Contenu complet</Label>
            <Textarea 
              value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})} 
              className="bg-muted/50 border-border rounded-2xl min-h-[200px] p-4" 
              required 
            />
          </div>
          <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-border/50">
            <Switch 
              checked={formData.is_featured} 
              onCheckedChange={v => setFormData({...formData, is_featured: v})} 
            />
            <Label className="text-xs font-bold flex items-center gap-2">
              <Star size={14} className={formData.is_featured ? "text-yellow-500 fill-yellow-500" : ""} />
              Mettre à la une (Accueil)
            </Label>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700 py-8 rounded-2xl font-black text-base shadow-xl shadow-violet-500/20 text-white">
            {editingId ? "Enregistrer les modifications" : "Publier l'article"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={() => { setEditingId(null); setFormData({ title: '', excerpt: '', content: '', image_url: '', read_time: '5 min', is_featured: false }); }} className="py-8 px-8 rounded-2xl border-border font-bold">
              Annuler
            </Button>
          )}
        </div>
      </motion.form>

      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-2">Articles publiés</h3>
        {loading ? (
          <div className="text-center py-10"><div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : news.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground italic">Aucun article pour le moment.</p>
        ) : (
          <div className="grid gap-4">
            {news.map(article => (
              <div key={article.id} className="bg-card p-5 rounded-2xl border border-border flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted border border-border">
                    <img src={article.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-black text-sm line-clamp-1">{article.title}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      {article.is_featured && <span className="text-yellow-500 mr-2">★ À LA UNE</span>}
                      {new Date(article.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => startEdit(article)} className="rounded-xl border-border hover:bg-muted"><Edit3 size={16} /></Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(article.id)} className="rounded-xl border-border hover:bg-red-500/10 text-red-400"><Trash2 size={16} /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsTab;