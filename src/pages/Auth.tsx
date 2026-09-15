"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import PhoneCountryInput, { setPhoneCountry } from '@/components/PhoneCountryInput';
import { AFRICAN_COUNTRIES, getCountryByCode } from '@/lib/countries';
import { Mail, Lock, UserPlus, LogIn, AtSign, ArrowLeft, Globe, Zap } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import Logo from '@/components/Logo';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('BJ');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const getRedirectUrl = () => {
    let url = window.location.origin;
    return url.endsWith('/') ? url.slice(0, -1) : url;
  };

  const handleResendEmail = async () => {
    setResending(true);
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: getRedirectUrl() }
    });
    if (resendError) showError(resendError.message);
    else showSuccess("Nouveau lien de confirmation envoyé !");
    setResending(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getRedirectUrl() }
    });
    if (error) showError(error.message);
  };

  // Change de pays et aligne automatiquement l'indicatif du numéro saisi.
  const handleCountryChange = (code: string) => {
    setCountry(code);
    setPhone((prev) => setPhoneCountry(prev, code));
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
          data: { username: cleanUsername, full_name: cleanUsername, country, phone }
        }
      });
      
      if (error) showError(error.message);
      else if (data.user && data.session === null) {
        if (data.user.email_confirmed_at) {
          // Un compte confirmé existe déjà avec cet e-mail : aucun lien n'est envoyé par Supabase.
          showSuccess("Un compte existe déjà avec cet e-mail. Connecte-toi directement.");
          setIsLogin(true);
        } else {
          setIsEmailSent(true);
        }
      }
      else {
        showSuccess("Compte créé !");
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-[#07070C] text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 glass-panel p-10 text-center">
          <div className="w-20 h-20 bg-[#8A2BE2]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#8A2BE2]">
            <Mail size={40} />
          </div>
          <h1 className="text-2xl font-gaming font-black">Vérifiez vos mails</h1>
          <p className="text-[#8888AA] text-sm leading-relaxed">Un lien de confirmation a été envoyé à <span className="text-white font-bold">{email}</span>.</p>
          <p className="text-[10px] text-[#8888AA]/70 leading-relaxed">
            Pense à vérifier ton dossier spam ou promotions (expéditeur : noreply@mail.app.supabase.io).
          </p>
          <div className="space-y-3 pt-2">
            <button onClick={handleResendEmail} disabled={resending} className="w-full btn-neon py-4 text-xs tracking-widest uppercase">
              {resending ? "Envoi en cours..." : "Renvoyer le lien de confirmation"}
            </button>
            <button onClick={() => setIsEmailSent(false)} className="w-full text-xs font-gaming font-bold uppercase tracking-widest text-[#8888AA] hover:text-white py-2">
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070C] text-white flex flex-col items-center justify-center p-6 relative">
      <Link 
        to="/" 
        className="fixed top-6 left-6 z-[1000] flex items-center gap-2 text-[#8888AA] hover:text-white transition-all bg-[#0F0F1E]/80 px-4 py-2 rounded-full border border-[#8A2BE2]/30 text-xs font-gaming font-bold uppercase tracking-wider"
      >
        <ArrowLeft size={16} /> Accueil
      </Link>

      <div className="w-full max-w-md space-y-8 glass-panel p-8">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block mb-2"><Logo size="lg" showText={false} /></Link>
          <h1 className="text-3xl font-gaming font-black uppercase">
            eGame <span className="text-[#8A2BE2]">Bénin</span>
          </h1>
          <p className="text-xs text-[#8888AA] font-esport uppercase tracking-wider">
            {isLogin ? "Accède à ton espace joueur" : "Inscris-toi sur la plateforme"}
          </p>
        </div>

        <div className="space-y-4">
          {/* Google : option recommandée — inscription instantanée, aucun e-mail de confirmation */}
          <div className="relative">
            <span className="absolute -top-2.5 right-4 z-10 bg-[#FFD700] text-[#07070C] text-[9px] font-gaming font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border-2 border-[#0F0F1E] pointer-events-none">
              Recommandé
            </span>
            <button
              onClick={handleGoogleLogin}
              className="w-full py-4 rounded-2xl bg-white text-[#07070C] hover:bg-gray-100 border-2 border-[#8A2BE2]/60 shadow-xl shadow-[#8A2BE2]/25 active:scale-[0.99] transition-all font-gaming text-xs font-black uppercase tracking-wider flex items-center justify-center gap-3"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuer avec Google
            </button>
          </div>

          {!isLogin && (
            <p className="text-center text-[10px] font-bold text-emerald-400 flex items-center justify-center gap-1.5">
              <Zap size={11} className="text-[#FFD700]" />
              Accès instantané — aucun e-mail de confirmation à attendre
            </p>
          )}

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
                  <Input id="username" placeholder="Ex: ProGamer229" className="pl-10 bg-[#07070C] border-[#8A2BE2]/30 rounded-xl text-white font-medium" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="country" className="text-xs font-gaming uppercase text-[#8888AA]">Pays</Label>
                <Select value={country} onValueChange={handleCountryChange}>
                  <SelectTrigger id="country" className="bg-[#07070C] border-[#8A2BE2]/30 rounded-xl text-white font-medium">
                    <span className="flex items-center gap-2 text-sm w-full">
                      <Globe size={16} className="text-[#8A2BE2] shrink-0" />
                      {getCountryByCode(country)
                        ? `${getCountryByCode(country)!.flag} ${getCountryByCode(country)!.name}`
                        : '🌍 Choisis ton pays'}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F0F1E] border-[#8A2BE2]/40 text-white max-h-80">
                    {AFRICAN_COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code} className="text-xs">
                        {c.flag} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-gaming uppercase text-[#8888AA]">Numéro Mobile Money</Label>
                <PhoneCountryInput
                  id="phone"
                  value={phone}
                  onChange={setPhone}
                  defaultCountryCode={country}
                />
              </div>
            )}
            
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-gaming uppercase text-[#8888AA]">Adresse E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-[#8888AA]" size={18} />
                <Input id="email" type="email" placeholder="votre@email.com" className="pl-10 bg-[#07070C] border-[#8A2BE2]/30 rounded-xl text-white font-medium" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-gaming uppercase text-[#8888AA]">Mot de passe</Label>
                {isLogin && <Link to="/forgot-password" className="text-[10px] text-[#A855F7] hover:underline font-gaming">Oublié ?</Link>}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-[#8888AA]" size={18} />
                <Input id="password" type="password" placeholder="••••••••" className="pl-10 bg-[#07070C] border-[#8A2BE2]/30 rounded-xl text-white font-medium" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-neon py-4 text-xs tracking-widest uppercase flex items-center justify-center gap-2">
              {loading ? "Chargement..." : (isLogin ? <><LogIn size={18} /> Se connecter</> : <><UserPlus size={18} /> S'inscrire</>)}
            </button>
          </form>
        </div>

        <p className="text-center text-[#8888AA] text-xs font-esport">
          {isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?"}
          <button onClick={() => setIsLogin(!isLogin)} className="text-[#FFD700] font-bold hover:underline ml-1">
            {isLogin ? "Créer un compte" : "Se connecter"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;