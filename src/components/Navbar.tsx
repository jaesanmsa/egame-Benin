"use client";

import React, { useEffect, useState } from 'react';
import { User, Home, History, LogIn, Trophy, HelpCircle, Gamepad2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

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
    <nav className="fixed bottom-4 left-4 right-4 z-50 bg-background/80 backdrop-blur-xl border border-border px-6 py-3 rounded-[24px] shadow-xl md:top-4 md:bottom-auto md:max-w-2xl md:mx-auto">
      <div className="flex items-center justify-center gap-8 md:gap-12">
        <Link to="/" className={`flex flex-col items-center gap-0.5 transition-colors ${isActive('/') ? 'text-violet-500' : 'text-muted-foreground hover:text-foreground'}`}>
          <Home size={20} />
          <span className="text-[8px] font-bold md:hidden">Accueil</span>
        </Link>

        <Link to="/games" className={`flex flex-col items-center gap-0.5 transition-colors ${isActive('/games') || location.pathname.startsWith('/game/') ? 'text-violet-500' : 'text-muted-foreground hover:text-foreground'}`}>
          <Gamepad2 size={20} />
          <span className="text-[8px] font-bold md:hidden">Jeux</span>
        </Link>

        <Link to="/leaderboard" className={`flex flex-col items-center gap-0.5 transition-colors ${isActive('/leaderboard') ? 'text-violet-500' : 'text-muted-foreground hover:text-foreground'}`}>
          <Trophy size={20} />
          <span className="text-[8px] font-bold md:hidden">Classement</span>
        </Link>
        
        {isLoggedIn && (
          <Link to="/payments" className={`flex flex-col items-center gap-0.5 transition-colors ${isActive('/payments') ? 'text-violet-500' : 'text-muted-foreground hover:text-foreground'}`}>
            <History size={20} />
            <span className="text-[8px] font-bold md:hidden">Paiements</span>
          </Link>
        )}

        <Link to="/profile" className={`flex flex-col items-center gap-0.5 transition-colors ${isActive('/profile') ? 'text-violet-500' : 'text-muted-foreground hover:text-foreground'}`}>
          {isLoggedIn ? (
            <div className={`w-5 h-5 rounded-full overflow-hidden border bg-muted ${isActive('/profile') ? 'border-violet-500' : 'border-border'}`}>
              {!loadingAvatar && <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" />}
            </div>
          ) : (
            <User size={20} />
          )}
          <span className="text-[8px] font-bold md:hidden">Profil</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;