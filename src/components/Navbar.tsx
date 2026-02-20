"use client";

import React, { useEffect, useState } from 'react';
import { User, Home, History, LogIn, Trophy, HelpCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Logo from './Logo';

const Navbar = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const avatarUrl = user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border px-6 py-3 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="hidden md:block">
          <Logo size="sm" />
        </Link>

        <div className="flex items-center justify-around w-full md:w-auto md:gap-8">
          <Link to="/" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/') ? 'text-violet-500' : 'text-muted-foreground hover:text-foreground'}`}>
            <Home size={24} />
            <span className="text-[10px] md:hidden">Accueil</span>
          </Link>

          <Link to="/leaderboard" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/leaderboard') ? 'text-violet-500' : 'text-muted-foreground hover:text-foreground'}`}>
            <Trophy size={24} />
            <span className="text-[10px] md:hidden">Classement</span>
          </Link>
          
          {isLoggedIn && (
            <Link to="/payments" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/payments') ? 'text-violet-500' : 'text-muted-foreground hover:text-foreground'}`}>
              <History size={24} />
              <span className="text-[10px] md:hidden">Historique</span>
            </Link>
          )}

          <Link to="/contact" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/contact') ? 'text-violet-500' : 'text-muted-foreground hover:text-foreground'}`}>
            <HelpCircle size={24} />
            <span className="text-[10px] md:hidden">Aide</span>
          </Link>
          
          {!isLoggedIn && (
            <Link to="/auth" className={`flex flex-col items-center gap-1 md:hidden transition-colors ${isActive('/auth') ? 'text-violet-500' : 'text-muted-foreground hover:text-foreground'}`}>
              <LogIn size={24} />
              <span className="text-[10px]">Connexion</span>
            </Link>
          )}

          <Link to="/profile" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/profile') ? 'text-violet-500' : 'text-muted-foreground hover:text-foreground'}`}>
            {isLoggedIn ? (
              <div className={`w-6 h-6 rounded-full overflow-hidden border ${isActive('/profile') ? 'border-violet-500' : 'border-border'}`}>
                <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" />
              </div>
            ) : (
              <User size={24} />
            )}
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
              <div className="w-10 h-10 rounded-full bg-muted border border-border overflow-hidden hover:border-violet-500 transition-colors">
                <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;