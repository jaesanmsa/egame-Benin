"use client";

import React from 'react';

const AdBanner = () => {
  return (
    <div className="w-full flex justify-center py-6 overflow-hidden">
      <div 
        id="container-c8a02fe6ab7b554a1a2cac7cef3a7a5a" 
        className="min-h-[90px] w-full max-w-[728px] bg-muted/10 rounded-xl flex items-center justify-center border border-dashed border-border/50"
      >
        {/* L'annonce s'affichera ici via le script externe */}
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-30">Espace Publicitaire</span>
      </div>
    </div>
  );
};

export default AdBanner;