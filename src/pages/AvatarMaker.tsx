"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const EMOJIS = ["🎮", "🕹️", "🎯", "🔥", "⚡", "🏆", "👑", "💎", "🐱", "🦊", "🐻", "🐼", "🦁", "🐯", "🐸", "🐵", "🚀", "🛸", "👾", "👻", "💀", "👽", "🤖", "🎃"];

const COLOR_OPTIONS = [
  { class: "bg-violet-600", hex: "7c3aed" },
  { class: "bg-indigo-600", hex: "4f46e5" },
  { class: "bg-blue-600", hex: "2563eb" },
  { class: "bg-cyan-600", hex: "0891b2" },
  { class: "bg-emerald-600", hex: "059669" },
  { class: "bg-green-600", hex: "16a34a" },
  { class: "bg-lime-600", hex: "65a30d" },
  { class: "bg-yellow-600", hex: "ca8a04" },
  { class: "bg-orange-600", hex: "ea580c" },
  { class: "bg-red-600", hex: "dc2626" },
  { class: "bg-rose-600", hex: "e11d48" },
  { class: "bg-pink-600", hex: "db2777" },
  { class: "bg-zinc-800", hex: "27272a" },
  { class: "bg-slate-700", hex: "334155" },
  { class: "bg-neutral-900", hex: "171717" }
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

      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });
      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        });
      if (profileError) throw profileError;

      showSuccess("Avatar mis à jour !");
      navigate('/profile');
    } catch (error: any) {
      showError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft size={20} />
          Retour
        </button>

        <h1 className="text-3xl font-black mb-8 text-center">Studio d'Avatar</h1>

        <div className="flex flex-col items-center gap-12">
          <div className={`w-48 h-48 rounded-[3rem] ${selectedColor.class} flex items-center justify-center text-8xl shadow-2xl border-4 border-white/10 transition-all duration-500`}>
            {selectedEmoji}
          </div>

          <div className="w-full space-y-8 bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
            <div className="space-y-4">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Choisir un Emoji</p>
              <div className="grid grid-cols-6 gap-3">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`text-2xl p-3 rounded-xl transition-all ${selectedEmoji === emoji ? 'bg-violet-600 text-white scale-110' : 'bg-muted hover:bg-muted/80'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Couleur de fond</p>
              <div className="flex flex-wrap gap-3">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 ${color.class} ${selectedColor.hex === color.hex ? 'border-foreground scale-110' : 'border-transparent'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full py-8 rounded-2xl bg-violet-600 hover:bg-violet-700 text-lg font-bold shadow-xl shadow-violet-500/20 gap-2 text-white"
          >
            {saving ? "Enregistrement..." : "Définir comme photo de profil"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AvatarMaker;