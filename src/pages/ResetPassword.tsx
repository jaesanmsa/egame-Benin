"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      showError(error.message);
    } else {
      showSuccess("Mot de passe mis à jour !");
      navigate('/auth');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-black text-white">Nouveau mot de passe</h1>
          <p className="text-zinc-400 mt-2">Entrez votre nouveau mot de passe sécurisé</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe</Label>
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
          <Button type="submit" disabled={loading} className="w-full py-6 rounded-xl bg-violet-600 hover:bg-violet-700 font-bold">
            {loading ? "Mise à jour..." : "Changer le mot de passe"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;