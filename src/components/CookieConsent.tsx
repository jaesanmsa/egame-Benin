"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('egame-cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (granted: boolean) => {
    const status = granted ? 'granted' : 'denied';
    
    // Update Google Consent Mode
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'ad_storage': status,
        'ad_user_data': status,
        'ad_personalization': status,
        'analytics_storage': status
      });
    }

    localStorage.setItem('egame-cookie-consent', status);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:max-w-md z-[100]"
        >
          <div className="bg-[#121212] border border-violet-500/30 rounded-[2rem] p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center text-violet-500 shrink-0">
                <Cookie size={20} />
              </div>
              <div className="space-y-4">
                <p className="text-white text-xs font-medium leading-relaxed">
                  Nous utilisons des cookies pour améliorer ton expérience et te proposer des publicités pertinentes. Acceptes-tu leur utilisation ?
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => handleConsent(true)}
                    className="flex-1 bg-[#8A2BE2] hover:bg-[#7B1FA2] text-white text-[10px] font-black uppercase tracking-widest h-10 rounded-xl"
                  >
                    Accepter
                  </Button>
                  <Button
                    onClick={() => handleConsent(false)}
                    variant="outline"
                    className="flex-1 border-[#8A2BE2] text-[#8A2BE2] hover:bg-[#8A2BE2]/10 bg-transparent text-[10px] font-black uppercase tracking-widest h-10 rounded-xl"
                  >
                    Refuser
                  </Button>
                </div>
              </div>
              <button 
                onClick={() => setIsVisible(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;