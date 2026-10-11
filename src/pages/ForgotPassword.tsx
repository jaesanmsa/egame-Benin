import { useSiteLanguage, translate, useLocalePath } from '@/lib/siteLanguage';
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
  const language = useSiteLanguage();
  const t = (value: string) => translate(value, language);
  const localizedLinkPath = useLocalePath();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFailure('');
    try {
      const redirectUrl = `${window.location.origin}${localizedLinkPath("/reset-password")}`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: redirectUrl,
      });
      if (error) {
        const message = /rate limit|too many|security purposes/i.test(error.message)
          ? "Trop de demandes. Réessaie plus tard et vérifie tes spams."
          : /redirect|not allowed/i.test(error.message)
          ? "Configuration du lien de récupération incorrecte. Contacte le support eGame Bénin."
          : /email|smtp|sending/i.test(error.message)
          ? "L'envoi du courriel a échoué. Réessaie plus tard ou contacte le support."
          : error.message;
        setFailure(message);
        showError(message);
        return;
      }
      setSent(true);
      showSuccess("Si ce compte existe, les instructions de récupération ont été envoyées.");
    } catch {
      setFailure("Impossible de contacter le service de récupération. Réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-[2.5rem] border border-border shadow-2xl">
        <Link to={localizedLinkPath("/auth")} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} />
          Retour
        </Link>

        <div className="text-center">
          <h1 className="text-3xl font-black">{t("Mot de passe oublié")}</h1>
          <p className="text-muted-foreground mt-2">{t("Entrez votre email pour recevoir un lien de réinitialisation")}</p>
        </div>

        {sent && <p role="status" className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm">Si cette adresse correspond à un compte, tu recevras un lien. Vérifie aussi les spams. Le lien peut prendre quelques minutes.</p>}
        {failure && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{failure} <a href="mailto:contact@egamebenin.com" className="underline">Contacter le support</a></p>}
        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">{t("Email")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                className="pl-10 bg-muted border-border rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full py-6 rounded-xl bg-violet-600 hover:bg-violet-700 font-bold text-white">
            {loading ? "Envoi en cours..." : "Envoyer le lien"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;