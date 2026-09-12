"use client";

import React, { useEffect, useState } from 'react';
import Logo from '@/components/Logo';
import { Input } from '@/components/ui/input';
import { Lock, ArrowRight, ShieldAlert, Timer } from 'lucide-react';

const PASSCODE = "221166@@";
const STORAGE_KEY = "egame_site_unlocked";
const PUBLIC_LAUNCH_AT = new Date("2026-09-13T07:00:22.228Z").getTime();

export const SiteLockGate = ({ children }: { children: React.ReactNode }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, PUBLIC_LAUNCH_AT - Date.now()));

  useEffect(() => {
    const updateAccess = () => {
      const remaining = Math.max(0, PUBLIC_LAUNCH_AT - Date.now());
      setTimeLeft(remaining);

      if (remaining === 0) {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsUnlocked(true);
      }
    };

    if (localStorage.getItem(STORAGE_KEY) === 'true' || Date.now() >= PUBLIC_LAUNCH_AT) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsUnlocked(true);
    }

    updateAccess();
    setChecking(false);
    const interval = window.setInterval(updateAccess, 1000);

    return () => window.clearInterval(interval);
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

  const totalSeconds = Math.floor(timeLeft / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const formatUnit = (value: number) => value.toString().padStart(2, '0');

  return (
    <div className="min-h-screen bg-[#07070C] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
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
            La plateforme est en pré-lancement. Elle sera automatiquement accessible au grand public à la fin du compte à rebours.
          </p>
        </div>

        <div className="rounded-2xl border border-[#FFD700]/30 bg-[#07070C] p-4 space-y-3">
          <div className="flex items-center justify-center gap-2 text-[#FFD700]">
            <Timer size={15} />
            <p className="text-[10px] font-gaming font-bold uppercase tracking-widest">Ouverture officielle dans</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: formatUnit(hours), label: 'Heures' },
              { value: formatUnit(minutes), label: 'Minutes' },
              { value: formatUnit(seconds), label: 'Secondes' }
            ].map((unit) => (
              <div key={unit.label} className="rounded-xl bg-[#0F0F1E] border border-[#8A2BE2]/25 py-3">
                <p className="text-xl font-gaming font-black text-white tabular-nums">{unit.value}</p>
                <p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-[#8888AA]">{unit.label}</p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] font-gaming uppercase tracking-widest text-[#8888AA]">
              Code d'accès anticipé
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
            Accéder en avant-première
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
