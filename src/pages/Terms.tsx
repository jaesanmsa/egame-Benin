"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Scale, Lock, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft size={20} />
          Retour
        </button>

        <div className="text-center mb-12">
          <Shield size={48} className="text-violet-500 mx-auto mb-4" />
          <h1 className="text-3xl font-black mb-2">Règles & Confidentialité</h1>
          <p className="text-muted-foreground">Dernière mise à jour : Mars 2024</p>
        </div>

        <div className="space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="text-violet-500" size={24} />
              <h2 className="text-xl font-bold">1. Règles de Conduite</h2>
            </div>
            <div className="bg-card border border-border p-6 rounded-3xl space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>• <strong>Fair-Play :</strong> Tout comportement toxique, insulte ou harcèlement envers d'autres joueurs ou l'administration entraînera un bannissement immédiat.</p>
              <p>• <strong>Triche :</strong> L'utilisation de logiciels tiers, de bugs ou de toute forme de triche est strictement interdite. Les comptes suspects seront audités.</p>
              <p>• <strong>Identité :</strong> Un joueur ne peut posséder qu'un seul compte eGame Bénin. L'usurpation d'identité est punie.</p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="text-violet-500" size={24} />
              <h2 className="text-xl font-bold">2. Confidentialité des Données</h2>
            </div>
            <div className="bg-card border border-border p-6 rounded-3xl space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>• <strong>Collecte :</strong> Nous collectons votre email, pseudo et numéro de téléphone uniquement pour la gestion des tournois et des paiements.</p>
              <p>• <strong>Paiements :</strong> Vos informations bancaires ou de Mobile Money sont traitées directement par nos partenaires sécurisés (FedaPay, GeniusPay). Nous ne stockons aucun numéro de carte ou code PIN.</p>
              <p>• <strong>Partage :</strong> Vos données ne sont jamais vendues à des tiers. Elles sont utilisées exclusivement pour le bon fonctionnement de l'application.</p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Info className="text-violet-500" size={24} />
              <h2 className="text-xl font-bold">3. Inscriptions et Remboursements</h2>
            </div>
            <div className="bg-card border border-border p-6 rounded-3xl space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>• <strong>Validation :</strong> Une inscription n'est valide qu'après confirmation du paiement et réception du code de validation.</p>
              <p>• <strong>Remboursement :</strong> Les frais d'inscription ne sont pas remboursables, sauf en cas d'annulation du tournoi par l'administration.</p>
              <p>• <strong>Retard :</strong> Tout joueur absent au début de son match sera déclaré forfait sans possibilité de remboursement.</p>
            </div>
          </section>
        </div>

        <footer className="mt-16 pt-8 border-t border-border text-center text-xs text-muted-foreground">
          <p>© 2026 eGame Bénin. Tous droits réservés.</p>
        </footer>
      </main>
    </div>
  );
};

export default Terms;