"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trophy, Mail, Lock, Chrome, UserPlus, LogIn } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });
    if (error) showError(error.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        showError("Erreur de connexion. Vérifiez vos identifiants.");
      } else {
        showSuccess("Bienvenue sur eGame Bénin !");
        navigate('/');
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        showError(error.message);
      } else {
        showSuccess("Compte créé avec succès !");
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
              <Trophy className="text-white" size={32} />
            </div>
          </Link>
          <h1 className="text-3xl font-black text-white">eGame <span className="text-violet-500">Bénin</span></h1>
          <p className="text-zinc-400 mt-2">
            {isLogin ? "Connectez-vous pour rejoindre l'arène" : "Créez votre compte de joueur"}
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleGoogleLogin}
            variant="outline" 
            className="w-full py-6 rounded-xl border-zinc-800 bg-zinc-800/50 hover:bg-zinc-800 text-white gap-3"
          >
            <Chrome size={20} />
            Continuer avec Google
          </Button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-800"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-zinc-900 px-2 text-zinc-500">Ou par email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-zinc-500" size={18} />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="votre@email.com" 
                  className="pl-10 bg-zinc-800 border-zinc-700 rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                {isLogin && <Link to="/forgot-password" size="sm" className="text-xs text-violet-400 hover:underline">Oublié ?</Link>}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-zinc-500" size={18} />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 bg-zinc-800 border-zinc-700 rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full py-6 rounded-xl bg-violet-600 hover:bg-violet-700 font-bold gap-2">
              {loading ? "Chargement..." : (isLogin ? <><LogIn size={18} /> Se connecter</> : <><UserPlus size={18} /> S'inscrire</>)}
            </Button>
          </form>
        </div>

        <p className="text-center text-zinc-500 text-sm">
          {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"} 
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-violet-400 font-bold hover:underline ml-1"
          >
            {isLogin ? "S'inscrire" : "Se connecter"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;