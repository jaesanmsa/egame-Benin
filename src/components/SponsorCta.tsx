"use client";

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Handshake, ArrowRight } from "lucide-react";

const SponsorCta = () => (
  <section className="max-w-7xl mx-auto px-6 py-16">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="relative bg-[#0F0F1E] border border-[#FFD700]/30 rounded-3xl p-8 md:p-14 overflow-hidden shadow-2xl text-center space-y-6"
    >
      <div className="absolute -top-24 -right-20 w-96 h-96 bg-[#FFD700]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-20 w-96 h-96 bg-[#8A2BE2]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative space-y-5 max-w-3xl mx-auto">
        <div className="w-16 h-16 bg-[#FFD700]/10 border border-[#FFD700]/40 rounded-2xl flex items-center justify-center mx-auto text-[#FFD700]">
          <Handshake size={30} />
        </div>

        <h2 className="text-2xl md:text-3xl font-gaming font-black uppercase text-white leading-tight">
          Associez votre marque à la <span className="text-[#FFD700] text-glow-gold">communauté eSport</span>.
        </h2>

        <p className="text-sm md:text-base text-[#8888AA] font-esport leading-relaxed max-w-2xl mx-auto">
          Accompagnez le développement de eGame Bénin et participez à l'organisation de compétitions gaming.
          Découvrez nos opportunités de sponsoring financier, de partenariats techniques et de collaborations communautaires.
        </p>

        <div className="pt-2">
          <Link
            to="/devenir-partenaire"
            className="btn-gold inline-flex items-center justify-center gap-3 px-10 py-4 text-xs font-gaming font-black uppercase tracking-widest rounded-2xl"
          >
            Devenir partenaire
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </motion.div>
  </section>
);

export default SponsorCta;
