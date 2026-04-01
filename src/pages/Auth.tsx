"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Chrome, UserPlus, LogIn, AtSign, Shield } from 'lucide-react';
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
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 bg-card p-10 rounded-[2.5rem] border border-border shadow-2xl text-center">
          <div className="w-20 h-20 bg-violet-600/10 rounded-full flex items-center justify-center mx-auto mb-6"><Mail size={40} className="text-violet-500" /></div>
          <h1 className="text-3xl font-black">Vérifiez vos mails</h1>
          <p className="text-muted-foreground">Un lien de confirmation a été envoyé à <span className="text-foreground font-bold">{email}</span>.</p>
          <Button onClick={() => setIsEmailSent(false)} variant="outline" className="w-full py-6 rounded-xl border-border">Retour à la connexion</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-[2.5rem] border border-border shadow-2xl">
        <div className="text-center">
          <Link to="/" className="inline-block mb-4"><Logo size="lg" showText={false} /></Link>
          <h1 className="text-3xl font-black">eGame <span className="text-violet-500">Bénin</span></h1>
          <p className="text-muted-foreground mt-2">{isLogin ? "Connectez-vous pour rejoindre l'arène" : "Créez votre compte de joueur"}</p>
        </div>

        <div className="space-y-4">
          <Button onClick={handleGoogleLogin} variant="outline" className="w-full py-6 rounded-xl border-border bg-muted/50 hover:bg-muted text-foreground gap-3"><Chrome size={20} /> Continuer avec Google</Button>
          <div className="relative py-4"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Ou par email</span></div></div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Pseudo Unique</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-3 text-muted-foreground" size={18} />
                  <Input id="username" placeholder="Ex: ProGamer229" className="pl-10 bg-muted border-border rounded-xl" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input id="email" type="email" placeholder="votre@email.com" className="pl-10 bg-muted border-border rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><Label htmlFor="password">Mot de passe</Label>{isLogin && <Link to="/forgot-password" className="text-xs text-violet-400 hover:underline">Oublié ?</Link>}</div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input id="password" type="password" placeholder="••••••••" className="pl-10 bg-muted border-border rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full py-6 rounded-xl bg-violet-600 hover:bg-violet-700 font-bold gap-2 text-white">
              {loading ? "Chargement..." : (isLogin ? <><LogIn size={18} /> Se connecter</> : <><UserPlus size={18} /> S'inscrire</>)}
            </Button>
          </form>
        </div>
        <p className="text-center text-muted-foreground text-sm">{isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}<button onClick={() => setIsLogin(!isLogin)} className="text-violet-400 font-bold hover:underline ml-1">{isLogin ? "S'inscrire" : "Se connecter"}</button></p>
      </div>
    </div>
  );
};

export default Auth;