"use client";

import React, { useEffect, useState } from 'react';
import { User, Home, Trophy, Newspaper, LogIn, ChevronDown, CreditCard, Settings, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Logo from './Logo';
import InstallAndProfileReminder from './InstallAndProfileReminder';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = !!user;
  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate('/');
  };

  const linkClass = (path: string) => `text-xs font-bold uppercase tracking-widest font-gaming transition-all ${
    isActive(path) ? 'text-[#8A2BE2] text-glow-violet' : 'text-[#8888AA] hover:text-white'
  }`;

  const accountMenu = (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-[#8A2BE2]/50 bg-[#8A2BE2]/20 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#8A2BE2]/20 transition-all hover:bg-[#8A2BE2]"
      >
        <User size={15} /><span>Mon compte</span><ChevronDown size={14} />
      </button>
      {menuOpen && (
        <div role="menu" className="absolute right-0 top-full z-[70] mt-3 w-56 rounded-2xl border border-[#8A2BE2]/40 bg-[#0F0F1E] p-2 shadow-2xl">
          <Link role="menuitem" to="/profil" className="flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold text-white hover:bg-[#8A2BE2]/15"><User size={15} className="text-[#A855F7]" /> Mon profil</Link>
          <Link role="menuitem" to="/payments" className="flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold text-white hover:bg-[#8A2BE2]/15"><CreditCard size={15} className="text-[#A855F7]" /> Mes inscriptions</Link>
          <Link role="menuitem" to="/profil#recompenses" className="flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold text-white hover:bg-[#8A2BE2]/15"><Trophy size={15} className="text-[#A855F7]" /> Mes points</Link>
          <Link role="menuitem" to="/edit-profile" className="flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold text-white hover:bg-[#8A2BE2]/15"><Settings size={15} className="text-[#A855F7]" /> Paramètres</Link>
          <button role="menuitem" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10"><LogOut size={15} /> Déconnexion</button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <InstallAndProfileReminder />
      {/* NAVBAR DESKTOP */}
      <header className="hidden lg:flex fixed top-4 left-6 right-6 z-50 max-w-6xl mx-auto items-center justify-between gap-5 bg-[#0F0F1E]/90 backdrop-blur-2xl border border-[#8A2BE2]/30 px-6 xl:px-8 py-3.5 rounded-full shadow-2xl shadow-[#8A2BE2]/10">
        <Link to="/" className="flex items-center gap-3 shrink-0"><Logo size="sm" showText /></Link>
        <nav className="flex min-w-0 items-center justify-center gap-5 xl:gap-7">
          <Link to="/" className={linkClass('/')}>Accueil</Link>
          <Link to="/jeux" className={linkClass('/jeux')}>Tournois</Link>
          <Link to="/classement" className={linkClass('/classement')}>Classement</Link>
          <Link to="/news" className={linkClass('/news')}>Actualités</Link>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          {isLoggedIn ? accountMenu : (
            <div className="flex items-center gap-2">
              <Link to="/auth" className="text-xs font-gaming font-bold uppercase tracking-wider text-[#8888AA] hover:text-white px-3 py-2">Connexion</Link>
              <Link to="/auth?mode=signup" className="btn-neon px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider">Créer un compte</Link>
            </div>
          )}
        </div>
      </header>

      {/* NAVBAR TABLETTE */}
      <header className="hidden md:flex lg:hidden fixed top-3 left-4 right-4 z-50 items-center justify-between gap-3 bg-[#0F0F1E]/90 backdrop-blur-2xl border border-[#8A2BE2]/30 px-4 py-3 rounded-2xl shadow-xl">
        <Link to="/" className="shrink-0"><Logo size="sm" showText={false} /></Link>
        <nav className="flex min-w-0 items-center gap-3">
          <Link to="/" className={linkClass('/')}>Accueil</Link>
          <Link to="/jeux" className={linkClass('/jeux')}>Tournois</Link>
          <Link to="/classement" className={linkClass('/classement')}>Classement</Link>
          <Link to="/news" className={linkClass('/news')}>Actualités</Link>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          {isLoggedIn ? accountMenu : <Link to="/auth" className="btn-neon px-4 py-2 rounded-full text-[10px] font-bold uppercase">Connexion</Link>}
        </div>
      </header>

      {/* Sélecteur de langue + navigation mobile */}
      <div className="md:hidden fixed top-3 right-3 z-50 rounded-full border border-[#8A2BE2]/30 bg-[#0F0F1E]/90 p-1 backdrop-blur-xl">
        <LanguageSwitcher />
      </div>
      <nav className="md:hidden fixed bottom-4 left-3 right-3 z-50 rounded-[28px] border border-[#8A2BE2]/40 bg-[#0F0F1E]/95 px-2 py-3 shadow-2xl shadow-black/90 backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-1">
          <Link to="/" className="flex min-w-0 flex-1 flex-col items-center gap-1"><Home size={19} className={isActive('/') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'} /><span className={`text-[8px] font-bold uppercase tracking-wide ${isActive('/') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'}`}>Accueil</span></Link>
          <Link to="/jeux" className="flex min-w-0 flex-1 flex-col items-center gap-1"><Trophy size={19} className={isActive('/jeux') || isActive('/game') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'} /><span className={`text-[8px] font-bold uppercase tracking-wide ${isActive('/jeux') || isActive('/game') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'}`}>Tournois</span></Link>
          <Link to="/classement" className="flex min-w-0 flex-1 flex-col items-center gap-1"><Trophy size={19} className={isActive('/classement') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'} /><span className={`text-[8px] font-bold uppercase tracking-wide ${isActive('/classement') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'}`}>Classement</span></Link>
          <Link to="/news" className="flex min-w-0 flex-1 flex-col items-center gap-1"><Newspaper size={19} className={isActive('/news') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'} /><span className={`text-[8px] font-bold uppercase tracking-wide ${isActive('/news') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'}`}>Actualités</span></Link>
          {isLoggedIn ? (
            <button onClick={() => navigate('/profil')} className="flex min-w-0 flex-1 flex-col items-center gap-1"><User size={19} className={isActive('/profil') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'} /><span className={`text-[8px] font-bold uppercase tracking-wide ${isActive('/profil') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'}`}>Compte</span></button>
          ) : (
            <Link to="/auth" className="flex min-w-0 flex-1 flex-col items-center gap-1"><LogIn size={19} className={isActive('/auth') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'} /><span className={`text-[8px] font-bold uppercase tracking-wide ${isActive('/auth') ? 'text-[#8A2BE2]' : 'text-[#8888AA]'}`}>Connexion</span></Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
