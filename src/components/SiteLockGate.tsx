"use client";

import React, { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import { Input } from '@/components/ui/input';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';

const PASSCODE = "221166@@";
const STORAGE_KEY = "egame_site_unlocked";

export const SiteLockGate = ({ children }: { children: React.ReactNode }) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'true') {
      setIsUnlocked(true);
    }
    setChecking(false);
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSCODE) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#07070C] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#8A2BE2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#07070C] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Halo d'ambiance eSport */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#8A2BE2]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#0F0F1E]/90 border border-[#8A2BE2]/40 rounded-[32px] p-8 md:p-10 shadow-2xl backdrop-blur-2xl text-center space-y-6">
        <div className="flex justify-center">
          <Logo size="lg" showText={false} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8A2BE2]/20 border border-[#8A2BE2]/50 text-[#A855F7] text-[10px] font-gaming font-extrabold uppercase tracking-widest">
            <Lock size={12} />
            Accès Restreint
          </div>
          <h1 className="text-2xl md:text-3xl font-gaming font-black uppercase text-white tracking-tight">
            eGame <span className="text-[#8A2BE2]">Bénin</span>
          </h1>
          <p className="text-xs text-[#8888AA] font-medium leading-relaxed">
            La plateforme est actuellement en phase de finalisation et de pré-lancement. Veuillez entrer le code d'accès pour continuer.
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] font-gaming uppercase tracking-widest text-[#8888AA]">
              Mot de passe d'accès
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-[#8888AA]" size={16} />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                className={`pl-10 h-12 bg-[#07070C] border ${
                  error ? 'border-red-500 text-red-300 focus:border-red-500' : 'border-[#8A2BE2]/40 focus:border-[#8A2BE2]'
                } rounded-2xl text-white font-mono`}
                autoFocus
                required
              />
            </div>
            {error && (
              <p className="text-[11px] font-bold text-red-400 flex items-center gap-1 mt-1">
                <ShieldAlert size={13} />
                Mot de passe incorrect.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full btn-neon py-3.5 text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#8A2BE2]/30"
          >
            Déverrouiller l'arène
            <ArrowRight size={15} />
          </button>
        </form>

        <p className="text-[10px] text-[#8888AA]/60 font-gaming uppercase tracking-widest">
          © 2026 eGame Bénin • Pré-Lancement Officiel
        </p>
      </div>
    </div>
  );
};

export default SiteLockGate;