"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Handshake, Mail, Phone, Users, Link2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { showError, showSuccess } from "@/utils/toast";

const STATUSES = ["nouveau", "en cours", "traité"];

const STATUS_COLORS: Record<string, string> = {
  "nouveau": "bg-violet-100 text-violet-700 border-violet-300",
  "en cours": "bg-amber-100 text-amber-700 border-amber-300",
  "traité": "bg-emerald-100 text-emerald-700 border-emerald-300",
};

interface PartnershipRequest {
  id: string;
  full_name: string;
  organization: string;
  email: string;
  whatsapp: string;
  partnership_type: string;
  game: string | null;
  link: string | null;
  community_size: string | null;
  contribution: string;
  expectations: string;
  budget: string | null;
  message: string;
  status: string;
  created_at: string;
}

const PartnershipsTab = () => {
  const [requests, setRequests] = useState<PartnershipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("tous");

  const fetchRequests = async () => {
    setLoading(true);
    let query = supabase.from("partnership_requests").select("*").order("created_at", { ascending: false });
    if (statusFilter !== "tous") query = query.eq("status", statusFilter);
    const { data, error } = await query;
    if (error) showError("Impossible de charger les partenariats : " + error.message);
    setRequests((data as PartnershipRequest[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("partnership_requests").update({ status }).eq("id", id);
    if (error) showError(error.message);
    else {
      showSuccess("Statut mis à jour !");
      setRequests((r) => r.map((req) => (req.id === id ? { ...req, status } : req)));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-card p-6 md:p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-black flex items-center gap-3">
            <Handshake className="text-violet-500" /> Demandes de partenariat
          </h2>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-muted/50 border-border rounded-xl py-4 text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="font-bold capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchRequests} variant="outline" className="rounded-xl py-4 px-4" aria-label="Rafraîchir">
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Aucune demande de partenariat pour le moment.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((r) => (
              <div key={r.id} className="bg-muted/30 border border-border rounded-3xl p-5 md:p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white bg-violet-600 px-3 py-1 rounded-full">
                        {r.partnership_type}
                      </span>
                      {r.game && (
                        <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-300 px-3 py-1 rounded-full">
                          {r.game}
                        </span>
                      )}
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${STATUS_COLORS[r.status] ?? ""}`}>
                        {r.status}
                      </span>
                    </div>
                    <h3 className="font-black text-base">{r.organization}</h3>
                    <p className="text-xs text-muted-foreground">{r.full_name} • {new Date(r.created_at).toLocaleString("fr-FR")}</p>
                  </div>
                  <div className="shrink-0">
                    <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                      <SelectTrigger className="w-36 bg-muted/50 border-border rounded-xl py-3 text-xs font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="font-bold capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <a href={`mailto:${r.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors break-all">
                    <Mail size={13} className="shrink-0 text-violet-500" /> {r.email}
                  </a>
                  <span className="flex items-center gap-2 text-muted-foreground break-all">
                    <Phone size={13} className="shrink-0 text-violet-500" /> {r.whatsapp}
                  </span>
                  {r.community_size && (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Users size={13} className="shrink-0 text-violet-500" /> {r.community_size}
                    </span>
                  )}
                  {r.link && (
                    <a href={r.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-violet-600 hover:underline break-all">
                      <Link2 size={13} className="shrink-0" /> {r.link}
                    </a>
                  )}
                  {r.budget && (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      💰 {r.budget}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-background/60 rounded-2xl p-3 space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-violet-500">Apport</p>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{r.contribution}</p>
                  </div>
                  <div className="bg-background/60 rounded-2xl p-3 space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-violet-500">Attendu</p>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{r.expectations}</p>
                  </div>
                  <div className="bg-background/60 rounded-2xl p-3 space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-violet-500">Message</p>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{r.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PartnershipsTab;
