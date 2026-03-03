"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, CreditCard, MessageSquare, Trophy, X } from 'lucide-react';

interface NewUserGuideProps {
  onClose: () => void;
}

const NewUserGuide = ({ onClose }: NewUserGuideProps) => {
  const steps = [
    {
      icon: <Gamepad2 className="text-violet-500" size={24} />,
      title: "1. Choisis ton jeu",
      desc: "Parcours les tournois actifs et sélectionne celui qui te correspond."
    },
    {
      icon: <CreditCard className="text-cyan-500" size={24} />,
      title: "2. Inscris-toi",
      desc: "Paye tes frais d'entrée via MTN ou Moov Money en toute sécurité."
    },
    {
      icon: <MessageSquare className="text-green-500" size={24} />,
      title: "3. Valide ton code",
      desc: "Envoie ton code de validation au support WhatsApp pour confirmer."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-violet-600/5 border border-violet-500/20 rounded-[2.5rem] p-8 mb-10 relative overflow-hidden"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground bg-muted/50 rounded-full transition-colors"
      >
        <X size={18} />
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
          <Trophy size={20} />
        </div>
        <h2 className="text-xl font-black">Guide du Champion</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <div key={i} className="space-y-3">
            <div className="w-12 h-12 bg-card border border-border rounded-2xl flex items-center justify-center shadow-sm">
              {step.icon}
            </div>
            <h3 className="font-bold text-sm">{step.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-violet-500/10 flex items-center justify-between">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Besoin d'aide ?</p>
        <a 
          href="/contact" 
          className="text-[10px] font-black text-violet-500 uppercase tracking-widest hover:underline"
        >
          Contacter le support →
        </a>
      </div>
    </motion.div>
  );
};

export default NewUserGuide;