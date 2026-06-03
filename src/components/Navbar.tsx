"use client";

import React, { useEffect, useState } from 'react';
import { User, Home, Trophy, Gamepad2, Newspaper } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const Navbar = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

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

  const iconProps = (path: string) => ({
    size: 22,
    strokeWidth: 2,
    className: isActive(path) ? "text-violet-500" : "text-muted-foreground hover:text-violet-500 transition-colors"
  });

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 bg-background/80 backdrop-blur-xl border border-border px-6 py-4 rounded-[24px] shadow-xl md:top-4 md:bottom-auto md:max-w-3xl md:mx-auto">
      <div className="flex items-center justify-center gap-8 md:gap-12">
        <Link to="/" className="flex flex-col items-center gap-1">
          <Home {...iconProps('/')} />
          <span className={`text-[8px] font-black uppercase tracking-widest ${isActive('/') && location.pathname === '/' ? 'text-violet-500' : 'text-muted-foreground'}`}>Accueil</span>
        </Link>

        <Link to="/jeux" className="flex flex-col items-center gap-1">
          <Gamepad2 {...iconProps('/jeux')} />
          <span className={`text-[8px] font-black uppercase tracking-widest ${isActive('/jeux') ? 'text-violet-500' : 'text-muted-foreground'}`}>Jeux</span>
        </Link>

        <Link to="/news" className="flex flex-col items-center gap-1">
          <Newspaper {...iconProps('/news')} />
          <span className={`text-[8px] font-black uppercase tracking-widest ${isActive('/news') ? 'text-violet-500' : 'text-muted-foreground'}`}>Actus</span>
        </Link>

        <Link to="/classement" className="flex flex-col items-center gap-1">
          <Trophy {...iconProps('/classement')} />
          <span className={`text-[8px] font-black uppercase tracking-widest ${isActive('/classement') ? 'text-violet-500' : 'text-muted-foreground'}`}>Elite</span>
        </Link>

        <Link to="/profil" className="flex flex-col items-center gap-1">
          <User {...iconProps('/profil')} />
          <span className={`text-[8px] font-black uppercase tracking-widest ${isActive('/profil') ? 'text-violet-500' : 'text-muted-foreground'}`}>Profil</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;