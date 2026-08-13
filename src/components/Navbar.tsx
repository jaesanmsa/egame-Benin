"use client";

import React, { useEffect, useState } from 'react';
import { User, Home, Trophy, Gamepad2, Newspaper, Info, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Logo from './Logo';

const Navbar = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setUser(session?.user || null);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      {/* NAVBAR DESKTOP (Flottante en haut) */}
      <header className="hidden md:flex fixed top-4 left-6 right-6 z-50 max-w-6xl mx-auto items-center justify-between bg-[#0F0F1E]/90 backdrop-blur-xl border border-[#8A2BE2]/30 px-8 py-3.5 rounded-full shadow-2xl shadow-[#8A2BE2]/10">
        <Link to="/" className="flex items-center gap-3">
          <Logo size="sm" showText={true} />
        </Link>

        <nav className="flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-xs font-bold uppercase tracking-widest font-gaming transition-colors ${
              isActive('/') ? 'text-[#8A2BE2] text-glow-violet' : 'text-[#8888AA] hover:text-white'
            }`}
          >
            Accueil
          </Link>
          <Link 
            to="/jeux" 
            className={`text-xs font-bold uppercase tracking-widest font-gaming transition-colors ${
              isActive('/jeux') ? 'text-[#8A2BE2] text-glow-violet' : 'text-[#8888AA] hover:text-white'
            }`}
          >
            Jeux
          </Link>
          <Link 
            to="/classement" 
            className={`text-xs font-bold uppercase tracking-widest font-gaming transition-colors ${
              isActive('/classement') ? 'text-[#8A2BE2] text-glow-violet' : 'text-[#8888AA] hover:text-white'
            }`}
          >
            Classement
          </Link>
          <Link 
            to="/news" 
            className={`text-xs font-bold uppercase tracking-widest font-gaming transition-colors ${
              isActive('/news') ? 'text-[#8A2BE2] text-glow-violet' : 'text-[#8888AA] hover:text-white'
            }`}
          >
            Actualités
          </Link>
          <Link 
            to="/about" 
            className={`text-xs font-bold uppercase tracking-widest font-gaming transition-colors ${
              isActive('/about') ? 'text-[#8A2BE2] text-glow-violet' : 'text-[#8888AA] hover:text-white'
            }`}
          >
            À propos
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link 
              to="/profil" 
              className="flex items-center gap-2 bg-[#8A2BE2]/20 border border-[#8A2BE2]/50 hover:bg-[#8A2BE2] px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md shadow-[#8A2BE2]/20"
            >
              <User size={15} />
              Mon Profil
            </Link>
          ) : (
            <Link 
              to="/auth" 
              className="btn-glow-border px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <LogIn size={15} />
              Connexion
            </Link>
          )}
        </div>
      </header>

      {/* NAVBAR MOBILE (Flottante en bas avec border-radius 30px) */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-[#0F0F1E]/95 backdrop-blur-xl border border-[#8A2BE2]/40 px-6 py-3.5 rounded-[30px] shadow-2xl shadow-black/80">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex flex-col items-center gap-1">
            <Home size={20} className={isActive('/') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'} />
            <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive('/') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'}`}>Accueil</span>
          </Link>

          <Link to="/jeux" className="flex flex-col items-center gap-1">
            <Gamepad2 size={20} className={isActive('/jeux') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'} />
            <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive('/jeux') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'}`}>Jeux</span>
          </Link>

          <Link to="/classement" className="flex flex-col items-center gap-1">
            <Trophy size={20} className={isActive('/classement') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'} />
            <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive('/classement') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'}`}>Élite</span>
          </Link>

          <Link to="/news" className="flex flex-col items-center gap-1">
            <Newspaper size={20} className={isActive('/news') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'} />
            <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive('/news') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'}`}>Actus</span>
          </Link>

          <Link to={isLoggedIn ? "/profil" : "/auth"} className="flex flex-col items-center gap-1">
            <User size={20} className={isActive('/profil') || isActive('/auth') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'} />
            <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive('/profil') || isActive('/auth') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'}`}>
              {isLoggedIn ? 'Profil' : 'Accès'}
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Navbar;