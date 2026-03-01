"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Scale, Lock, Info, FileText, AlertCircle } from 'lucide-react';
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
          <div className="w-20 h-20 bg-violet-600/10 rounded-3xl flex items-center justify-center text-violet-500 mx-auto mb-6">
            <Shield size={40} />
          </div>
          <h1 className="text-3xl font-black mb-2">Conditions & Confidentialité</h1>
          <p className="text-muted-foreground">Conditions Générales d'Utilisation (CGU) • v1.1</p>
          <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest">Dernière mise à jour : 20 Mars 2024</p>
        </div>

        <div className="space-y-10">
          {/* Section CGU */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="text-violet-500" size={24} />
              <h2 className="text-xl font-bold">1. Conditions d'Utilisation</h2>
            </div>
            <div className="bg-card border border-border p-8 rounded-[2rem] space-y-6 text-sm text-muted-foreground leading-relaxed shadow-sm">
              <div>
                <h3 className="font-bold text-foreground mb-2">Acceptation des conditions</h3>
                <p>En accédant à l'application eGame Bénin, vous acceptez d'être lié par les présentes conditions, toutes les lois et réglementations applicables au Bénin, et acceptez que vous êtes responsable du respect des lois locales applicables.</p>
              </div>
              
              <div>
                <h3 className="font-bold text-foreground mb-2">Description du service</h3>
                <p>eGame Bénin est une plateforme d'organisation de tournois de jeux vidéo. Nous fournissons l'infrastructure pour l'inscription, le paiement des frais de participation et la gestion des classements.</p>
              </div>

              <div>
                <h3 className="font-bold text-foreground mb-2">Responsabilité de l'utilisateur</h3>
                <p>Vous êtes responsable du maintien de la confidentialité de votre compte et de votre mot de passe. Vous acceptez de ne pas utiliser la plateforme pour des activités illégales ou frauduleuses.</p>
              </div>

              <div>
                <h3 className="font-bold text-foreground mb-2">Propriété intellectuelle</h3>
                <p>Le contenu, le logo, les graphismes et le code de l'application sont la propriété exclusive de eGame Bénin. Toute reproduction sans autorisation est interdite.</p>
              </div>
            </div>
          </section>

          {/* Section Règles de Conduite */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Scale className="text-violet-500" size={24} />
              <h2 className="text-xl font-bold">2. Règles de l'Arène</h2>
            </div>
            <div className="bg-card border border-border p-8 rounded-[2rem] space-y-4 text-sm text-muted-foreground leading-relaxed shadow-sm">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0 font-bold">1</div>
                <p><strong>Fair-Play :</strong> Respect absolu envers les adversaires et les administrateurs. Les insultes mènent au bannissement.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0 font-bold">2</div>
                <p><strong>Anti-Triche :</strong> L'usage de hacks, scripts ou exploitation de bugs entraîne une disqualification immédiate et définitive.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0 font-bold">3</div>
                <p><strong>Ponctualité :</strong> Un retard de plus de 10 minutes lors d'un match programmé entraîne un forfait automatique.</p>
              </div>
            </div>
          </section>

          {/* Section Confidentialité */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Lock className="text-violet-500" size={24} />
              <h2 className="text-xl font-bold">3. Politique de Confidentialité</h2>
            </div>
            <div className="bg-card border border-border p-8 rounded-[2rem] space-y-6 text-sm text-muted-foreground leading-relaxed shadow-sm">
              <p>Nous accordons une importance capitale à la protection de vos données personnelles.</p>
              
              <div>
                <h3 className="font-bold text-foreground mb-2">Données collectées</h3>
                <p>Nous collectons uniquement les informations nécessaires au fonctionnement du service : Email (authentification), Pseudo (affichage), et Numéro de téléphone (contact pour les prix et support).</p>
              </div>

              <div>
                <h3 className="font-bold text-foreground mb-2">Sécurité des paiements</h3>
                <p>Les transactions financières sont gérées par nos partenaires certifiés (FedaPay, GeniusPay, Kkiapay). eGame Bénin n'a jamais accès à vos codes PIN ou informations de carte bancaire.</p>
              </div>

              <div>
                <h3 className="font-bold text-foreground mb-2">Vos droits</h3>
                <p>Conformément à la législation sur la protection des données, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles via les paramètres de votre profil.</p>
              </div>
            </div>
          </section>

          {/* Section Remboursements */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="text-violet-500" size={24} />
              <h2 className="text-xl font-bold">4. Inscriptions & Remboursements</h2>
            </div>
            <div className="bg-card border border-border p-8 rounded-[2rem] space-y-4 text-sm text-muted-foreground leading-relaxed shadow-sm">
              <p>• Les frais d'inscription sont définitifs et non remboursables une fois le tournoi commencé.</p>
              <p>• En cas d'annulation d'un tournoi par l'administration, les participants seront intégralement remboursés ou crédités pour un futur événement.</p>
              <p>• Les cash prizes sont versés dans un délai de 24h à 72h après la fin officielle du tournoi.</p>
            </div>
          </section>
        </div>

        <div className="mt-16 p-8 bg-violet-600/5 rounded-[2.5rem] border border-violet-500/10 text-center">
          <p className="text-muted-foreground text-xs">
            Pour toute question concernant ces conditions, contactez-nous à :<br />
            <span className="text-violet-500 font-bold">contact@egamebenin.com</span>
          </p>
        </div>

        <footer className="mt-12 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          <p>© 2026 eGame Bénin • Tous droits réservés</p>
        </footer>
      </main>
    </div>
  );
};

export default Terms;