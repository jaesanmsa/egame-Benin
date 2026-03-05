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
  const [dbAvatar, setDbAvatar] = useState<string | null>(null);
  const [loadingAvatar, setLoadingAvatar] = useState(true);
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setUser(session?.user || null);
      if (session?.user) {
        if (session.user.user_metadata?.avatar_url) {
          setDbAvatar(session.user.user_metadata.avatar_url);
        }
        fetchProfile(session.user.id);
      } else {
        setLoadingAvatar(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setDbAvatar(null);
        setLoadingAvatar(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .maybeSingle();
    if (data?.avatar_url) {
      setDbAvatar(data.avatar_url);
    }
    setLoadingAvatar(false);
  };

  const avatarUrl = dbAvatar || user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`;

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 bg-background/90 backdrop-blur-xl border border-border px-4 py-3 rounded-[30px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] md:top-4 md:bottom-auto md:max-w-fit md:mx-auto md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        <Link to="/" className="hidden md:block">
          <Logo size="sm" />
        </Link>

        <div className="flex items-center justify-between w-full md:w-auto md:gap-8 px-2">
          <Link to="/" className={`flex flex-col items-center gap-1 flex-1 transition-colors ${isActive('/') ? 'text-violet-500' : 'text-muted-foreground hover:text-foreground'}`}>
            <Home size={22} />
            <span className="text-[9px] font-bold md:hidden">Accueil</span>
          </Link>

          <Link to="/leaderboard" className={`flex flex-col items-center gap-1 flex-1 transition-colors ${isActive('/leaderboard') ? 'text-violet-500' : 'text-muted-foreground hover:text-foreground'}`}>
            <Trophy size={22} />
            <span className="text-[9px] font-bold md:hidden">Classement</span>
          </Link>
          
          {isLoggedIn && (
            <Link to="/payments" className={`flex flex-col items-center gap-1 flex-1 transition-colors ${isActive('/payments') ? 'text-violet-500' : 'text-muted-foreground hover:text-foreground'}`}>
              <History size={22} />
              <span className="text-[9px] font-bold md:hidden">Paiements</span>
            </Link>
          )}

          <Link to="/contact" className={`flex flex-col items-center gap-1 flex-1 transition-colors ${isActive('/contact') ? 'text-violet-500' : 'text-muted-foreground hover:text-foreground'}`}>
            <HelpCircle size={22} />
            <span className="text-[9px] font-bold md:hidden">Aide</span>
          </Link>
          
          {!isLoggedIn && (
            <Link to="/auth" className={`flex flex-col items-center gap-1 flex-1 md:hidden transition-colors ${isActive('/auth') ? 'text-violet-500' : 'text-muted-foreground hover:text-foreground'}`}>
              <LogIn size={22} />
              <span className="text-[9px] font-bold">Connexion</span>
            </Link>
          )}

          <Link to="/profile" className={`flex flex-col items-center gap-1 flex-1 transition-colors ${isActive('/profile') ? 'text-violet-500' : 'text-muted-foreground hover:text-foreground'} md:hidden`}>
            {isLoggedIn ? (
              <div className={`w-6 h-6 rounded-full overflow-hidden border bg-muted ${isActive('/profile') ? 'border-violet-500' : 'border-border'}`}>
                {!loadingAvatar && <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" />}
              </div>
            ) : (
              <User size={22} />
            )}
            <span className="text-[9px] font-bold">Profil</span>
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
              <button className="bg-muted hover:bg-muted/80 text-foreground px-6 py-2 rounded-full font-medium transition-all border border-border flex items-center gap-2">
                <User size={18} />
                Mon Profil
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;