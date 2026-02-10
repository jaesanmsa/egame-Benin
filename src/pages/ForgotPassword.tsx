"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { showError, showSuccess } from '@/utils/toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      showError(error.message);
    } else {
      showSuccess("Email de récupération envoyé !");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl">
        <Link to="/auth" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
          Retour
        </Link>
        
        <div className="text-center">
          <h1 className="text-3xl font-black text-white">Mot de passe oublié</h1>
          <p className="text-zinc-400 mt-2">Entrez votre email pour recevoir un lien de réinitialisation</p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
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
          <Button type="submit" disabled={loading} className="w-full py-6 rounded-xl bg-violet-600 hover:bg-violet-700 font-bold">
            {loading ? "Envoi en cours..." : "Envoyer le lien"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;