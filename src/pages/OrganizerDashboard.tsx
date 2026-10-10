import { useSiteLanguage, translate, useLocalePath } from '@/lib/siteLanguage';
import OrganizerTournamentDrafts from "@/components/OrganizerTournamentDrafts";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Gamepad2, Hash, ShieldCheck, Users, UserRoundPlus, RotateCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { OrganizerBackendUnavailable, getCommunityInvitations, getCommunityMemberships, getOrganizerCommunities, getMyOrganizerApplication, inviteCommunityMember, removeCommunityMember, respondCommunityInvitation, CommunityInvitation, GamingCommunity } from "@/lib/organizerService";

const OrganizerDashboard = () => {
  const language = useSiteLanguage();
  const t = (text: string) => translate(text, language);
  const localizedLinkPath = useLocalePath();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [backendUnavailable, setBackendUnavailable] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [communities, setCommunities] = useState<GamingCommunity[]>([]);
  const [invitations, setInvitations] = useState<CommunityInvitation[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [usernameQueries, setUsernameQueries] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  const refresh = async (userId: string) => {
    setRefreshing(true);
    try {
      const [communityRows, invitationRows, membershipRows, application] = await Promise.all([
        getOrganizerCommunities(), getCommunityInvitations(), getCommunityMemberships(), getMyOrganizerApplication(),
      ]);
      setCommunities(communityRows);
      setInvitations(invitationRows);
      setMemberships(membershipRows);
      setApplicationStatus(application?.status ?? null);
      setBackendUnavailable(false);
    } catch (error) {
      if (error instanceof OrganizerBackendUnavailable) setBackendUnavailable(true);
      else setNotice(error instanceof Error ? error.message : "Impossible de charger les données organisateur.");
      setApplicationStatus(null);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      const { data: { user: current } } = await supabase.auth.getUser();
      if (!active) return;
      setUser(current);
      if (!current) { setLoading(false); return; }
      await refresh(current.id);
    };
    void init();
    return () => { active = false; };
  }, []);

  const ownedCommunities = useMemo(() => communities.filter((community) => community.organizerUserId === user?.id), [communities, user?.id]);
  const receivedInvitations = useMemo(() => invitations.filter((invitation) => invitation.invitedUserId === user?.id && invitation.status === "pending"), [invitations, user?.id]);
  const organizerInvitations = useMemo(() => invitations.filter((invitation) => invitation.organizerUserId === user?.id), [invitations, user?.id]);
  const activeCommunities = ownedCommunities.filter((community) => community.status === "active");
  const approved = !backendUnavailable && applicationStatus === "approved";
  const suspended = applicationStatus === "suspended";

  const setQuery = (id: string, value: string) => setUsernameQueries((current) => ({ ...current, [id]: value }));
  const invite = async (communityId: string) => {
    const query = usernameQueries[communityId]?.trim();
    if (!query) return;
    setErrors((current) => ({ ...current, [communityId]: "" }));
    try {
      await inviteCommunityMember(communityId, query);
      setNotice(`Invitation envoyée à @${query}. Le joueur doit l’accepter avant de devenir membre.`);
      setQuery(communityId, "");
      await refresh(user.id);
    } catch (error) {
      if (error instanceof OrganizerBackendUnavailable) setBackendUnavailable(true);
      setErrors((current) => ({ ...current, [communityId]: error instanceof Error ? error.message : "Invitation impossible." }));
    }
  };

  const respond = async (invitationId: string, accept: boolean) => {
    try {
      await respondCommunityInvitation(invitationId, accept);
      setNotice(accept ? "Invitation acceptée." : "Invitation refusée.");
      await refresh(user.id);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Réponse à l’invitation impossible.");
    }
  };

  const removeMember = async (membershipId: string) => {
    if (!window.confirm("Retirer ce membre de la communauté ? Cette action sera historisée.")) return;
    try {
      await removeCommunityMember(membershipId, "Retrait par l’organisateur depuis le tableau de bord.");
      setNotice("Membre retiré. L’action a été enregistrée côté serveur.");
      await refresh(user.id);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Retrait impossible.");
    }
  };

  if (loading) return <div className="min-h-screen bg-[#07070C]" />;
  if (!user) return <div className="min-h-screen bg-[#07070C] px-5 pt-32 text-center text-white"><Navbar /><p className="font-gaming">{t("Connecte-toi à eGame Bénin.")}</p><Link to={localizedLinkPath("/auth")} className="mt-4 inline-flex rounded-xl bg-[#8A2BE2] px-5 py-3 text-xs font-black uppercase">Connexion</Link></div>;

  return (
    <div className="min-h-screen bg-[#07070C] pb-32 pt-24 text-white">
      <SEO title="Espace organisateur" noindex /><Navbar />
      <main className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-gaming font-black uppercase tracking-[0.2em] text-[#A855F7]">eGame V2</p><h1 className="mt-1 text-2xl font-gaming font-black uppercase sm:text-3xl">{t("Mes communautés")}</h1><p className="mt-2 text-sm text-[#A0A0B8]">Gère les communautés approuvées, les membres et les invitations reçues.</p></div><button onClick={() => void refresh(user.id)} disabled={refreshing} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#8A2BE2]/40 px-4 py-2 text-xs font-bold text-[#D6B7FF] disabled:opacity-50"><RotateCw size={14} className={refreshing ? "animate-spin" : ""} /> Actualiser</button></header>
        <div className={`flex gap-3 rounded-2xl border p-4 ${backendUnavailable ? "border-amber-500/35 bg-amber-500/10" : "border-emerald-500/30 bg-emerald-500/5"}`}><ShieldCheck size={18} className={`mt-0.5 shrink-0 ${backendUnavailable ? "text-amber-400" : "text-emerald-400"}`} /><div><p className="text-xs font-black text-white">{backendUnavailable ? "Backend V2 non installé sur l’environnement connecté" : "Données chargées depuis Supabase"}</p><p className="mt-1 text-[11px] leading-relaxed text-[#B1B1C4]">{backendUnavailable ? "La migration préparée n’est pas appliquée sur le projet Supabase lié. Les créations, invitations et décisions sont donc désactivées : aucune fausse donnée n’est affichée." : "Les communautés et invitations visibles sont filtrées par RLS et les opérations d’écriture passent par les RPC serveur."}</p></div></div>
        {notice && <p role="status" className="rounded-xl border border-[#8A2BE2]/30 bg-[#8A2BE2]/10 p-3 text-xs text-[#E6D7FF]">{notice}</p>}
        {Object.values(errors).some(Boolean) && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">{Object.values(errors).filter(Boolean).join(" · ")}</p>}

            {receivedInvitations.length > 0 && <section className="space-y-3"><h2 className="text-lg font-gaming font-black uppercase">{t("Invitations à traiter")}</h2>{receivedInvitations.map((invitation) => <article key={invitation.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#8A2BE2]/25 bg-[#0F0F1E] p-4"><div><p className="text-sm font-bold text-white">{invitation.communityName}</p><p className="text-xs text-[#8888AA]">{invitation.game} · de @{invitation.invitedUsername}</p></div><div className="flex gap-2"><button disabled={backendUnavailable} onClick={() => void respond(invitation.id, true)} className="rounded-xl bg-emerald-600 px-3 py-2 text-[10px] font-black uppercase text-white disabled:opacity-40">Accepter</button><button disabled={backendUnavailable} onClick={() => void respond(invitation.id, false)} className="rounded-xl border border-red-400/40 px-3 py-2 text-[10px] font-black uppercase text-red-200 disabled:opacity-40">Refuser</button></div></article>)}</section>}
        {!approved || suspended ? <section className="space-y-3 rounded-3xl border border-[#8A2BE2]/30 bg-[#0F0F1E] p-6"><h2 className="text-lg font-gaming font-black">{suspended ? "Accès organisateur suspendu" : "Accès réservé aux organisateurs approuvés"}</h2><p className="text-sm text-[#A0A0B8]">Statut de candidature : {applicationStatus || "aucune candidature"}. Les demandes n’accordent pas de permissions avant approbation eGame.</p><Link to={localizedLinkPath("/devenir-organisateur")} className="inline-flex min-h-11 items-center rounded-xl bg-[#8A2BE2] px-5 py-3 text-xs font-gaming font-black uppercase">Ouvrir ma candidature</Link></section> : (
          <>
            <section className="grid gap-3 sm:grid-cols-3"><Stat label="Communautés actives" value={`${activeCommunities.length}/2`} /><Stat label="Invitations envoyées" value={organizerInvitations.length} /><Stat label="Invitations reçues" value={receivedInvitations.length} /></section>

            <section className="space-y-3"><h2 className="text-lg font-gaming font-black uppercase">Mes communautés ({activeCommunities.length}/2 actives)</h2>{ownedCommunities.length === 0 ? <Empty message="Aucune communauté active ne t’est attribuée pour le moment." /> : <div className="grid gap-4 lg:grid-cols-2">{ownedCommunities.map((community) => <CommunityPanel key={community.id} community={community} memberships={memberships.filter((membership) => membership.community_id === community.id)} query={usernameQueries[community.id] || ""} error={errors[community.id] || ""} disabled={backendUnavailable || community.status !== "active"} onQuery={(value) => setQuery(community.id, value)} onInvite={() => void invite(community.id)} onRemove={(membershipId) => void removeMember(membershipId)} />)}</div>}</section>
          </>
        )}
        {approved && <OrganizerTournamentDrafts communities={ownedCommunities} />}
        <section className="space-y-3"><h2 className="text-lg font-gaming font-black uppercase">{t("Outils organisateur")}</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><FutureCard icon={CalendarDays} title="Mes tournois" /><FutureCard icon={Gamepad2} title="Créer un tournoi" /><FutureCard icon={Users} title="Mes équipes" /><FutureCard icon={Hash} title="Inscriptions et tickets" /><FutureCard icon={ShieldCheck} title="Résultats et contestations" /></div></section>
      </main>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string | number }) => <div className="rounded-2xl border border-[#8A2BE2]/25 bg-[#0F0F1E] p-4"><p className="text-[10px] uppercase tracking-widest text-[#8888AA]">{label}</p><p className="mt-1 text-2xl font-gaming font-black text-white">{value}</p></div>;
const Empty = ({ message }: { message: string }) => <p className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-[#8888AA]">{message}</p>;
const FutureCard = ({ icon: Icon, title }: { icon: typeof CalendarDays; title: string }) => <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0F0F1E] p-4 opacity-70"><Icon size={18} className="text-[#A855F7]" /><div><p className="text-sm font-bold text-white">{title}</p><p className="text-[10px] text-[#8888AA]">Fonctionnalité en préparation</p></div></div>;

const CommunityPanel = ({ community, memberships, query, error, disabled, onQuery, onInvite, onRemove }: { community: GamingCommunity; memberships: any[]; query: string; error: string; disabled: boolean; onQuery: (value: string) => void; onInvite: () => void; onRemove: (id: string) => void }) => (
  <article className="min-w-0 space-y-4 rounded-3xl border border-[#8A2BE2]/25 bg-[#0F0F1E] p-5">
    <header className="flex min-w-0 items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words text-base font-gaming font-black text-white">{community.name}</h3><p className="mt-1 flex items-center gap-1 text-xs text-[#A855F7]"><Gamepad2 size={13} />{community.game}</p></div><span className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase ${community.status === "active" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-200"}`}>{community.status}</span></header>
    <div className="space-y-2"><p className="text-[10px] font-black uppercase tracking-widest text-[#8888AA]">{t("Inviter par pseudo eGame")}</p><div className="flex gap-2"><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Pseudo eGame" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#07070C] px-3 py-2.5 text-xs text-white" /><button disabled={disabled || !query.trim()} onClick={onInvite} className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#8A2BE2] px-3 py-2 text-[10px] font-black uppercase text-white disabled:opacity-40"><UserRoundPlus size={13} /> Inviter</button></div>{error && <p className="text-[10px] text-red-300" role="alert">{error}</p>}</div>
    <div className="space-y-2"><p className="text-[10px] font-black uppercase tracking-widest text-[#8888AA]">Membres acceptés ({memberships.filter((item) => item.status === "active").length})</p>{memberships.filter((item) => item.status === "active").length === 0 ? <p className="text-xs text-[#77778F]">Aucun membre n’a accepté pour le moment.</p> : memberships.filter((item) => item.status === "active").map((membership) => <div key={membership.id} className="flex items-center justify-between gap-2 rounded-xl bg-[#07070C] px-3 py-2"><span className="min-w-0 truncate text-xs text-white">@{membership.profiles?.username || membership.profiles?.full_name || "Joueur eGame"}</span><button disabled={disabled} onClick={() => onRemove(membership.id)} className="shrink-0 text-[9px] font-bold uppercase text-red-300 disabled:opacity-40">Retirer</button></div>)}</div>
  </article>
);

export default OrganizerDashboard;
