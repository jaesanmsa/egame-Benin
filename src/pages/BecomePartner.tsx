"use client";

import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  Handshake, CheckCircle2, Send, Download, FileText, Mail, ArrowRight, AlertTriangle, Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const CONTACT_EMAIL = "contact@egamebenin.com";
const DOSSIER_URL = "/dossier-sponsoring-egame-benin.pdf";

const PARTNERSHIP_TYPES = [
  "Sponsor financier",
  "Partenaire technique",
  "Partenaire média",
  "Partenaire dotation / récompenses",
  "Partenaire institutionnel",
  "Partenaire lieu / logistique",
  "Partenaire communautaire / Chef de clan",
  "Créateur / Ambassadeur",
  "Autre",
];

const GAMES = [
  "Tous les jeux",
  "Free Fire",
  "Blood Strike",
  "eFootball Mobile",
  "COD Mobile",
  "Clash Royale",
  "Clash of Clans",
  "PUBG Mobile",
  "Mobile Legends",
  "Brawl Stars",
];

const BUDGETS = [
  "Moins de 250 000 FCFA",
  "250 000 – 500 000 FCFA",
  "500 000 – 1 000 000 FCFA",
  "1 000 000 – 2 000 000 FCFA",
  "2 000 000 – 3 000 000 FCFA",
  "3 000 000 FCFA et plus",
  "Non applicable",
];

const emptyForm = {
  full_name: "",
  organization: "",
  email: "",
  whatsapp: "",
  partnership_type: "",
  game: "",
  link: "",
  community_size: "",
  contribution: "",
  expectations: "",
  budget: "",
  message: "",
  website: "", // honeypot anti-spam
};

