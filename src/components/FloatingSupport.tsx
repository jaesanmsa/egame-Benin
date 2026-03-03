"use client";

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const FloatingSupport = () => {
  const whatsappNumber = "2290141790790";

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Bonjour eGame Bénin, j'ai besoin d'aide sur la plateforme.");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleWhatsApp}
      className="fixed bottom-24 right-6 z-[40] w-14 h-14 bg-green-500 text-white rounded-full shadow-2xl shadow-green-500/40 flex items-center justify-center md:bottom-8"
    >
      <MessageSquare size={24} />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
    </motion.button>
  );
};

export default FloatingSupport;