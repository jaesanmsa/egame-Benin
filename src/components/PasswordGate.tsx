"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Zap, ArrowRight, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { showError } from '@/utils/toast';

interface PasswordGateProps {
  children: React.ReactNode;
}

const PasswordGate = ({ children }: PasswordGateProps) => {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = localStorage.getItem('egame_access');
    if (access === 'true') {
      setIsAuthorized(true);
    }
    setLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '200416') {
      localStorage.setItem('egame_access', 'true');
      setIsAuthorized(true);
    } else {
      showError("Code d'accès incorrect");
      setPassword('');
    }
  };

  if (loading) return null;

  if (isAuthorized) return <>{children}</>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Effets de fond */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#4c1d95_0%,transparent_50%)] opacity-20" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md text-center space-y-12"
      >
        <div className="space-y-6">
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-24 h-24 bg-violet-600/20 border border-violet-500/30 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-violet-500/20"
          >
            <Trophy className="text-violet-500" size={48} />
          </motion.div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
              eGame <span className="text-violet-500">Bénin</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-violet-400 font-black text-[10px] uppercase tracking-[0.4em]">
              <Zap size={12} className="fill-violet-400" />
              Coming Soon
              <Zap size={12} className="fill-violet-400" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] space-y-8 shadow-2xl">
          <div className="space-y-2">
            <p className="text-sm font-bold text-zinc-400">Accès Restreint</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Entrez le code secret pour entrer dans l'arène</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <Input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="bg-zinc-950/50 border-white/10 h-16 pl-12 text-center text-2xl tracking-[0.5em] font-black rounded-2xl focus:ring-violet-500 focus:border-violet-500"
                autoFocus
              />
            </div>
            <Button 
              type="submit"
              className="w-full h-16 bg-violet-600 hover:bg-violet-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-violet-500/20 gap-3"
            >
              Débloquer l'accès <ArrowRight size={18} />
            </Button>
          </form>
        </div>

        <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em]">
          © 2026 eGame Bénin • Phase de Lancement
        </p>
      </motion.div>
    </div>
  );
};

export default PasswordGate;