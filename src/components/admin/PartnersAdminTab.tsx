"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Handshake, Plus, Pencil, Trash2, Eye, EyeOff, BadgeCheck, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { showError, showSuccess } from "@/utils/toast";

const CATEGORIES = [
  { value: "sponsor", label: "Sponsor financier" },
  { value: "technique", label: "Partenaire technique & technologique" },
  { value: "media", label: "Partenaire média & institutionnel" },
  { value: "communautaire", label: "Partenaire communautaire / Collaborateur eSport" },
];

const GAMES = ["Free Fire", "Blood Strike", "eFootball Mobile", "COD Mobile", "Clash Royale", "Clash of Clans", "PUBG Mobile", "Mobile Legends", "Brawl Stars"];

const emptyPartner = {
  id: "",
  name: "",
  category: "",
  game: "",
  logo_url: "",
  link_url: "",
  description: "",
  is_official: false,
  visible: true,
  sort_order: 0,
};

interface Partner {
  id: string;
  name: string;
  category: string;
  game: string | null;
  logo_url: string | null;
  link_url: string | null;
  description: string | null;
  is_official: boolean;
  visible: boolean;
  sort_order: number;
}

const PartnersAdminTab = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<typeof emptyPartner | null>(null);

  const fetchPartners = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("partners").select("*").order("sort_order").order("created_at");
    if (error) showError("Impossible de charger les partenaires : " + error.message);
    setPartners((data as Partner[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const startNew = () => setEditing({ ...emptyPartner });
  const startEdit = (p: Partner) =>
    setEditing({
      id: p.id,
      name: p.name,
      category: p.category,
      game: p.game ?? "",
      logo_url: p.logo_url ?? "",
      link_url: p.link_url ?? "",
      description: p.description ?? "",
      is_official: p.is_official,
      visible: p.visible,
      sort_order: p.sort_order,
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.name.trim() || !editing.category) {
      showError("Le nom et la catégorie sont obligatoires.");
      return;
    }
    const row = {
      name: editing.name.trim(),
      category: editing.category,
      game: editing.game || null,
      logo_url: editing.logo_url.trim() || null,
      link_url: editing.link_url.trim() || null,
      description: editing.description.trim() || null,
      is_official: editing.is_official,
      visible: editing.visible,
      sort_order: Number(editing.sort_order) || 0,
    };

    const { error } = editing.id
      ? await supabase.from("partners").update(row).eq("id", editing.id)
      : await supabase.from("partners").insert([row]);

    if (error) {
      showError("Enregistrement impossible : " + error.message);
      return;
    }
    showSuccess(editing.id ? "Partenaire mis à jour !" : "Partenaire ajouté !");
    setEditing(null);
    fetchPartners();
  };

  const remove = async (p: Partner) => {
    if (!window.confirm(`Supprimer définitivement « ${p.name} » ?`)) return;
    const { error } = await supabase.from("partners").delete().eq("id", p.id);
    if (error) showError(error.message);
    else {
      showSuccess("Partenaire supprimé.");
      fetchPartners();
    }
  };

  const quickToggle = async (p: Partner, field: "visible" | "is_official", value: boolean) => {
    setPartners((list) => list.map((x) => (x.id === p.id ? { ...x, [field]: value } : x)));
    const { error } = await supabase.from("partners").update({ [field]: value }).eq("id", p.id);
    if (error) {
      showError("Mise à jour impossible : " + error.message);
      fetchPartners();
    } else {
      showSuccess(value
        ? (field === "visible" ? "Partenaire affiché publiquement." : "Partenaire marqué officiel ✅")
        : (field === "visible" ? "Partenaire masqué du site." : "Badge officiel retiré."));
    }
  };

  const catLabel = (v: string) => CATEGORIES.find((c) => c.value === v)?.label ?? v;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Formulaire (création / édition) */}
      {editing && (
        <form onSubmit={handleSubmit} className="bg-card p-6 md:p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-3">
              {editing.id ? <Pencil className="text-violet-500" /> : <Plus className="text-violet-500" />}
              {editing.id ? "Modifier le partenaire" : "Nouveau partenaire"}
            </h2>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)} aria-label="Fermer"><X size={18} /></Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Nom officiel *</Label>
              <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="py-6 bg-muted/50 border-border rounded-xl" placeholder="Ex: Groupe XYZ" required />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Type de partenariat *</Label>
              <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                <SelectTrigger className="py-6 bg-muted/50 border-border rounded-xl"><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="font-bold">{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Jeu concerné <span className="text-muted-foreground normal-case">(communautaires)</span></Label>
              <Select value={editing.game} onValueChange={(v) => setEditing({ ...editing, game: v === "aucun" ? "" : v })}>
                <SelectTrigger className="py-6 bg-muted/50 border-border rounded-xl"><SelectValue placeholder="Aucun" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aucun" className="font-bold">Aucun</SelectItem>
                  {GAMES.map((g) => (
                    <SelectItem key={g} value={g} className="font-bold">{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">URL du logo</Label>
              <Input value={editing.logo_url} onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })} className="py-6 bg-muted/50 border-border rounded-xl" placeholder="https://… (laisser vide pour l'initiale)" />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Lien public (site / communauté)</Label>
              <Input value={editing.link_url} onChange={(e) => setEditing({ ...editing, link_url: e.target.value })} className="py-6 bg-muted/50 border-border rounded-xl" placeholder="https://… (si autorisé)" />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Ordre d'affichage</Label>
              <Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} className="py-6 bg-muted/50 border-border rounded-xl" />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Courte description</Label>
              <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="bg-muted/50 border-border rounded-2xl min-h-[80px] p-4" placeholder="Ce que cette organisation apporte à eGame Bénin…" />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3">
              <Switch id="official" checked={editing.is_official} onCheckedChange={(v) => setEditing({ ...editing, is_official: v })} />
              <Label htmlFor="official" className="text-xs font-bold cursor-pointer">
                Badge « Officiel » — uniquement si un accord a été conclu
              </Label>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3">
              <Switch id="visible" checked={editing.visible} onCheckedChange={(v) => setEditing({ ...editing, visible: v })} />
              <Label htmlFor="visible" className="text-xs font-bold cursor-pointer">
                Afficher sur le site
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 py-6 rounded-2xl font-black text-sm">
            {editing.id ? "Enregistrer les modifications" : "Ajouter le partenaire"}
          </Button>
        </form>
      )}

      {/* Liste */}
      <div className="bg-card p-6 md:p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-black flex items-center gap-3">
            <Handshake className="text-violet-500" /> Partenaires & communautés
          </h2>
          <div className="flex items-center gap-3">
            <Button onClick={fetchPartners} variant="outline" className="rounded-xl py-4 px-4" aria-label="Rafraîchir"><RefreshCw size={16} /></Button>
            <Button onClick={startNew} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-4 px-5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Plus size={15} /> Ajouter
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 bg-muted/50 rounded-2xl animate-pulse" />)}
          </div>
        ) : partners.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Aucun partenaire enregistré.<br />
            Ajoute tes sponsors, partenaires techniques, médias et communautés — ils apparaîtront sur la page d'accueil.
          </div>
        ) : (
          <div className="space-y-3">
            {partners.map((p) => (
              <div key={p.id} className={`flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border p-4 ${p.visible ? "bg-muted/30 border-border" : "bg-muted/10 border-dashed border-border opacity-70"}`}>
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-violet-500/10 border border-border flex items-center justify-center shrink-0">
                    {p.logo_url ? (
                      <img src={p.logo_url} alt="" className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="font-black text-lg text-violet-500">{p.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black text-sm truncate">{p.name}</p>
                      {p.is_official && <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">Officiel</span>}
                      {!p.visible && <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full">Masqué</span>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {catLabel(p.category)}{p.game ? ` • ${p.game}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button onClick={() => quickToggle(p, "visible", !p.visible)} variant="outline" size="sm" className="rounded-xl" aria-label={p.visible ? "Masquer" : "Afficher"}>
                    {p.visible ? <EyeOff size={15} /> : <Eye size={15} />}
                  </Button>
                  <Button onClick={() => quickToggle(p, "is_official", !p.is_official)} variant="outline" size="sm" className={`rounded-xl ${p.is_official ? "text-emerald-600 border-emerald-300" : ""}`} aria-label="Basculer officiel">
                    <BadgeCheck size={15} />
                  </Button>
                  <Button onClick={() => startEdit(p)} variant="outline" size="sm" className="rounded-xl" aria-label="Modifier"><Pencil size={15} /></Button>
                  <Button onClick={() => remove(p)} variant="outline" size="sm" className="rounded-xl text-red-600 border-red-200 hover:bg-red-50" aria-label="Supprimer"><Trash2 size={15} /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PartnersAdminTab;
