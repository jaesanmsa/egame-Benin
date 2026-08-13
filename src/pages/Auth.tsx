"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Chrome, UserPlus, LogIn, AtSign, ArrowLeft } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import Logo from '@/components/Logo';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const navigate = useNavigate();

  const getRedirectUrl = () => {
    let url = window.location.origin;
    return url.endsWith('/') ? url.slice(0, -1) : url;
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getRedirectUrl() }
    });
    if (error) showError(error.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const cleanEmail = email.trim().toLowerCase();
    
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) showError(error.message);
      else {
        showSuccess("Connexion réussie !");
        navigate('/');
      }
    } else {
      const cleanUsername = username.trim();
      if (cleanUsername.length < 3) {
        showError("Le pseudo doit faire au moins 3 caractères.");
        setLoading(false);
        return;
      }

      const { error, data } = await supabase.auth.signUp({ 
        email: cleanEmail, 
        password,
        options: {
          emailRedirectTo: getRedirectUrl(),
          data: { username: cleanUsername, full_name: cleanUsername }
        }
      });
      
      if (error) showError(error.message);
      else if (data.user && data.session === null) setIsEmailSent(true);
      else {
        showSuccess("Compte créé !");
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 bg-[#0F0F1E] p-10 rounded-3xl border border-[#8A2BE2]/40 shadow-2xl text-center">
          <div className="w-20 h-20 bg-[#8A2BE2]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#8A2BE2]">
            <Mail size={40} />
          </div>
          <h1 className="text-2xl font-gaming font-black">Vérifiez vos mails</h1>
          <p className="text-[#8888AA] text-sm leading-relaxed">Un lien de confirmation a été envoyé à <span className="text-white font-bold">{email}</span>.</p>
          <button onClick={() => setIsEmailSent(false)} className="w-full btn-glow-border py-4 text-xs tracking-widest uppercase">
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-center p-6 relative">
      <Link 
        to="/" 
        className="fixed top-6 left-6 z-[1000] flex items-center gap-2 text-[#8888AA] hover:text-white transition-all bg-[#0F0F1E]/80 px-4 py-2 rounded-full border border-[#8A2BE2]/30 text-xs font-gaming font-bold uppercase tracking-wider"
      >
        <ArrowLeft size={16} /> Accueil
      </Link>

      <div className="w-full max-w-md space-y-8 bg-[#0F0F1E] p-8 rounded-3xl border border-[#8A2BE2]/30 shadow-2xl">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block mb-2"><Logo size="lg" showText={false} /></Link>
          <h1 className="text-3xl font-gaming font-black uppercase">
            eGame <span className="text-[#8A2BE2]">Bénin</span>
          </h1>
          <p className="text-xs text-[#8888AA] font-esport uppercase tracking-wider">
            {isLogin ? "Connecte-toi pour entrer dans l'arène" : "Crée ton compte de joueur écosystème"}
          </p>
        </div>

        <div className="space-y-4">
          <button onClick={handleGoogleLogin} className="w-full py-4 rounded-xl border border-[#8A2BE2]/30 bg-[#0A0A0F] hover:bg-[#8A2BE2]/10 text-white font-gaming text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors">
            <Chrome size={18} /> Continuer avec Google
          </button>
          
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#8A2BE2]/20"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-gaming"><span className="bg-[#0F0F1E] px-3 text-[#8888AA]">Ou par e-mail</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-gaming uppercase text-[#8888AA]">Pseudo de Joueur</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-3 text-[#8888AA]" size={18} />
                  <Input id="username" placeholder="Ex: ProGamer229" className="pl-10 bg-[#0A0A0F] border-[#8A2BE2]/30 rounded-xl text-white font-medium" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
              </div>
            )}
            
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-gaming uppercase text-[#8888AA]">Adresse E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-[#8888AA]" size={18} />
                <Input id="email" type="email" placeholder="votre@email.com" className="pl-10 bg-[#0A0A0F] border-[#8A2BE2]/30 rounded-xl text-white font-medium" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-gaming uppercase text-[#8888AA]">Mot de passe</Label>
                {isLogin && <Link to="/forgot-password" className="text-[10px] text-[#A855F7] hover:underline font-gaming">Oublié ?</Link>}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-[#8888AA]" size={18} />
                <Input id="password" type="password" placeholder="••••••••" className="pl-10 bg-[#0A0A0F] border-[#8A2BE2]/30 rounded-xl text-white font-medium" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-glow-border py-4 text-xs tracking-widest uppercase flex items-center justify-center gap-2">
              {loading ? "Chargement..." : (isLogin ? <><LogIn size={18} /> Se connecter</> : <><UserPlus size={18} /> S'inscrire</>)}
            </button>
          </form>
        </div>

        <p className="text-center text-[#8888AA] text-xs font-esport">
          {isLogin ? "Pas encore inscrit ?" : "Déjà un compte ?"}
          <button onClick={() => setIsLogin(!isLogin)} className="text-[#FFD700] font-bold hover:underline ml-1">
            {isLogin ? "Créer un compte" : "Se connecter"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;