"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Handshake, ExternalLink, BadgeCheck, Gamepad2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  { key: "sponsor", label: "Sponsors financiers" },
  { key: "technique", label: "Partenaires techniques & technologiques" },
  { key: "media", label: "Partenaires médias & institutionnels" },
  { key: "communautaire", label: "Partenaires communautaires & collaborateurs eSport" },
];

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

  if (!loaded || partners.length === 0) return null;

  return (
    <section id="partenaires" className="max-w-7xl mx-auto px-6 py-16 space-y-10 scroll-mt-24">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-gaming font-black uppercase text-white">
          Nos partenaires <span className="text-[#8A2BE2]">& communautés</span>
        </h2>
        <p className="text-sm text-[#8888AA] font-esport">
          Les organisations qui accompagnent le développement de l'eSport avec eGame Bénin.
        </p>
      </div>

      <div className="space-y-12">
        {CATEGORIES.map((cat) => {
          const items = partners.filter((p) => p.category === cat.key);
          if (items.length === 0) return null;

          return (
            <div key={cat.key} className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#8A2BE2]/20 border border-[#8A2BE2]/40 flex items-center justify-center shrink-0">
                  <Handshake size={15} className="text-[#A855F7]" />
                </div>
                <h3 className="text-sm font-gaming font-black uppercase tracking-wider text-white">{cat.label}</h3>
                <div className="flex-1 h-px bg-[#8A2BE2]/20" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.2) }}
                    className="group bg-[#0F0F1E] border border-[#8A2BE2]/20 hover:border-[#8A2BE2]/60 rounded-3xl p-6 space-y-4 transition-colors shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#8A2BE2]/15 border border-[#8A2BE2]/30 flex items-center justify-center shrink-0">
                          {p.logo_url ? (
                            <img src={p.logo_url} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-contain p-1" />
                          ) : (
                            <span className="font-gaming font-black text-lg text-[#A855F7]">{p.name.charAt(0)}</span>
                          )}
                        </div>
                        <h4 className="font-gaming font-bold text-sm text-white leading-tight break-words">{p.name}</h4>
                      </div>
                      {p.is_official && (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[9px] font-gaming font-black uppercase tracking-widest text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-full">
                          <BadgeCheck size={11} /> Officiel
                        </span>
                      )}
                    </div>

                    {p.description && (
                      <p className="text-xs text-[#8888AA] leading-relaxed">{p.description}</p>
                    )}

                    <div className="flex items-center justify-between gap-3 pt-1">
                      {p.game ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-gaming font-bold uppercase tracking-wider text-[#A855F7] bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 px-3 py-1 rounded-full">
                          <Gamepad2 size={11} /> {p.game}
                        </span>
                      ) : (
                        <span />
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
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PartnersSection;
