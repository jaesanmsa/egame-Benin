"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const navigate = useNavigate();
  const whatsappNumber = "2290141790790";
  const email = "egamebenin@gmail.com";

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Bonjour eGame Bénin, je souhaite obtenir des informations.");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const handleEmail = () => {
    window.location.href = `mailto:${email}?subject=Support eGame Bénin`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} />
          Retour
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-black mb-4">Contactez-nous</h1>
          <p className="text-zinc-400">Une question ? Un problème ? Notre équipe est là pour vous aider.</p>
        </div>

        <div className="space-y-6">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleWhatsApp}
            className="w-full flex items-center gap-6 p-8 bg-green-500/10 border border-green-500/20 rounded-[2rem] text-left group transition-all hover:bg-green-500/20"
          >
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <MessageSquare size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-500">WhatsApp</h3>
              <p className="text-zinc-400 text-sm">Réponse rapide par message</p>
              <p className="text-white font-mono mt-1">+{whatsappNumber}</p>
            </div>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEmail}
            className="w-full flex items-center gap-6 p-8 bg-violet-500/10 border border-violet-500/20 rounded-[2rem] text-left group transition-all hover:bg-violet-500/20"
          >
            <div className="w-16 h-16 bg-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Mail size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-violet-500">Email</h3>
              <p className="text-zinc-400 text-sm">Pour les demandes officielles</p>
              <p className="text-white font-mono mt-1">{email}</p>
            </div>
          </motion.button>
        </div>

        <div className="mt-12 p-8 bg-zinc-900/50 rounded-[2rem] border border-zinc-800 text-center">
          <p className="text-zinc-500 text-sm">
            Disponible du Lundi au Samedi <br />
            De 09h00 à 20h00
          </p>
        </div>
      </main>
    </div>
  );
};

export default Contact;