"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { ArrowLeft } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const EMOJIS = ["🎮", "🕹️", "🎯", "🔥", "⚡", "🏆", "👑", "💎", "🐱", "🦊", "🐻", "🐼", "🦁", "🐯", "🚀", "🛸", "👾", "💀", "👽", "🤖"];

const COLOR_OPTIONS = [
  { class: "bg-[#8A2BE2]", hex: "8A2BE2" },
  { class: "bg-[#A855F7]", hex: "A855F7" },
  { class: "bg-[#FFD700]", hex: "FFD700" },
  { class: "bg-blue-600", hex: "2563eb" },
  { class: "bg-emerald-600", hex: "059669" },
  { class: "bg-red-600", hex: "dc2626" },
  { class: "bg-orange-600", hex: "ea580c" },
  { class: "bg-zinc-800", hex: "27272a" }
];

const AvatarMaker = () => {
  const navigate = useNavigate();
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#${selectedColor.hex}" />
          <text x="50%" y="56%" font-size="60" text-anchor="middle" dominant-baseline="middle">${selectedEmoji}</text>
        </svg>
      `.trim();

      const avatarUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;

      await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });

      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        });

      showSuccess("Avatar eSport enregistré !");
      navigate('/profil');
    } catch (error: any) {
      showError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-32 pt-24">
      <SEO title="Studio d'Avatar eSport" />
      <Navbar />
      <main className="max-w-xl mx-auto px-6 space-y-8 text-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#8888AA] hover:text-white transition-colors text-xs font-gaming font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> Retour
        </button>

        <h1 className="text-3xl font-gaming font-black uppercase text-white">Studio d'Avatar</h1>

        <div className="flex flex-col items-center gap-8">
          <div className={`w-40 h-40 rounded-full ${selectedColor.class} flex items-center justify-center text-7xl shadow-2xl border-4 border-white/20 transition-all duration-300`}>
            {selectedEmoji}
          </div>

          <div className="w-full space-y-6 bg-[#0F0F1E] p-8 rounded-3xl border border-[#8A2BE2]/30 text-left">
            <div className="space-y-3">
              <p className="text-xs font-gaming font-bold text-[#8888AA] uppercase">Sélectionner un Emoji</p>
              <div className="grid grid-cols-5 gap-3">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`text-2xl p-3 rounded-2xl transition-all ${selectedEmoji === emoji ? 'bg-[#8A2BE2] scale-110 shadow-lg shadow-[#8A2BE2]/50' : 'bg-[#0A0A0F] hover:bg-[#8A2BE2]/20'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-gaming font-bold text-[#8888AA] uppercase">Couleur du fond</p>
              <div className="flex flex-wrap gap-3">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 ${color.class} ${selectedColor.hex === color.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full btn-glow-border py-4 text-xs tracking-widest uppercase"
          >
            {saving ? "Enregistrement..." : "Définir comme photo de profil"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default AvatarMaker;