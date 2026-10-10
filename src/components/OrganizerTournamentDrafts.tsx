import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import type { GamingCommunity } from "@/lib/organizerV2";

type Draft = { id: string; community_id: string; title: string; format_label: string; status: string; admin_note: string | null; planned_start_at: string | null };
const inputClass = "w-full rounded-xl border border-[#8A2BE2]/40 bg-[#07070C] px-4 py-3 text-sm text-white";

export default function OrganizerTournamentDrafts({ communities }: { communities: GamingCommunity[] }) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [communityId, setCommunityId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState("1v1");
  const [start, setStart] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    const { data, error: requestError } = await supabase.from("organizer_tournament_drafts")
      .select("id,community_id,title,format_label,status,admin_note,planned_start_at")
      .order("created_at", { ascending: false });
    if (requestError) { setError(requestError.message); return; }
    setDrafts((data ?? []) as Draft[]);
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!communities.some(c => c.id === communityId && c.status === "active"))
      setCommunityId(communities.find(c => c.status === "active")?.id ?? "");
  }, [communities, communityId]);
  const create = async (event: FormEvent) => {
    event.preventDefault();
    if (!communityId || busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const { error: rpcError } = await supabase.rpc("create_organizer_tournament_draft", {
        p_community_id: communityId, p_title: title.trim(), p_description: description.trim(),
        p_format_label: format.trim(), p_start_at: start ? new Date(start).toISOString() : null
      });
      if (rpcError) throw rpcError;
      setTitle(""); setDescription(""); setStart("");
      setNotice("Brouillon enregistré. Tu peux maintenant le soumettre à l'équipe eGame.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Création impossible."); }
    finally { setBusy(false); }
  };
  const submit = async (id: string) => {
    setBusy(true); setError(""); setNotice("");
    try {
      const { error: rpcError } = await supabase.rpc("submit_organizer_tournament_draft", { p_draft_id: id });
      if (rpcError) throw rpcError;
      setNotice("Proposition transmise pour examen par eGame Bénin.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Envoi impossible."); }
    finally { setBusy(false); }
  };
  if (!communities.some(c => c.status === "active")) return null;
  return <section className="space-y-4">
    <header><h2 className="font-gaming text-xl font-black uppercase">Proposer un tournoi</h2>
      <p className="mt-2 text-sm text-[#A0A0B8]">Prépare une compétition pour ta communauté. Une proposition n'est ni un tournoi public, ni une inscription payante. Seule eGame Bénin peut l'activer après validation.</p>
    </header>
    {error && <p role="alert" className="rounded-xl border border-red-500/40 p-3 text-xs text-red-200">{error}</p>}
    {notice && <p role="status" className="rounded-xl border border-green-500/40 p-3 text-xs text-green-200">{notice}</p>}
    <form onSubmit={create} className="space-y-3 rounded-2xl border border-[#8A2BE2]/30 bg-[#0F0F1E] p-5">
      <label className="block space-y-1 text-xs">Communauté
        <select className={inputClass} required value={communityId} onChange={e=>setCommunityId(e.target.value)}>
          {communities.filter(c=>c.status==="active").map(c=><option key={c.id} value={c.id}>{c.name} — {c.game}</option>)}
        </select>
      </label>
      <label className="block space-y-1 text-xs">Nom du tournoi
        <input className={inputClass} required minLength={5} maxLength={120} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex. Duel des champions" />
      </label>
      <label className="block space-y-1 text-xs">Format de compétition
        <input className={inputClass} required minLength={2} maxLength={60} value={format} onChange={e=>setFormat(e.target.value)} placeholder="Ex. 5v5" />
      </label>
      <label className="block space-y-1 text-xs">Date souhaitée (facultatif, heure locale)
        <input className={inputClass} type="datetime-local" value={start} onChange={e=>setStart(e.target.value)} />
      </label>
      <label className="block space-y-1 text-xs">Description (facultatif)
        <textarea className={inputClass} value={description} onChange={e=>setDescription(e.target.value)} maxLength={1500} rows={3} />
      </label>
      <button type="submit" disabled={busy||!communityId} className="rounded-xl bg-[#8A2BE2] px-5 py-3 text-xs font-black disabled:opacity-50">{busy?"Enregistrement…":"Créer le brouillon"}</button>
    </form>
    {drafts.length > 0 && <div className="space-y-3"><h3 className="font-gaming text-base font-black">Mes propositions</h3>
      {drafts.map(d=><article key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0F0F1E] p-4">
        <div><p className="font-bold">{d.title}</p><p className="text-xs text-[#A0A0B8]">{d.format_label} · {d.status === "pending_review" ? "En examen" : d.status === "rejected" ? "À corriger" : d.status === "approved" ? "Approuvée (non publiée)" : "Brouillon"}</p>
          {d.admin_note && <p className="mt-1 text-xs text-amber-200">{d.admin_note}</p>}
        </div>
        {(d.status==="draft"||d.status==="rejected")&&<button disabled={busy} onClick={()=>void submit(d.id)} className="rounded-xl border border-[#A855F7]/50 px-3 py-2 text-xs text-[#D6B7FF] disabled:opacity-50">Soumettre à eGame</button>}
      </article>)}
    </div>}
  </section>;
}