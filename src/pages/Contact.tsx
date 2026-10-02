"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { ArrowLeft, Mail, HelpCircle, Facebook, Users, MessageSquare, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DISCORD_SERVERS } from '@/lib/discord';

const Contact = () => {
  const navigate = useNavigate();
  const email = "contact@egamebenin.com";
  const facebookUrl = "https://www.facebook.com/profile.php?id=61588439640775";

  const faqs = [
    { q: "Comment s'inscrire à un tournoi ?", a: "Accédez à la page du tournoi, cliquez sur 'S'inscrire et Payer', choisissez votre moyen Mobile Money (MTN, Moov, Celtiis) et validez." },
    { q: "Comment sont versés les Cash Prizes ?", a: "Les gains sont transférés par Mobile Money au numéro enregistré dans votre profil immédiatement après l'officialisation des résultats." },
    { q: "Que faire en cas de litige pendant un match ?", a: "Prenez une capture d'écran de l'écran de fin de partie et envoyez-la à nos arbitres sur le serveur Discord de votre jeu." },
    { q: "Les tournois sont-ils ouverts à tous ?", a: "Oui, tous les joueurs résidant en Afrique peuvent participer." }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-32 pt-24">
      <SEO title="Contact & Support eGame Bénin" />
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 space-y-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#8888AA] hover:text-white transition-colors text-xs font-gaming font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> Retour
        </button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-gaming font-black uppercase text-white">Contact & Support</h1>
          <p className="text-xs text-[#8888AA]">L'équipe eGame Bénin répond à toutes tes questions 7j/7</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <a
            href="#discord"
            className="p-6 bg-[#0F0F1E] border border-[#5865F2]/40 hover:border-[#5865F2] rounded-3xl text-center space-y-3 transition-all"
          >
            <div className="w-12 h-12 bg-[#5865F2]/20 text-[#8B9AFF] rounded-2xl flex items-center justify-center mx-auto">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="font-gaming font-bold text-xs text-white">Serveurs Discord</p>
              <p className="text-[10px] text-[#8888AA] uppercase">Un serveur par jeu</p>
            </div>
          </a>

          <button
            onClick={() => window.location.href = `mailto:${email}`}
            className="p-6 bg-[#0F0F1E] border border-[#8A2BE2]/30 hover:border-[#8A2BE2] rounded-3xl text-center space-y-3 transition-all"
          >
            <div className="w-12 h-12 bg-[#8A2BE2]/20 text-[#A855F7] rounded-2xl flex items-center justify-center mx-auto">
              <Mail size={24} />
            </div>
            <div>
              <p className="font-gaming font-bold text-xs text-white">Support E-mail</p>
              <p className="text-[10px] text-[#8888AA] uppercase">Officiel</p>
            </div>
          </button>

          <button
            onClick={() => window.open(facebookUrl, '_blank')}
            className="p-6 bg-[#0F0F1E] border border-blue-500/30 hover:border-blue-500 rounded-3xl text-center space-y-3 transition-all"
          >
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
              <Facebook size={24} />
            </div>
            <div>
              <p className="font-gaming font-bold text-xs text-white">Page Facebook</p>
              <p className="text-[10px] text-[#8888AA] uppercase">Actualités</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/classement')}
            className="p-6 bg-[#0F0F1E] border border-[#FFD700]/30 hover:border-[#FFD700] rounded-3xl text-center space-y-3 transition-all"
          >
            <div className="w-12 h-12 bg-[#FFD700]/15 text-[#FFD700] rounded-2xl flex items-center justify-center mx-auto">
              <Users size={24} />
            </div>
            <div>
              <p className="font-gaming font-bold text-xs text-white">Communauté</p>
              <p className="text-[10px] text-[#8888AA] uppercase">Classement joueurs</p>
            </div>
          </button>
        </div>

        {/* Serveurs Discord officiels — un serveur par jeu */}
        <div id="discord" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-gaming font-bold text-white uppercase flex items-center gap-2">
            <MessageSquare className="text-[#5865F2]" size={20} /> Nos serveurs Discord
          </h2>
          <p className="text-xs text-[#8888AA] leading-relaxed">
            Toute la communauté eGame Bénin vit sur Discord : rejoins le serveur de ton jeu pour
            échanger avec les joueurs, suivre tes tournois et trouver les arbitres.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DISCORD_SERVERS.map((server) => (
              <a
                key={server.slug}
                href={server.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 bg-[#0F0F1E] border border-[#5865F2]/25 hover:border-[#5865F2] rounded-2xl px-5 py-4 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#5865F2]/15 border border-[#5865F2]/40 flex items-center justify-center shrink-0">
                    <MessageSquare size={15} className="text-[#8B9AFF]" />
                  </div>
                  <p className="text-xs font-gaming font-bold text-white truncate">{server.game}</p>
                </div>
                <ChevronRight size={15} className="text-[#5865F2] shrink-0 transition-transform group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h2 className="text-xl font-gaming font-bold text-white uppercase flex items-center gap-2">
            <HelpCircle className="text-[#8A2BE2]" size={20} /> Questions Fréquentes
          </h2>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-[#8A2BE2]/20 bg-[#0F0F1E] rounded-2xl px-5">
                <AccordionTrigger className="hover:no-underline font-gaming font-bold text-xs text-white text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-[#8888AA] text-xs leading-relaxed font-medium">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
    </div>
  );
};

export default Contact;
