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
      <div className={`${currentSize.box} bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20`}>
        <Trophy className="text-white" size={currentSize.icon} />
      </div>
      
      {showText && (
        <span className={`font-black tracking-tighter text-foreground uppercase ${currentSize.text}`}>
          eGame <span className="text-violet-600">Bénin</span>
        </span>
      )}
    </div>
  );
};

export default Logo;