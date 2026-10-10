import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
type Tournament = {id:string;title:string;game:string;entry_fee:number|null};
type Settings = {tournament_id:string;team_size:number;enabled:boolean};
type Registration = {id:string;tournament_id:string;team_id:string;status:string;captain_id:string;roster_snapshot:string[]};
const TeamTournamentAdmin = () => {
  const [authorized,setAuthorized]=useState(false);
  const [loading,setLoading]=useState(true);
  const [tournaments,setTournaments]=useState<Tournament[]>([]);
  const [settings,setSettings]=useState<Settings[]>([]);
  const [registrations,setRegistrations]=useState<Registration[]>([]);
  const [sizes,setSizes]=useState<Record<string,number>>({});
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const refresh=useCallback(async()=>{
    const {data:{user}}=await supabase.auth.getUser();
    if (!user || user.email?.toLowerCase()!=="egamebenin@gmail.com") {setAuthorized(false);setLoading(false);return;}
    setAuthorized(true);
    const [t,s,r]=await Promise.all([
      supabase.from("tournaments").select("id,title,game,entry_fee").order("created_at",{ascending:false}),
      supabase.from("team_tournament_settings").select("tournament_id,team_size,enabled"),
      supabase.from("team_tournament_registrations").select("id,tournament_id,team_id,status,captain_id,roster_snapshot").order("submitted_at",{ascending:false}),
    ]);
    if (t.error||s.error||r.error) setError((t.error||s.error||r.error)?.message||"Erreur de chargement.");
    setTournaments((t.data||[]) as Tournament[]);
    setSettings((s.data||[]) as Settings[]);
    setRegistrations((r.data||[]) as Registration[]);
    setLoading(false);
  },[]);
  useEffect(()=>{void refresh();},[refresh]);
  const run=async(fn:()=>PromiseLike<{error:any}>, success:string)=>{
    setBusy(true);setError("");setNotice("");
    try{const result=await fn();if(result.error)throw result.error;setNotice(success);await refresh();}
    catch(e){setError(e instanceof Error?e.message:"Échec de l'opération.");}
    finally{setBusy(false);}
  };
  if (loading)return <div className="min-h-screen bg-[#07070C] pt-32 text-center text-white">Chargement…</div>;
  if (!authorized)return <div className="min-h-screen bg-[#07070C] pt-32 text-center text-white"><Navbar/>Accès réservé à l'administration eGame.</div>;
  return <div className="min-h-screen bg-[#07070C] pb-28 pt-24 text-white"><Navbar/><SEO title="Équipes & inscriptions — Administration" noindex/>
    <main className="mx-auto max-w-5xl space-y-7 px-4">
      <Link className="text-xs text-[#C5A2FF] underline" to="/admin">← Tableau de bord</Link>
      <header><h1 className="font-gaming text-2xl font-black">Tournois par équipes</h1>
      <p className="mt-2 text-xs text-[#AAAACC]">Active un format d'équipe pour les tournois gratuits. Les paiements et tickets existants restent indépendants : l'approbation d'une demande collective ne crée pas de ticket.</p></header>
      {error&&<p role="alert" className="rounded-xl bg-red-900/30 p-4 text-red-200">{error}</p>}
      {notice&&<p role="status" className="rounded-xl bg-green-900/30 p-4 text-green-200">{notice}</p>}
      <section className="space-y-3"><h2 className="font-gaming text-xl">Configurer les inscriptions collectives</h2>
        {tournaments.map(t=>{
          const setting=settings.find(s=>s.tournament_id===t.id);
          const size=sizes[t.id]||setting?.team_size||5;
          const free=Number(t.entry_fee)===0;
          return <article key={t.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#8A2BE2]/30 bg-[#0F0F1E] p-4">
            <div><p className="text-sm font-bold">{t.title}</p><p className="text-xs text-[#AAAACC]">{t.game} · {free?"Gratuit":"Payant — collectif indisponible"} · {setting?.enabled?"équipes activées":"non activé"}</p></div>
            <div className="flex items-center gap-2">
              <label className="text-xs">Joueurs <select className="ml-2 rounded-md bg-[#080810] p-2" value={size} onChange={e=>setSizes(old=>({...old,[t.id]:Number(e.target.value)}))}>{[2,3,4,5,6,7,8,9,10].map(i=><option key={i}>{i}</option>)}</select></label>
              <button disabled={busy||!free} className="rounded-xl bg-[#8A2BE2] px-3 py-2 text-xs font-bold disabled:opacity-30"
               onClick={()=>void run(()=>supabase.rpc("egame_configure_team_tournament",{p_tournament_id:t.id,p_team_size:size,p_enabled:!setting?.enabled}),"Format mis à jour.")}>{setting?.enabled?"Désactiver":"Activer"}</button>
            </div>
          </article>;
        })}
      </section>
      <section className="space-y-3"><h2 className="font-gaming text-xl">Demandes d'inscription ({registrations.length})</h2>
        {!registrations.length&&<p className="text-sm text-[#AAAACC]">Aucune demande reçue.</p>}
        {registrations.map(r=><article key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0F0F1E] p-4">
          <div><p className="text-sm font-bold">{tournaments.find(t=>t.id===r.tournament_id)?.title||r.tournament_id}</p>
            <p className="text-xs text-[#AAAACC]">Équipe {r.team_id.slice(0,8)} · {r.roster_snapshot?.length||0} joueurs · {r.status}</p>
          </div>
          {r.status==="pending_review"&&<div className="flex gap-2">
            <button disabled={busy} className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold" onClick={()=>void run(()=>supabase.rpc("egame_review_team_registration",{p_registration_id:r.id,p_approve:true}),"Demande approuvée, sans attribution de ticket individuel.")}>Approuver</button>
            <button disabled={busy} className="rounded-xl border border-red-500/40 px-3 py-2 text-xs text-red-200" onClick={()=>void run(()=>supabase.rpc("egame_review_team_registration",{p_registration_id:r.id,p_approve:false}),"Demande refusée.")}>Refuser</button>
          </div>}
        </article>)}
      </section>
    </main>
  </div>;
};
export default TeamTournamentAdmin;