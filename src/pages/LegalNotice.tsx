"use client";

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Scale, Globe, Mail, Server, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';

const LEGAL_INFO = [
  { label: 'Plateforme', value: 'eGame Bénin — Plateforme eSport' },
  { label: 'RCCM', value: 'RB/ABC/26 A 138238', mono: true },
  { label: 'IFU', value: '0202398541260', mono: true },
  { label: 'Responsable', value: 'MOUSSA Jae San Thierry' },
  { label: 'Pays', value: 'Bénin' },
  { label: 'Site web', value: 'egamebenin.com', href: 'https://www.egamebenin.com' },
  { label: 'Contact', value: 'contact@egamebenin.com', href: 'mailto:contact@egamebenin.com' }
];

const LegalNotice = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 pt-12 md:pt-24">
      <SEO title="Mentions légales" description="Informations légales de eGame Bénin : RCCM, IFU, responsable et hébergement." />
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
            <Scale size={40} />
          </div>
          <h1 className="text-3xl font-black mb-2">Mentions légales</h1>
          <p className="text-muted-foreground">Informations légales • eGame Bénin</p>
          <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest">Dernière mise à jour : 15 Septembre 2026</p>
        </motion.div>

        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="text-violet-500" size={24} />
            <h2 className="text-xl font-bold">Éditeur de la plateforme</h2>
          </div>
          <div className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden">
            {LEGAL_INFO.map((row, index) => (
              <div
                key={row.label}
                className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-8 py-4 ${index !== LEGAL_INFO.length - 1 ? 'border-b border-border/60' : ''}`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground sm:w-36 shrink-0">
                  {row.label}
                </span>
                {row.href ? (
                  <a
                    href={row.href}
                    target={row.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="text-sm font-bold text-violet-500 hover:text-violet-400 transition-colors break-all"
                  >
                    {row.value}
                  </a>
                ) : (
                  <span className={`text-sm font-bold break-all ${row.mono ? 'font-mono tracking-wider' : ''}`}>
                    {row.value}
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed px-2">
            Les références d'immatriculation ci-dessus peuvent être vérifiées auprès du Guichet Unique de formalités des entreprises du Bénin (APIEx).
          </p>
        </motion.section>

        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <Server className="text-violet-500" size={24} />
            <h2 className="text-xl font-bold">Hébergement</h2>
          </div>
          <div className="bg-card border border-border p-8 rounded-[2rem] space-y-4 text-sm text-muted-foreground leading-relaxed shadow-sm">
            <p>
              Le site egamebenin.com est hébergé par <strong className="text-foreground">Vercel</strong> — vercel.com.
            </p>
            <p>
              Les services backend (authentification, base de données et fonctions serveur) sont fournis par{' '}
              <strong className="text-foreground">Supabase</strong> — supabase.com.
            </p>
            <div className="flex items-start gap-3">
              <Globe className="text-violet-500 shrink-0 mt-0.5" size={16} />
              <p className="min-w-0">Les paiements en ligne sont traités par nos partenaires agréés KKiaPay et FedaPay (Mobile Money et cartes bancaires).</p>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="text-violet-500 shrink-0 mt-0.5" size={16} />
              <div className="min-w-0 flex-1">
                <p>Toute réclamation ou demande d'information :</p>
                <a href="mailto:contact@egamebenin.com" className="mt-1 block max-w-full break-all text-violet-500 font-bold hover:text-violet-400 transition-colors">
                  contact@egamebenin.com
                </a>
              </div>
            </div>
          </div>
        </motion.section>

        <footer className="mt-12 px-2 text-center text-[10px] leading-relaxed text-muted-foreground tracking-normal sm:tracking-wider">
          <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
            <span>© 2026 eGame Bénin</span>
            <span>— RCCM : <span className="font-mono">RB/ABC/26 A 138238</span></span>
            <span>| IFU : <span className="font-mono">0202398541260</span></span>
            <span>| <Link to="/privacy" className="hover:text-violet-500 underline underline-offset-2">Politique de confidentialité</Link></span>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default LegalNotice;
