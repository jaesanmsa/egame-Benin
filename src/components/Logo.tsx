"use client";

import React from 'react';
import { Trophy } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo = ({ className = "", size = 'md', showText = true }: LogoProps) => {
  const sizes = {
    sm: { icon: 18, box: "w-8 h-8", text: "text-base" },
    md: { icon: 22, box: "w-10 h-10", text: "text-lg" },
    lg: { icon: 36, box: "w-16 h-16", text: "text-2xl" }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${currentSize.box} bg-[#8A2BE2]/15 border border-[#8A2BE2]/50 rounded-2xl flex items-center justify-center shadow-lg shadow-[#8A2BE2]/20`}>
        <Trophy className="text-[#8A2BE2]" size={currentSize.icon} strokeWidth={2.5} />
      </div>
      
      {showText && (
        <span className={`font-gaming font-black uppercase tracking-wider text-white ${currentSize.text}`}>
          eGame <span className="text-[#8A2BE2]">Bénin</span>
        </span>
      )}
    </div>
  );
};

export default Logo;