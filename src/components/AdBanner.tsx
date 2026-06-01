"use client";

import React from 'react';

const AdBanner = () => {
  return (
    <div className="w-full flex justify-center py-6 overflow-hidden">
      <div 
        className="min-h-[90px] w-full max-w-[728px] bg-muted/10 rounded-xl flex items-center justify-center border border-dashed border-border/50"
      >
        {/* Espace réservé pour Google AdSense (Auto-ads ou blocs manuels) */}
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-30">Espace Publicitaire</span>
      </div>
    </div>
  );
};

export default AdBanner;