import { useSiteLanguage, translate, useLocalePath } from '@/lib/siteLanguage';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { ORGANIZER_GAMES } from "@/lib/organizerV2";

type Team = { id: string; name: string; game_key: string; captain_id: string };
type Member = { team_id: string; user_id: string; status: string };
type TeamSetting = { tournament_id: string; team_size: number; enabled: boolean };
type Tournament = { id: string; title: string; game: string; entry_fee: number | null; status: string };
type Registration = { id: string; team_id: string; tournament_id: string; status: string; submitted_at: string };

const input = "w-full rounded-xl border border-[#8A2BE2]/30 bg-[#080810] px-4 py-3 text-sm text-white focus:border-[#A855F7] focus:outline-none";
const action = "rounded-xl bg-[#8A2BE2] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40";

const Teams = () => {
  const language = useSiteLanguage();
  const t = (value: string) => translate(value, language);
  const localizedLinkPath = useLocalePath();
  const [me, setMe] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [players, setPlayers] = useState<Record<string,string>>({});
  const [settings, setSettings] = useState<TeamSetting[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [teamName, setTeamName] = useState("");
  const [game, setGame] = useState("COD Mobile");
  const [invites, setInvites] = useState<Record<string,string>>({});
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMe(null); setLoading(false); return; }
    setMe(user.id);
    const [t, m, s, tournamentsResult, r] = await Promise.all([
      supabase.from("gaming_teams").select("id,name,game_key,captain_id"),
      supabase.from("gaming_team_members").select("team_id,user_id,status"),
      supabase.from("team_tournament_settings").select("tournament_id,team_size,enabled").eq("enabled",true),
      supabase.from("tournaments").select("id,title,game,entry_fee,status").order("created_at",{ascending:false}),
      supabase.from("team_tournament_registrations").select("id,team_id,tournament_id,status,submitted_at"),
    ]);
    const firstError = t.error || m.error || s.error || tournamentsResult.error || r.error;
    if (firstError) { setError(firstError.message); setLoading(false); return; }
    setTeams((t.data || []) as Team[]);
    const memberRows = (m.data || []) as Member[];
    setMembers(memberRows);
    setSettings((s.data || []) as TeamSetting[]);
    setTournaments((tournamentsResult.data || []) as Tournament[]);
    setRegistrations((r.data || []) as Registration[]);
    const ids = [...new Set(memberRows.map(item => item.user_id))];
    if (ids.length) {
      const { data } = await supabase.from("profiles").select("id,username").in("id",ids);
      setPlayers(Object.fromEntries((data || []).map((p: any) => [p.id,p.username || "Joueur"])));
    }
    setLoading(false);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const run = async (call: () => PromiseLike<{error: any}>, success: string) => {
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await call();
      if (result.error) throw result.error;
      setMessage(success);
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Opération impossible."); }
    finally { setBusy(false); }
  };

  const create = (event: FormEvent) => {
    event.preventDefault();
    if (teamName.trim().length < 3) return;
    void run(() => supabase.rpc("egame_create_team",{p_name:teamName.trim(),p_game_key:game}),"Équipe créée. Invite maintenant tes joueurs.");
    setTeamName("");
  };
  const myTeams = useMemo(() => teams.filter(t => t.captain_id === me || members.some(m => m.team_id === t.id && m.user_id === me && m.status === "active")), [teams,members,me]);
  const pendingTeams = useMemo(() => teams.filter(t => members.some(m => m.team_id === t.id && m.user_id === me && m.status === "pending")), [teams,members,me]);

  if (loading) return <div className="min-h-screen bg-[#07070C] text-center pt-32 text-white">{t("Chargement des équipes…")}</div>;
  return <div className="min-h-screen bg-[#07070C] pb-28 pt-24 text-white">
    <SEO title="Mes équipes — eGame Bénin" noindex />
    <Navbar />
    <main className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6">
      <header><p className="text-xs font-bold text-[#A855F7]">eGAME BÉNIN · ÉQUIPES</p>
        <h1 className="mt-2 font-gaming text-3xl font-black">{t("Mes équipes")}</h1>
        <p className="mt-2 text-sm text-[#AAAACC]">Crée ton équipe, invite tes coéquipiers et demande son inscription aux compétitions par équipes.</p>
        <Link to={localizedLinkPath("/profil")} className="mt-3 inline-block text-xs text-[#C5A2FF] underline">{t("← Retour à mon profil")}</Link>
      </header>
      {!me && <section className="rounded-2xl border border-white/10 p-6">Connecte-toi pour gérer tes équipes. <Link to={localizedLinkPath("/auth")} className="text-[#C5A2FF] underline">Se connecter</Link></section>}
      {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}
      {message && <p role="status" className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-200">{message}</p>}
      {me && <>
        <section className="rounded-2xl border border-[#8A2BE2]/30 bg-[#0F0F1E] p-5">
          <h2 className="font-gaming text-lg font-black">{t("Créer une équipe")}</h2>
          <form onSubmit={create} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input aria-label="Nom de l'équipe" required minLength={3} maxLength={60} placeholder="Nom de l'équipe" className={input} value={teamName} onChange={e=>setTeamName(e.target.value)} />
            <select aria-label="Jeu" value={game} onChange={e=>setGame(e.target.value)} className={input}>{ORGANIZER_GAMES.map(g=><option key={g}>{g}</option>)}</select>
            <button disabled={busy} type="submit" className={action}>{t("Créer")}</button>
          </form>
        </section>
        {pendingTeams.length>0 && <section className="space-y-3"><h2 className="font-gaming text-xl font-black">{t("Invitations reçues")}</h2>
          {pendingTeams.map(t=><article key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#8A2BE2]/30 bg-[#0F0F1E] p-4">
            <span className="text-sm font-bold">{t.name} · {t.game_key}</span>
            <div className="flex gap-2"><button disabled={busy} className={action} onClick={()=>void run(()=>supabase.rpc("egame_respond_team_invite",{p_team_id:t.id,p_accept:true}),"Invitation acceptée.")}>Accepter</button>
            <button disabled={busy} className="rounded-xl border border-red-400/40 px-3 py-2 text-xs text-red-200" onClick={()=>void run(()=>supabase.rpc("egame_respond_team_invite",{p_team_id:t.id,p_accept:false}),"Invitation refusée.")}>Refuser</button></div>
          </article>)}
        </section>}
        <section className="space-y-4"><h2 className="font-gaming text-xl font-black">Équipes ({myTeams.length})</h2>
          {!myTeams.length && <p className="text-sm text-[#AAAACC]">{t("Tu n'as pas encore d'équipe.")}</p>}
          {myTeams.map(t=>{
            const roster = members.filter(m=>m.team_id===t.id && m.status!=="removed" && m.status!=="declined");
            const captain = t.captain_id===me;
            const available = settings.filter(s=>s.enabled).map(s=>({setting:s,tournament:tournaments.find(x=>x.id===s.tournament_id)}))
              .filter((x):x is {setting:TeamSetting;tournament:Tournament}=>!!x.tournament && x.tournament.game.toLowerCase()===t.game_key.toLowerCase() && Number(x.tournament.entry_fee)===0);
            const teamRegistrations = registrations.filter(r=>r.team_id===t.id);
            return <article key={t.id} className="space-y-4 rounded-2xl border border-[#8A2BE2]/30 bg-[#0F0F1E] p-5">
              <header><h3 className="font-gaming text-lg font-black">{t.name}</h3><p className="text-xs text-[#AAAACC]">{t.game_key} · {captain?"Tu es capitaine":"Membre"}</p></header>
              <div className="space-y-2"><h4 className="text-xs font-bold uppercase text-[#C5A2FF]">{t("Membres")}</h4>
                {roster.map(m=><div key={m.user_id} className="flex items-center justify-between gap-2 rounded-lg bg-[#080810] px-3 py-2 text-xs">
                  <span>@{players[m.user_id] || "Joueur"} {m.user_id===t.captain_id?"· capitaine":""} · {m.status==="pending"?"invité":"actif"}</span>
                  {(captain && m.user_id!==t.captain_id || m.user_id===me && !captain) &&
                    <button disabled={busy} className="text-red-300 underline" onClick={()=>void run(()=>supabase.rpc("egame_remove_team_member",{p_team_id:t.id,p_user_id:m.user_id}),"Membre retiré.")}>Retirer</button>}
                </div>)}
              </div>
              {captain && <div className="space-y-2"><h4 className="text-xs font-bold uppercase text-[#C5A2FF]">{t("Inviter un joueur par pseudo")}</h4>
                <div className="flex gap-2"><input value={invites[t.id]||""} onChange={e=>setInvites(old=>({...old,[t.id]:e.target.value}))} placeholder="Pseudo eGame" className={input} />
                  <button disabled={busy||!invites[t.id]?.trim()} className={action} onClick={()=>void run(()=>supabase.rpc("egame_invite_team_member",{p_team_id:t.id,p_username:invites[t.id].trim()}),"Invitation envoyée.")}>Inviter</button></div>
              </div>}
              {captain && <div className="space-y-3 border-t border-white/10 pt-4"><h4 className="text-sm font-bold">{t("Tournois disponibles pour cette équipe")}</h4>
                {!available.length && <p className="text-xs text-[#AAAACC]">Aucun tournoi par équipes gratuit n'est ouvert pour ce jeu actuellement. Les tournois payants nécessitent un paiement collectif sécurisé et ne sont pas encore accessibles ici.</p>}
                {available.map(({setting,tournament})=>{
                  const registered=teamRegistrations.find(r=>r.tournament_id===tournament.id);
                  const count=roster.filter(m=>m.status==="active").length;
                  return <div key={tournament.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 p-3">
                    <div><p className="text-sm font-bold">{tournament.title}</p>
                      <p className="text-xs text-[#AAAACC]">Format {setting.team_size} joueurs · {count}/{setting.team_size} joueurs actifs</p>
                      {registered && <p className="text-xs text-amber-200">Demande enregistrée : {registered.status==="pending_review"?"en attente de validation":registered.status}</p>}
                    </div>
                    {!registered && <button disabled={busy||count!==setting.team_size} className={action}
                      onClick={()=>void run(()=>supabase.rpc("egame_request_team_registration",{p_team_id:t.id,p_tournament_id:tournament.id}),"Demande d'inscription transmise. Elle ne constitue pas un ticket ; l'équipe reste en attente de validation.")}>Demander l'inscription</button>}
                  </div>;
                })}
              </div>}
            </article>;
          })}
        </section>
      </>}
    </main>
  </div>;
};
export default Teams;
