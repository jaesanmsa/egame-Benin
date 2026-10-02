"use client";

import React from 'react';
import { LifeBuoy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const FloatingSupport = () => {
  const navigate = useNavigate();

  // Le support passe par la page Contact : serveurs Discord par jeu + e-mail officiel.
  const handleSupport = () => navigate('/contact');

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleSupport}
      aria-label="Besoin d'aide ? Contacte le support eGame Bénin"
      className="fixed bottom-24 right-6 z-[40] w-14 h-14 bg-violet-600 text-white rounded-full shadow-2xl shadow-violet-500/40 flex items-center justify-center md:bottom-8"
    >
      <LifeBuoy size={24} />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
    </motion.button>
  );
};

export default FloatingSupport;
