"use client";

import React, { useEffect, useState } from 'react';
import { Trophy, User, Home, History, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const Navbar = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
          <Link to="/" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/') ? 'text-violet-500' : 'text-zinc-400 hover:text-white'}`}>
            <Home size={24} />
            <span className="text-[10px] md:hidden">Accueil</span>
          </Link>
          
          {isLoggedIn && (
            <Link to="/payments" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/payments') ? 'text-violet-500' : 'text-zinc-400 hover:text-white'}`}>
              <History size={24} />
              <span className="text-[10px] md:hidden">Historique</span>
            </Link>
          )}
          
          {!isLoggedIn && (
            <Link to="/auth" className={`flex flex-col items-center gap-1 md:hidden transition-colors ${isActive('/auth') ? 'text-violet-500' : 'text-zinc-400 hover:text-white'}`}>
              <LogIn size={24} />
              <span className="text-[10px]">Connexion</span>
            </Link>
          )}

          <Link to="/profile" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/profile') ? 'text-violet-500' : 'text-zinc-400 hover:text-white'}`}>
            <User size={24} />
            <span className="text-[10px] md:hidden">Profil</span>
          </Link>
        </div>

        <div className="hidden md:block">
          {!isLoggedIn ? (
            <Link to="/auth">
              <button className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-full font-medium transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2">
                <LogIn size={18} />
                Connexion
              </button>
            </Link>
          ) : (
            <Link to="/profile">
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:border-violet-500 transition-colors">
                <User size={20} className="text-zinc-400" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;