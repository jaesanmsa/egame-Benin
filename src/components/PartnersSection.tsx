"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, BadgeCheck, Gamepad2, MoveHorizontal } from "lucide-react";
import { supabase } from "@/lib/supabase";

const CATEGORY_LABELS: Record<string, string> = {
  sponsor: "Sponsor financier",
  technique: "Partenaire technique",
  media: "Média & institutionnel",
  communautaire: "Communauté eSport",
};

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  category: string;
  game: string | null;
  description: string | null;
  link_url: string | null;
  is_official: boolean;
}

const PartnersSection = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, startX: 0, scrollLeft: 0, moved: false });

  useEffect(() => {
    // La policy RLS ne renvoie au public que les partenaires visibles.
    supabase
      .from("partners")
      .select("id, name, logo_url, category, game, description, link_url, is_official")
      .eq("visible", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setPartners((data as Partner[]) ?? []);
        setLoaded(true);
      });
  }, []);

  // Glisser-déposer à la souris (le tactile fonctionne nativement).
  const onMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    drag.current = { down: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft, moved: false };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!drag.current.down || !el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = x - drag.current.startX;
    if (Math.abs(walk) > 5) drag.current.moved = true;
    el.scrollLeft = drag.current.scrollLeft - walk;
  };

  const endDrag = () => {
    drag.current.down = false;
  };

  const onClickCapture = (e: React.MouseEvent) => {
    // Évite d'ouvrir un lien si on vient de faire glisser le bandeau.
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  if (!loaded || partners.length === 0) return null;

  return (
    <section id="partenaires" className="max-w-7xl mx-auto px-6 py-12 space-y-6 scroll-mt-24">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-gaming font-black uppercase text-white">
          Nos partenaires <span className="text-[#8A2BE2]">& communautés</span>
        </h2>
        <p className="text-sm text-[#8888AA] font-esport">
          Les organisations qui accompagnent le développement de l'eSport avec eGame Bénin.
        </p>
        <p className="flex items-center justify-center gap-2 text-[10px] font-gaming font-bold uppercase tracking-widest text-[#A855F7]">
          <MoveHorizontal size={14} /> Fais glisser pour tous les découvrir
        </p>
      </div>

      {/* Bandeau horizontal : 2 partenaires visibles, le reste se découvre en glissant */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45 }}
        className="relative"
      >
        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onClickCapture={onClickCapture}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 px-1 no-scrollbar cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: "none" }}
        >
          {partners.map((p) => (
            <div
              key={p.id}
              className="relative snap-start shrink-0 w-[46%] sm:w-[42%] lg:w-[30%] bg-[#0F0F1E] border border-[#8A2BE2]/25 hover:border-[#8A2BE2]/60 rounded-3xl p-5 md:p-6 space-y-4 transition-colors shadow-xl"
            >
              {p.is_official && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-0.5 text-[7px] font-gaming font-black uppercase tracking-normal text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.5 rounded-full">
                  <BadgeCheck size={8} className="shrink-0" /> Officiel
                </span>
              )}

              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#8A2BE2]/15 border border-[#8A2BE2]/30 flex items-center justify-center shrink-0">
                {p.logo_url ? (
                  <img src={p.logo_url} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-contain p-1" draggable={false} />
                ) : (
                  <span className="font-gaming font-black text-lg text-[#A855F7]">{p.name.charAt(0)}</span>
                )}
              </div>

              <h4 className="font-gaming font-bold text-sm text-white leading-tight break-words pr-8">{p.name}</h4>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] font-gaming font-bold uppercase tracking-wider text-[#A855F7] bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 px-2.5 py-1 rounded-full">
                  {CATEGORY_LABELS[p.category] ?? p.category}
                </span>
                {p.game && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-gaming font-bold uppercase tracking-wider text-white/70 bg-[#0A0A0F] border border-[#8A2BE2]/25 px-2.5 py-1 rounded-full">
                    <Gamepad2 size={10} /> {p.game}
                  </span>
                )}
              </div>

              {p.description && (
                <p className="text-xs text-[#8888AA] leading-relaxed">{p.description}</p>
              )}

              {p.link_url && (
                <a
                  href={p.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-gaming font-bold uppercase tracking-wider text-white/70 hover:text-[#A855F7] transition-colors"
                >
                  Visiter <ExternalLink size={12} />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Fondu latéral signalant la suite du défilement */}
        <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-[#07070C] to-transparent pointer-events-none hidden sm:block" />
      </motion.div>
    </section>
  );
};

export default PartnersSection;
