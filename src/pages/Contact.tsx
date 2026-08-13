"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { ArrowLeft, MessageSquare, Mail, HelpCircle, Facebook, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Contact = () => {
  const navigate = useNavigate();
  const whatsappNumber = "2290141790790";
  const email = "contact@egamebenin.com";
  const facebookUrl = "https://www.facebook.com/profile.php?id=61588439640775";
  const whatsappChannelUrl = "https://whatsapp.com/channel/0029Vb6qihB9MF8wGo02z93E";

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Bonjour eGame Bénin, j'ai besoin d'aide pour la plateforme.");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const faqs = [
    { q: "Comment s'inscrire à un tournoi ?", a: "Accédez à la page du tournoi, cliquez sur 'S'inscrire et Payer', choisissez votre moyen Mobile Money (MTN, Moov, Celtiis) et validez." },
    { q: "Comment sont versés les Cash Prizes ?", a: "Les gains sont transférés par Mobile Money au numéro enregistré dans votre profil immédiatement après l'officialisation des résultats." },
    { q: "Que faire en cas de litige pendant un match ?", a: "Prenez une capture d'écran de l'écran de fin de partie et envoyez-la à nos arbitres via le support WhatsApp." },
    { q: "Les tournois sont-ils ouverts à tous ?", a: "Oui, tous les joueurs résidant au Bénin peuvent participer." }
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
          <button 
            onClick={() => window.open(whatsappChannelUrl, '_blank')}
            className="p-6 bg-[#0F0F1E] border border-emerald-500/30 hover:border-emerald-500 rounded-3xl text-center space-y-3 transition-all"
          >
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
              <Users size={24} />
            </div>
            <div>
              <p className="font-gaming font-bold text-xs text-white">Chaîne WhatsApp</p>
              <p className="text-[10px] text-[#8888AA] uppercase">Communauté</p>
            </div>
          </button>

          <button 
            onClick={handleWhatsApp}
            className="p-6 bg-[#0F0F1E] border border-[#8A2BE2]/30 hover:border-[#8A2BE2] rounded-3xl text-center space-y-3 transition-all"
          >
            <div className="w-12 h-12 bg-[#8A2BE2]/20 text-[#8A2BE2] rounded-2xl flex items-center justify-center mx-auto">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="font-gaming font-bold text-xs text-white">Support Direct</p>
              <p className="text-[10px] text-[#8888AA] uppercase">WhatsApp 24/7</p>
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
            onClick={() => window.location.href = `mailto:${email}`}
            className="p-6 bg-[#0F0F1E] border border-[#8A2BE2]/30 hover:border-[#8A2BE2] rounded-3xl text-center space-y-3 transition-all"
          >
            <div className="w-12 h-12 bg-[#8A2BE2]/20 text-[#8A2BE2] rounded-2xl flex items-center justify-center mx-auto">
              <Mail size={24} />
            </div>
            <div>
              <p className="font-gaming font-bold text-xs text-white">Support E-mail</p>
              <p className="text-[10px] text-[#8888AA] uppercase">Officiel</p>
            </div>
          </button>
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