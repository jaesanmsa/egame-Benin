"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Mail, HelpCircle, Facebook } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Contact = () => {
  const navigate = useNavigate();
  const whatsappNumber = "2290141790790";
  const email = "egamebenin@gmail.com";
  const facebookUrl = "https://www.facebook.com/profile.php?id=61588439640775";

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Bonjour eGame Bénin, je souhaite obtenir des informations.");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const handleEmail = () => {
    window.location.href = `mailto:${email}?subject=Support eGame Bénin`;
  };

  const handleFacebook = () => {
    window.open(facebookUrl, '_blank');
  };

  const faqs = [
    { q: "Comment s'inscrire à un tournoi ?", a: "Choisissez un tournoi sur l'accueil, cliquez sur 'Participer' et suivez les instructions de paiement via FedaPay (MTN/Moov)." },
    { q: "Comment valider ma participation ?", a: "Après le paiement, allez dans votre 'Historique', copiez votre code de validation et envoyez-le nous sur WhatsApp." },
    { q: "Les tournois sont-ils gratuits ?", a: "La plupart des tournois ont des frais d'entrée qui servent à constituer le 'Cash Prize' pour les gagnants." },
    { q: "Où se déroulent les tournois présentiels ?", a: "Les lieux exacts (souvent à Cotonou) sont communiqués aux participants via WhatsApp après validation." }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 pt-12 md:pt-24">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft size={20} />
          Retour
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-black mb-4">Contact & Aide</h1>
          <p className="text-muted-foreground">Une question ? Notre équipe est là pour vous aider.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleWhatsApp}
            className="flex flex-col items-center gap-3 p-6 bg-green-500/10 border border-green-500/20 rounded-3xl text-center transition-all hover:bg-green-500/20"
          >
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <MessageSquare size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-green-500">WhatsApp</h3>
              <p className="text-[10px] text-muted-foreground">Réponse rapide</p>
            </div>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleFacebook}
            className="flex flex-col items-center gap-3 p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl text-center transition-all hover:bg-blue-500/20"
          >
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Facebook size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-blue-500">Facebook</h3>
              <p className="text-[10px] text-muted-foreground">Actualités & News</p>
            </div>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEmail}
            className="flex flex-col items-center gap-3 p-6 bg-violet-500/10 border border-violet-500/20 rounded-3xl text-center transition-all hover:bg-violet-500/20"
          >
            <div className="w-12 h-12 bg-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Mail size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-violet-500">Email</h3>
              <p className="text-[10px] text-muted-foreground">Support officiel</p>
            </div>
          </motion.button>
        </div>

        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="text-violet-500" size={20} />
            <h2 className="text-xl font-bold">Questions Fréquentes</h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-border bg-card/50 rounded-2xl px-4 overflow-hidden">
                <AccordionTrigger className="hover:no-underline font-bold text-sm text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <div className="mt-12 p-8 bg-card/50 rounded-[2rem] border border-border text-center">
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
            Disponible du Lundi au Samedi <br />
            De 09h00 à 20h00
          </p>
        </div>
      </main>
    </div>
  );
};

export default Contact;