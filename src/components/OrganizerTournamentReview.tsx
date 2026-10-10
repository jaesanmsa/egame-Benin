import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
type Draft = { id:string; title:string; game_key:string; format_label:string; planned_start_at:string|null; description:string|null; status:string; admin_note:string|null };
export default function OrganizerTournamentReview() {
  const [drafts,setDrafts]=useState<Draft[]>([]);
  const [notes,setNotes]=useState<Record<string,string>>({});
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const load=useCallback(async()=>{
    const {data,error:readError}=await supabase.from("organizer_tournament_drafts")
      .select("id,title,game_key,format_label,planned_start_at,description,status,admin_note")
      .order("created_at",{ascending:false});
    if(readError){setError(readError.message);return;}
    setDrafts((data||[]) as Draft[]);
  },[]);
  useEffect(()=>{void load();},[load]);
  const decide=async(id:string,approve:boolean)=>{
    setBusy(true);setError("");setNotice("");
    try {
      const {error:rpcError}=await supabase.rpc("review_organizer_tournament_draft",{
        p_draft_id:id,p_approve:approve,p_note:notes[id]?.trim()||null
      });
      if(rpcError)throw rpcError;
      setNotice(approve?"Proposition approuvée. Elle n'est pas encore publiée : la création effective du tournoi reste une étape séparée.":"Proposition refusée. L'organisateur peut la soumettre de nouveau.");
      await load();
    } catch(cause){setError(cause instanceof Error?cause.message:"Impossible d'enregistrer la décision.");}
    finally{setBusy(false);}
  };
  return <section className="space-y-4">
    <h2 className="font-gaming text-lg font-black uppercase">Propositions de tournois communautaires</h2>
    <p className="text-xs text-[#AAAACC]">L'approbation valide une proposition, sans créer automatiquement de tournoi public, d'inscription ni de paiement.</p>
    {error&&<p role="alert" className="rounded-xl bg-red-500/10 p-3 text-xs text-red-200">{error}</p>}
    {notice&&<p role="status" className="rounded-xl bg-green-500/10 p-3 text-xs text-green-200">{notice}</p>}
    {!drafts.length&&<p className="rounded-xl border border-white/10 p-4 text-xs text-[#AAAACC]">Aucune proposition reçue.</p>}
    <div className="grid gap-3 lg:grid-cols-2">
      {drafts.map(d=><article key={d.id} className="space-y-3 rounded-2xl border border-[#8A2BE2]/30 bg-[#0F0F1E] p-5">
        <p className="font-gaming text-base font-black">{d.title}</p>
        <p className="text-xs text-[#AAAACC]">{d.game_key} · {d.format_label} · {d.status}</p>
        {d.planned_start_at&&<p className="text-xs text-[#AAAACC]">Début souhaité : {new Date(d.planned_start_at).toLocaleString("fr-FR",{timeZone:"Africa/Porto-Novo"})}</p>}
        {d.description&&<p className="text-sm text-[#DDDDF0]">{d.description}</p>}
        {d.admin_note&&<p className="text-xs text-amber-200">Dernière note : {d.admin_note}</p>}
        {d.status==="pending_review"&&<>
          <textarea aria-label="Note pour l'organisateur" placeholder="Note éventuelle pour l'organisateur" rows={2}
            value={notes[d.id]||""} onChange={e=>setNotes(old=>({...old,[d.id]:e.target.value}))}
            className="w-full rounded-xl border border-white/20 bg-[#07070C] p-3 text-xs text-white"/>
          <div className="flex flex-wrap gap-2">
            <button disabled={busy} onClick={()=>void decide(d.id,true)} className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold disabled:opacity-50">Approuver la proposition</button>
            <button disabled={busy} onClick={()=>void decide(d.id,false)} className="rounded-lg border border-red-500/50 px-4 py-2 text-xs text-red-200 disabled:opacity-50">Refuser</button>
          </div>
        </>}
      </article>)}
    </div>
  </section>;
}