const BecomePartner = () => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const mountedAt = useRef(Date.now());
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const set = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (form.full_name.trim().length < 2) e.full_name = "Indique ton nom / prénom.";
    if (form.organization.trim().length < 2) e.organization = "Indique le nom de ton entreprise, organisation, clan ou communauté.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Adresse e-mail invalide.";
    if (!/^[+\d][\d\s-]{7,}$/.test(form.whatsapp.trim())) e.whatsapp = "Numéro WhatsApp invalide (ex: +229 01 23 45 678).";
    if (!form.partnership_type) e.partnership_type = "Choisis un type de partenariat.";
    if (form.contribution.trim().length < 10) e.contribution = "Décris ce que tu souhaites apporter (10 caractères minimum).";
    if (form.expectations.trim().length < 10) e.expectations = "Décris ce que tu recherches (10 caractères minimum).";
    if (form.message.trim().length < 10) e.message = "Détaille ta proposition (10 caractères minimum).";
    if (form.link.trim() && !/^https?:\/\/.+\..+/.test(form.link.trim())) e.link = "Lien invalide : il doit commencer par http:// ou https://";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildMailtoFallback = () => {
    const body = [
      `Nom / prénom : ${form.full_name}`,
      `Organisation / clan / communauté : ${form.organization}`,
      `E-mail : ${form.email}`,
      `WhatsApp : ${form.whatsapp}`,
      `Type de partenariat : ${form.partnership_type}`,
      `Jeu concerné : ${form.game || "—"}`,
      `Lien : ${form.link || "—"}`,
      `Taille de la communauté : ${form.community_size || "—"}`,
      `Apport envisagé : ${form.contribution}`,
      `Attendu de la collaboration : ${form.expectations}`,
      `Budget envisagé : ${form.budget || "—"}`,
      `Message : ${form.message}`,
    ].join("\n");
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Proposition de partenariat — ${form.partnership_type} — ${form.organization}`)}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitError("");

    // Anti-spam : honeypot + piège temporel (un humain remplit le formulaire en plusieurs secondes).
    if (form.website.trim() !== "") {
      setSent(true);
      return;
    }
    if (Date.now() - mountedAt.current < 4000) {
      setSubmitError("Formulaire envoyé trop vite : vérifie tes informations puis renvoie-le.");
      return;
    }
    if (!validate()) return;

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("partnership-request", { body: form });
      if (error) throw new Error(error.message);
      setSent(true);
      window.scrollTo({ top: formRef.current?.offsetTop ?? 0, behavior: "smooth" });
    } catch {
      setSubmitError("L'envoi a échoué. Réessaie, ou envoie ta proposition directement par e-mail avec le bouton ci-dessous.");
      setSending(false);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#07070C] text-white pb-32 pt-28 md:pt-32">
      <SEO
        title="Devenir partenaire | eGame Bénin"
        description="Découvrez les opportunités de sponsoring, partenariats techniques, médias et collaborations avec les communautés eSport de eGame Bénin."
      />
      <Navbar />

      {/* ============ EN-TÊTE ============ */}
      <header className="relative max-w-6xl mx-auto px-6 text-center space-y-8 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-[#8A2BE2]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 text-[#A855F7] text-xs font-gaming font-extrabold tracking-widest uppercase">
            <Handshake size={14} className="text-[#FFD700]" />
            Partenariats & Collaborations
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-gaming font-black uppercase leading-tight tracking-tight">
            Devenir partenaire <br />
            <span className="text-[#FFD700] text-glow-gold">de eGame Bénin</span>
          </h1>
          <p className="text-sm md:text-lg text-[#8888AA] font-esport tracking-wide max-w-3xl mx-auto leading-relaxed">
            Marques, entreprises, médias, communautés gaming, clans et acteurs de l'eSport :
            construisons ensemble des collaborations utiles et durables.
          </p>
          <p className="text-xs text-[#8888AA] max-w-2xl mx-auto leading-relaxed">
            Tout est détaillé dans notre dossier officiel : niveaux de sponsoring, contreparties,
            partenariats techniques, médias et communautaires.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={DOSSIER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glow-border w-full sm:w-auto px-8 py-4 text-xs tracking-widest uppercase flex items-center justify-center gap-3"
            >
              <FileText size={16} />
              Consulter le dossier partenariat
            </a>
            <button
              onClick={scrollToForm}
              className="w-full sm:w-auto px-8 py-4 border border-[#8A2BE2]/50 hover:border-[#8A2BE2] bg-[#0F0F1E]/80 hover:bg-[#8A2BE2]/10 rounded-2xl text-xs font-gaming font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-3"
            >
              Proposer un partenariat
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ============ FORMULAIRE ============ */}
      <section ref={formRef} className="max-w-3xl mx-auto px-6 mt-20 scroll-mt-24">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl md:text-3xl font-gaming font-black uppercase">
            Proposer un <span className="text-[#8A2BE2]">partenariat</span>
          </h2>
          <p className="text-sm text-[#8888AA] font-esport">Ta proposition arrive directement à {CONTACT_EMAIL}</p>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-10 text-center space-y-6"
          >
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} className="text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-gaming font-black uppercase text-white">Proposition bien envoyée !</h3>
              <p className="text-sm text-[#8888AA] leading-relaxed max-w-md mx-auto">
                Merci pour ton intérêt. L'équipe eGame Bénin étudie chaque proposition et te répond
                depuis <span className="text-white font-bold">{CONTACT_EMAIL}</span> dans un délai de 72 heures.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/">
                <Button variant="outline" className="bg-[#0F0F1E] border-[#8A2BE2]/50 hover:bg-[#8A2BE2]/10 rounded-2xl font-gaming font-bold text-xs uppercase tracking-wider px-6">
                  Retour à l'accueil
                </Button>
              </Link>
              <a href={DOSSIER_URL} target="_blank" rel="noopener noreferrer">
                <Button className="btn-gold rounded-2xl font-gaming font-bold text-xs uppercase tracking-wider px-6 flex items-center gap-2">
                  <Download size={14} /> Le dossier partenariat
                </Button>
              </a>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="glass-panel p-6 md:p-10 space-y-6">
            {/* Honeypot anti-spam : invisible pour les humains */}
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] w-px h-px opacity-0"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-[10px] font-gaming font-black uppercase tracking-widest text-[#A855F7]">Nom / prénom *</Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                  placeholder="Ton nom complet"
                  className={`bg-[#0A0A0F] border-[#8A2BE2]/30 focus-visible:border-[#8A2BE2] rounded-2xl h-12 text-white placeholder:text-[#8888AA]/60 ${errors.full_name ? "border-red-500/70" : ""}`}
                />
                {errors.full_name && <p className="text-[10px] text-red-400 font-bold">{errors.full_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization" className="text-[10px] font-gaming font-black uppercase tracking-widest text-[#A855F7]">Entreprise, organisation, clan ou communauté *</Label>
                <Input
                  id="organization"
                  value={form.organization}
                  onChange={(e) => set("organization", e.target.value)}
                  placeholder="Ex: Groupe WhatsApp Free Fire Bénin"
                  className={`bg-[#0A0A0F] border-[#8A2BE2]/30 focus-visible:border-[#8A2BE2] rounded-2xl h-12 text-white placeholder:text-[#8888AA]/60 ${errors.organization ? "border-red-500/70" : ""}`}
                />
                {errors.organization && <p className="text-[10px] text-red-400 font-bold">{errors.organization}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-gaming font-black uppercase tracking-widest text-[#A855F7]">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="contact@exemple.com"
                  className={`bg-[#0A0A0F] border-[#8A2BE2]/30 focus-visible:border-[#8A2BE2] rounded-2xl h-12 text-white placeholder:text-[#8888AA]/60 ${errors.email ? "border-red-500/70" : ""}`}
                />
                {errors.email && <p className="text-[10px] text-red-400 font-bold">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-[10px] font-gaming font-black uppercase tracking-widest text-[#A855F7]">Numéro WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => set("whatsapp", e.target.value)}
                  placeholder="+229 01 23 45 678"
                  className={`bg-[#0A0A0F] border-[#8A2BE2]/30 focus-visible:border-[#8A2BE2] rounded-2xl h-12 text-white placeholder:text-[#8888AA]/60 ${errors.whatsapp ? "border-red-500/70" : ""}`}
                />
                {errors.whatsapp && <p className="text-[10px] text-red-400 font-bold">{errors.whatsapp}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-gaming font-black uppercase tracking-widest text-[#A855F7]">Type de partenariat *</Label>
                <Select value={form.partnership_type} onValueChange={(v) => set("partnership_type", v)}>
                  <SelectTrigger className={`bg-[#0A0A0F] border-[#8A2BE2]/30 focus:ring-[#8A2BE2] rounded-2xl h-12 text-white ${errors.partnership_type ? "border-red-500/70" : ""}`}>
                    <SelectValue placeholder="Choisis un type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F0F1E] border-[#8A2BE2]/40 text-white">
                    {PARTNERSHIP_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="font-bold focus:bg-[#8A2BE2]/30 focus:text-white">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.partnership_type && <p className="text-[10px] text-red-400 font-bold">{errors.partnership_type}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-gaming font-black uppercase tracking-widest text-[#A855F7]">Jeu concerné <span className="text-[#8888AA] normal-case">(si applicable)</span></Label>
                <Select value={form.game} onValueChange={(v) => set("game", v)}>
                  <SelectTrigger className="bg-[#0A0A0F] border-[#8A2BE2]/30 focus:ring-[#8A2BE2] rounded-2xl h-12 text-white">
                    <SelectValue placeholder="Non applicable" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F0F1E] border-[#8A2BE2]/40 text-white">
                    {GAMES.map((g) => (
                      <SelectItem key={g} value={g} className="font-bold focus:bg-[#8A2BE2]/30 focus:text-white">{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link" className="text-[10px] font-gaming font-black uppercase tracking-widest text-[#A855F7]">Lien site / réseau / groupe <span className="text-[#8888AA] normal-case">(si applicable)</span></Label>
                <Input
                  id="link"
                  value={form.link}
                  onChange={(e) => set("link", e.target.value)}
                  placeholder="https://…"
                  className={`bg-[#0A0A0F] border-[#8A2BE2]/30 focus-visible:border-[#8A2BE2] rounded-2xl h-12 text-white placeholder:text-[#8888AA]/60 ${errors.link ? "border-red-500/70" : ""}`}
                />
                {errors.link && <p className="text-[10px] text-red-400 font-bold">{errors.link}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="community_size" className="text-[10px] font-gaming font-black uppercase tracking-widest text-[#A855F7]">Taille de la communauté <span className="text-[#8888AA] normal-case">(si applicable)</span></Label>
                <Input
                  id="community_size"
                  value={form.community_size}
                  onChange={(e) => set("community_size", e.target.value)}
                  placeholder="Ex: 350 membres"
                  className="bg-[#0A0A0F] border-[#8A2BE2]/30 focus-visible:border-[#8A2BE2] rounded-2xl h-12 text-white placeholder:text-[#8888AA]/60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contribution" className="text-[10px] font-gaming font-black uppercase tracking-widest text-[#A855F7]">Ce que tu souhaites apporter *</Label>
              <Textarea
                id="contribution"
                value={form.contribution}
                onChange={(e) => set("contribution", e.target.value)}
                placeholder="Financement, matériel, connexion, couverture média, mobilisation de joueurs, expertise…"
                className={`bg-[#0A0A0F] border-[#8A2BE2]/30 focus-visible:border-[#8A2BE2] rounded-2xl text-white placeholder:text-[#8888AA]/60 min-h-[90px] ${errors.contribution ? "border-red-500/70" : ""}`}
              />
              {errors.contribution && <p className="text-[10px] text-red-400 font-bold">{errors.contribution}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectations" className="text-[10px] font-gaming font-black uppercase tracking-widest text-[#A855F7]">Ce que tu recherches dans la collaboration *</Label>
              <Textarea
                id="expectations"
                value={form.expectations}
                onChange={(e) => set("expectations", e.target.value)}
                placeholder="Visibilité, statut officiel, contenus, présence événementielle…"
                className={`bg-[#0A0A0F] border-[#8A2BE2]/30 focus-visible:border-[#8A2BE2] rounded-2xl text-white placeholder:text-[#8888AA]/60 min-h-[90px] ${errors.expectations ? "border-red-500/70" : ""}`}
              />
              {errors.expectations && <p className="text-[10px] text-red-400 font-bold">{errors.expectations}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-gaming font-black uppercase tracking-widest text-[#A855F7]">Budget envisagé <span className="text-[#8888AA] normal-case">(si sponsor financier, facultatif)</span></Label>
              <Select value={form.budget} onValueChange={(v) => set("budget", v)}>
                <SelectTrigger className="bg-[#0A0A0F] border-[#8A2BE2]/30 focus:ring-[#8A2BE2] rounded-2xl h-12 text-white">
                  <SelectValue placeholder="Non applicable" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F1E] border-[#8A2BE2]/40 text-white">
                  {BUDGETS.map((b) => (
                    <SelectItem key={b} value={b} className="font-bold focus:bg-[#8A2BE2]/30 focus:text-white">{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-[10px] font-gaming font-black uppercase tracking-widest text-[#A855F7]">Message / proposition détaillée *</Label>
              <Textarea
                id="message"
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder="Présente ton idée de collaboration : format, objectifs, calendrier…"
                className={`bg-[#0A0A0F] border-[#8A2BE2]/30 focus-visible:border-[#8A2BE2] rounded-2xl text-white placeholder:text-[#8888AA]/60 min-h-[130px] ${errors.message ? "border-red-500/70" : ""}`}
              />
              {errors.message && <p className="text-[10px] text-red-400 font-bold">{errors.message}</p>}
            </div>

            {submitError && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-red-500/10 border border-red-500/40 rounded-2xl p-4">
                <AlertTriangle size={18} className="text-red-400 shrink-0" />
                <p className="text-xs text-red-300 leading-relaxed flex-1">{submitError}</p>
                <a href={buildMailtoFallback()} className="shrink-0">
                  <Button type="button" variant="outline" className="bg-transparent border-red-500/50 hover:bg-red-500/10 text-red-300 rounded-2xl text-[10px] font-bold uppercase tracking-wider">
                    <Mail size={14} /> Envoyer par e-mail
                  </Button>
                </a>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="flex items-center gap-2 text-[10px] text-[#8888AA]">
                <Clock size={12} />
                Réponse sous 72h depuis {CONTACT_EMAIL}
              </p>
              <Button
                type="submit"
                disabled={sending}
                className="btn-glow-border w-full sm:w-auto px-10 py-5 text-xs font-gaming font-black tracking-widest uppercase rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Envoi en cours…
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Envoyer ma proposition
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </section>

      {/* ============ FIN DE PAGE ============ */}
      <section className="max-w-3xl mx-auto px-6 mt-24">
        <div className="esport-card-gold p-8 md:p-10 text-center space-y-5">
          <h2 className="text-xl md:text-2xl font-gaming font-black uppercase text-white">
            Vous avez une proposition différente ?
          </h2>
          <p className="text-sm text-[#8888AA] font-esport">Nous étudions également les collaborations sur mesure.</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 text-[#FFD700] font-gaming font-black text-sm hover:underline break-all"
          >
            <Mail size={16} /> {CONTACT_EMAIL}
          </a>
          <div className="pt-2">
            <a href={DOSSIER_URL} download="eGame-Benin-Dossier-Sponsoring-Partenariats-2026.pdf">
              <Button className="btn-gold rounded-2xl font-gaming font-bold text-xs uppercase tracking-wider px-8 py-5 flex items-center gap-2 mx-auto">
                <Download size={16} />
                Télécharger le dossier Sponsoring & Partenariats
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BecomePartner;
