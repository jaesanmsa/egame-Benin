import { useSiteLanguage, translate, useLocalePath } from '@/lib/siteLanguage';
"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Scale, Lock, FileText, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
  const localizedLinkPath = useLocalePath();
  const language = useSiteLanguage();
  const t = (value: string) => translate(value, language);
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 pt-12 md:pt-24">
      <SEO title="Confidentialité & Conditions d'utilisation" description="Conditions d'utilisation, règles de l'arène, protection des données, paiements et remboursements sur eGame Bénin." />
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <motion.button 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Retour
        </motion.button>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-violet-600/10 rounded-3xl flex items-center justify-center text-violet-500 mx-auto mb-6">
            <Shield size={40} />
          </div>
          <h1 className="text-3xl font-black mb-2">{t("Conditions, confidentialité & remboursements")}</h1>
          <p className="text-muted-foreground">{t("Conditions Générales & Protection des Données • v1.1")}</p>
          <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest">{t("Dernière mise à jour : 4 Mars 2026")}</p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          {/* Section CGU */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="text-violet-500" size={24} />
              <h2 className="text-xl font-bold">{t("1. Conditions d'Utilisation")}</h2>
            </div>
            <div className="bg-card border border-border p-8 rounded-[2rem] space-y-6 text-sm text-muted-foreground leading-relaxed shadow-sm">
              <div>
                <h3 className="font-bold text-foreground mb-2">{t("Acceptation des conditions")}</h3>
                <p>{t("En accédant à l'application eGame Bénin, vous acceptez d'être lié par les présentes conditions, toutes les lois et réglementations applicables au Bénin, et acceptez que vous êtes responsable du respect des lois locales applicables.")}</p>
              </div>
              
              <div>
                <h3 className="font-bold text-foreground mb-2">{t("Description du service")}</h3>
                <p>{t("eGame Bénin est une plateforme d'organisation de tournois de jeux vidéo. Nous fournissons l'infrastructure pour l'inscription, le paiement des frais de participation et la gestion des classements.")}</p>
              </div>

              <div>
                <h3 className="font-bold text-foreground mb-2">{t("Responsabilité de l'utilisateur")}</h3>
                <p>{t("Vous êtes responsable du maintien de la confidentialité de votre compte et de votre mot de passe. Vous acceptez de ne pas utiliser la plateforme pour des activités illégales ou frauduleuses.")}</p>
              </div>

              <div>
                <h3 className="font-bold text-foreground mb-2">{t("Propriété intellectuelle")}</h3>
                <p>{t("Le contenu, le logo, les graphismes et le code de l'application sont la propriété exclusive de eGame Bénin. Toute reproduction sans autorisation est interdite.")}</p>
              </div>
            </div>
          </motion.section>

          {/* Section Règles de Conduite */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center gap-3 mb-6">
              <Scale className="text-violet-500" size={24} />
              <h2 className="text-xl font-bold">{t("2. Règles de l'Arène")}</h2>
            </div>
            <div className="bg-card border border-border p-8 rounded-[2rem] space-y-4 text-sm text-muted-foreground leading-relaxed shadow-sm">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0 font-bold">1</div>
                <p><strong>{t("Fair-Play :")}</strong> Respect absolu envers les adversaires et les administrateurs. Les insultes mènent au bannissement.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0 font-bold">2</div>
                <p><strong>{t("Anti-Triche :")}</strong> L'usage de hacks, scripts ou exploitation de bugs entraîne une disqualification immédiate et définitive.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0 font-bold">3</div>
                <p><strong>{t("Ponctualité :")}</strong> Un retard de plus de 10 minutes lors d'un match programmé entraîne un forfait automatique.</p>
              </div>
            </div>
          </motion.section>

          {/* Section Confidentialité */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center gap-3 mb-6">
              <Lock className="text-violet-500" size={24} />
              <h2 className="text-xl font-bold">{t("3. Politique de Confidentialité")}</h2>
            </div>
            <div className="bg-card border border-border p-8 rounded-[2rem] space-y-6 text-sm text-muted-foreground leading-relaxed shadow-sm">
              <p>{t("Nous accordons une importance capitale à la protection de vos données personnelles.")}</p>
              
              <div>
                <h3 className="font-bold text-foreground mb-2">{t("Données collectées")}</h3>
                <p>{t("Nous collectons uniquement les informations nécessaires au fonctionnement du service : Email (authentification), Pseudo (affichage), et Numéro de téléphone (contact pour les prix et support).")}</p>
              </div>

              <div>
                <h3 className="font-bold text-foreground mb-2">{t("Sécurité des paiements")}</h3>
                <p>{t("Les paiements sont traités par des prestataires de paiement sécurisés. Les moyens disponibles peuvent varier selon le tournoi. eGame Bénin n'a jamais accès à vos codes PIN ou informations de carte bancaire.")}</p>
              </div>

              <div>
                <h3 className="font-bold text-foreground mb-2">{t("Vos droits")}</h3>
                <p>{t("Conformément à la législation sur la protection des données, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles via les paramètres de votre profil.")}</p>
              </div>
            </div>
          </motion.section>

          {/* Section Remboursements */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="text-violet-500" size={24} />
              <h2 className="text-xl font-bold">{t("4. Inscriptions & Remboursements")}</h2>
            </div>
            <div className="bg-card border border-border p-8 rounded-[2rem] space-y-4 text-sm text-muted-foreground leading-relaxed shadow-sm">
              <p>{t("• Les frais d'inscription sont définitifs et non remboursables une fois le tournoi commencé.")}</p>
              <p>{t("• En cas d'annulation d'un tournoi par l'administration, les participants seront intégralement remboursés ou crédités pour un futur événement.")}</p>
              <p>{t("• Les récompenses sont versées après validation définitive des résultats, selon les conditions du tournoi.")}</p>
            </div>
          </motion.section>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-16 p-8 bg-violet-600/5 rounded-[2.5rem] border border-violet-500/10 text-center"
        >
          <p className="text-muted-foreground text-xs">
            Pour toute question concernant ces conditions, contactez-nous à :<br />
            <span className="text-violet-500 font-bold">contact@egamebenin.com</span>
          </p>
        </motion.div>

        <footer className="mt-12 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          <p>© 2026 eGame Bénin • RCCM : RB/ABC/26 A 138238 | IFU : 0202398541260</p>
        </footer>
      </main>
    </div>
  );
};

export default Privacy;