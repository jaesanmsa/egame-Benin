"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, ArrowRight, History, MessageSquare, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { showSuccess } from '@/utils/toast';

const PaymentSuccess = () => {
  const location = useLocation();
  const { code, tournamentName } = location.state || {};
  const whatsappNumber = "2290141790790";

  const handleWhatsAppSend = () => {
    const message = encodeURIComponent(`Bonjour eGame Bénin, voici mon code de validation de paiement : ${code} pour le tournoi ${tournamentName}.`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const copyToClipboard = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      showSuccess("Code copié !");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-card border border-border rounded-[3rem] p-10 text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>

          <h1 className="text-3xl font-black mb-4">Paiement Reçu !</h1>
          <p className="text-muted-foreground mb-8">
            Votre inscription a été enregistrée. Voici votre code de validation unique :
          </p>

          {code ? (
            <div className="space-y-6 mb-10">
              <div className="p-6 bg-muted/50 rounded-[2rem] border border-border relative group">
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2">Code de validation</p>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-foreground font-mono font-black text-2xl tracking-wider">{code}</span>
                  <button onClick={copyToClipboard} className="text-muted-foreground hover:text-violet-500 transition-colors">
                    <Copy size={20} />
                  </button>
                </div>
              </div>

              <Button 
                onClick={handleWhatsAppSend}
                className="w-full py-8 rounded-2xl bg-green-600 hover:bg-green-700 font-black text-lg gap-3 text-white shadow-xl shadow-green-500/20"
              >
                <MessageSquare size={24} />
                Envoyer sur WhatsApp
              </Button>
            </div>
          ) : (
            <div className="mb-10">
              <Link to="/payments">
                <Button className="w-full py-7 rounded-2xl bg-violet-600 hover:bg-violet-700 font-bold text-lg gap-3 text-white">
                  <History size={20} />
                  Voir mon historique
                </Button>
              </Link>
            </div>
          )}

          <div className="space-y-4">
            <Link to="/">
              <Button variant="outline" className="w-full py-7 rounded-2xl border-border bg-muted/50 hover:bg-muted font-bold gap-3">
                Retour à l'accueil
                <ArrowRight size={20} />
              </Button>
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-border">
            <p className="text-[10px] text-muted-foreground mb-4 uppercase font-black tracking-widest">Besoin d'aide ?</p>
            <Link to="/contact" className="inline-flex items-center gap-2 text-green-500 font-bold hover:underline">
              <MessageSquare size={16} />
              Contacter le support
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;