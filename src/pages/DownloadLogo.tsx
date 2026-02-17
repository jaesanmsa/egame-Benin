"use client";

import React from 'react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DownloadLogo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10">
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-10 left-10 flex items-center gap-2 text-zinc-500 hover:text-zinc-800 transition-colors"
      >
        <ArrowLeft size={20} />
        Retour au site
      </button>

      <div className="text-center mb-12">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Logo eGame Bénin</h1>
        <p className="text-zinc-500">Version haute résolution pour capture d'écran</p>
      </div>

      <div className="bg-zinc-950 p-20 rounded-[3rem] shadow-2xl mb-10">
        <Logo size="lg" className="scale-[2.5]" />
      </div>

      <div className="max-w-md text-center text-zinc-400 text-sm">
        <p>Puisque le logo est généré par code, vous pouvez faire une capture d'écran de la zone noire ci-dessus pour obtenir l'image parfaite.</p>
      </div>
    </div>
  );
};

export default DownloadLogo;