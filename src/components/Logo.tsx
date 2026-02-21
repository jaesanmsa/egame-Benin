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
    sm: { icon: 18, box: "w-8 h-8", text: "text-lg" },
    md: { icon: 24, box: "w-10 h-10", text: "text-xl" },
    lg: { icon: 40, box: "w-20 h-20", text: "text-3xl" }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${currentSize.box} bg-gradient-to-br from-violet-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 relative overflow-hidden group`}>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Trophy className="text-white relative z-10" size={currentSize.icon} />
      </div>
      
      {showText && (
        <span className={`font-black tracking-tighter text-foreground ${currentSize.text}`}>
          eGame <span className="text-violet-500">Bénin</span>
        </span>
      )}
    </div>
  );
};

export default Logo;