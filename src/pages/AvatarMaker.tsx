"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const EMOJIS = ["🎮", "🕹️", "🎯", "🔥", "⚡", "🏆", "👑", "💎", "🐱", "🦊", "🐻", "🐼", "🦁", "🐯", "🐸", "🐵", "🚀", "🛸", "👾", "👻", "💀", "👽", "🤖", "🎃"];
const COLORS = [
  "bg-violet-600", "bg-indigo-600", "bg-blue-600", "bg-cyan-600", 
  "bg-emerald-600", "bg-green-600", "bg-lime-600", "bg-yellow-600", 
  "bg-orange-600", "bg-red-600", "bg-rose-600", "bg-pink-600",
  "bg-zinc-800", "bg-slate-700", "bg-neutral-900"
];

const AvatarMaker = () => {
  const navigate = useNavigate();
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // On crée une URL factice ou on utilise un service comme DiceBear avec l'emoji
      // Pour faire simple et efficace, on va générer une URL DiceBear basée sur l'emoji
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedEmoji)}&backgroundColor=${selectedColor.replace('bg-', '').replace('-600', '4f46e5')}`;
      
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });

      if (error) throw error;
      
      showSuccess("Avatar mis à jour !");
      navigate('/profile');
    } catch (error: any) {
      showError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} />
          Retour
        </button>

        <h1 className="text-3xl font-black mb-8 text-center">Studio d'Avatar</h1>

        <div className="flex flex-col items-center gap-12">
          {/* Preview */}
          <div className={`w-48 h-48 rounded-[3rem] ${selectedColor} flex items-center justify-center text-8xl shadow-2xl shadow-black/50 border-4 border-white/10 transition-all duration-500`}>
            {selectedEmoji}
          </div>

          <div className="w-full space-y-8 bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-800">
            {/* Emoji Picker */}
            <div className="space-y-4">
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Choisir un Emoji</p>
              <div className="grid grid-cols-6 gap-3">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`text-2xl p-3 rounded-xl transition-all ${selectedEmoji === emoji ? 'bg-violet-600 scale-110' : 'bg-zinc-800 hover:bg-zinc-700'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div className="space-y-4">
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Couleur de fond</p>
              <div className="flex flex-wrap gap-3">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 ${color} ${selectedColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full py-8 rounded-2xl bg-violet-600 hover:bg-violet-700 text-lg font-bold shadow-xl shadow-violet-500/20 gap-2"
          >
            <Save size={20} />
            {saving ? "Enregistrement..." : "Définir comme photo de profil"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AvatarMaker;