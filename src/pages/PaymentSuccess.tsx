"use client";

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, History, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          
          <h1 className="text-3xl font-black mb-4">Paiement Reçu !</h1>
          <p className="text-zinc-400 mb-10">
            Votre inscription a été enregistrée. Vous pouvez maintenant récupérer votre code de validation.
          </p>

          <div className="space-y-4">
            <Link to="/payments">
              <Button className="w-full py-7 rounded-2xl bg-violet-600 hover:bg-violet-700 font-bold text-lg gap-3">
                <History size={20} />
                Voir mon code
              </Button>
            </Link>
            
            <Link to="/">
              <Button variant="outline" className="w-full py-7 rounded-2xl border-zinc-800 bg-zinc-800/50 hover:bg-zinc-800 font-bold gap-3">
                Retour à l'accueil
                <ArrowRight size={20} />
              </Button>
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 mb-4">Besoin d'aide pour la validation ?</p>
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