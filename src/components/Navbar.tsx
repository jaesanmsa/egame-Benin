"use client";

import React from 'react';
import { Trophy, User, Home, Search, Bell, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-800 px-6 py-3 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="hidden md:flex items-center gap-2">
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Trophy className="text-white" size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">eGame <span className="text-violet-500">Bénin</span></span>
        </Link>

        <div className="flex items-center justify-around w-full md:w-auto md:gap-8">
          <Link to="/" className="flex flex-col items-center gap-1 text-violet-500">
            <Home size={24} />
            <span className="text-[10px] md:hidden">Accueil</span>
          </Link>
          <Link to="/search" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors">
            <Search size={24} />
            <span className="text-[10px] md:hidden">Explorer</span>
          </Link>
          <a href="mailto:support@egamebenin.com" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors">
            <Mail size={24} />
            <span className="text-[10px] md:hidden">Support</span>
          </a>
          <Link to="/profile" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors">
            <User size={24} />
            <span className="text-[10px] md:hidden">Profil</span>
          </Link>
        </div>

        <div className="hidden md:block">
          <Link to="/auth">
            <button className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-full font-medium transition-all shadow-lg shadow-violet-500/20">
              Connexion
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;