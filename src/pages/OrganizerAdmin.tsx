import OrganizerTournamentReview from "@/components/OrganizerTournamentReview";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, ShieldAlert } from "lucide-react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { CommunityStatus, OrganizerApplication, OrganizerStatus, ORGANIZER_STATUS_LABELS } from "@/lib/organizerV2";
import { OrganizerBackendUnavailable, getAllGamingCommunitiesForAdmin, getOrganizerApplicationsForAdmin, reviewOrganizerApplication, setOrganizerCommunityStatus } from "@/lib/organizerService";

const OrganizerAdmin = () => {
  const navigate = useNavigate();
  const english = useLocation().pathname.startsWith("/en/");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backendUnavailable, setBackendUnavailable] = useState(false);
  const [applications, setApplications] = useState<OrganizerApplication[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    try {
      const [applicationRows, communityRows] = await Promise.all([getOrganizerApplicationsForAdmin(), getAllGamingCommunitiesForAdmin()]);
      setApplications(applicationRows);
      setCommunities(communityRows);
      setBackendUnavailable(false);
    } catch (error) {
      if (error instanceof OrganizerBackendUnavailable) setBackendUnavailable(true);
      else setNotice(error instanceof Error ? error.message : "Failed to load organizer data.");
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const allowed = user?.email?.toLowerCase() === "egamebenin@gmail.com";
      if (!active) return;
      setAuthorized(allowed);
      if (!allowed) { navigate(english ? "/en" : "/"); setLoading(false); return; }
      await refresh();
      if (active) setLoading(false);
    };
    void init();
    return () => { active = false; };
  }, [english, navigate]);

  const words = english
    ? { title: "Organizer applications & communities", subtitle: "Review organizer requests and oversee private communities.", back: "Back to admin", unavailable: "V2 migration is not installed on this Supabase project.", applications: "Applications", communities: "Communities", empty: "No organizer applications.", note: "Review note", placeholder: "Reason or requested information", review: "Under review", more: "Request information", approve: "Approve", reject: "Reject", suspend: "Suspend", reactivate: "Reactivate", active: "active", suspended: "suspended", archived: "archived", legalName: "Applicant", contact: "Professional contact", country: "Country", submitted: "Created", kyc: "KYC remains disabled; no identity documents or selfies are collected.", error: "Review action failed." }
    : { title: "Candidatures et communautés", subtitle: "Examine les demandes organisateur et supervise les communautés privées.", back: "Retour à l’administration", unavailable: "La migration V2 n’est pas installée sur ce projet Supabase.", applications: "Candidatures", communities: "Communautés", empty: "Aucune candidature organisateur.", note: "Note de revue", placeholder: "Motif ou informations demandées", review: "En vérification", more: "Demander des informations", approve: "Approuver", reject: "Refuser", suspend: "Suspendre", reactivate: "Réactiver", active: "active", suspended: "suspendue", archived: "archivée", legalName: "Candidat", contact: "Contact professionnel", country: "Pays", submitted: "Créée", kyc: "KYC désactivé ; aucune pièce d’identité ni selfie n’est collecté.", error: "La décision n’a pas pu être enregistrée." };
  const statusLabels = Object.fromEntries(Object.entries(ORGANIZER_STATUS_LABELS).map(([key, labels]) => [key, english ? labels.en : labels.fr])) as Record<OrganizerStatus,string>;

  const decide = async (application: OrganizerApplication, status: OrganizerStatus) => {
    setBusy(true); setNotice("");
    try {
      await reviewOrganizerApplication(application.id, status, note);
      setNotice(english ? `Application updated: ${statusLabels[status]}.` : `Candidature mise à jour : ${statusLabels[status]}.`);
      setNote("");
      await refresh();
    } catch (error) {
      if (error instanceof OrganizerBackendUnavailable) setBackendUnavailable(true);
      setNotice(error instanceof Error ? error.message : words.error);
    } finally { setBusy(false); }
  };

  const toggleCommunity = async (community: any) => {
    const status: CommunityStatus = community.status === "active" ? "suspended" : "active";
    setBusy(true); setNotice("");
    try {
      await setOrganizerCommunityStatus(community.id, status, status === "suspended" ? "Suspended by eGame administrator" : "Reactivated by eGame administrator");
      setNotice(english ? `Community ${status}.` : `Communauté ${status === "active" ? "réactivée" : "suspendue"}.`);
      await refresh();
    } catch (error) {
      if (error instanceof OrganizerBackendUnavailable) setBackendUnavailable(true);
      setNotice(error instanceof Error ? error.message : words.error);
    } finally { setBusy(false); }
  };

  if (loading) return <div className="min-h-screen bg-[#07070C]" />;
  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#07070C] pb-32 pt-24 text-white">
      <SEO title={words.title} noindex /><Navbar />
      <main className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-gaming font-black uppercase tracking-[0.2em] text-[#A855F7]">eGame V2 · Admin</p><h1 className="mt-1 text-2xl font-gaming font-black uppercase sm:text-3xl">{words.title}</h1><p className="mt-2 text-sm text-[#A0A0B8]">{words.subtitle}</p></div><Link to={english ? "/en" : "/admin"} className="inline-flex items-center gap-2 text-xs font-bold text-[#A855F7]"><ArrowLeft size={14} />{words.back}</Link></header>

        {backendUnavailable && <p role="status" className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-3 text-xs text-amber-200">{words.unavailable}</p>}
        {notice && <p role="status" className="rounded-xl border border-[#8A2BE2]/30 bg-[#8A2BE2]/10 p-3 text-xs text-[#E6D7FF]">{notice}</p>}

        <OrganizerTournamentReview />
        <section className="space-y-3"><h2 className="text-lg font-gaming font-black uppercase">{words.applications} ({applications.length})</h2>{applications.length === 0 ? <p className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-[#8888AA]">{words.empty}</p> : <div className="grid gap-4 lg:grid-cols-2">{applications.map((application) => <article key={application.id} className="min-w-0 space-y-4 rounded-2xl border border-[#8A2BE2]/25 bg-[#0F0F1E] p-5"><header className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words text-base font-gaming font-black text-white">{application.applicantName || application.email}</h3><p className="break-all text-xs text-[#8888AA]">{application.email}</p></div><span className="rounded-full border border-[#A855F7]/40 bg-[#8A2BE2]/15 px-3 py-1.5 text-[9px] font-black uppercase text-[#D6B7FF]">{statusLabels[application.status]}</span></header><div className="grid gap-2 text-xs text-[#B1B1C4] sm:grid-cols-2"><p><b className="text-[#8888AA]">{words.country}:</b> {application.country}</p><p className="break-words"><b className="text-[#8888AA]">{words.contact}:</b> {application.professionalContact}</p><p><b className="text-[#8888AA]">{words.submitted}:</b> {new Date(application.createdAt).toLocaleString(english ? "en-GB" : "fr-FR")}</p></div><div className="space-y-2"><p className="text-[10px] font-black uppercase tracking-widest text-[#8888AA]">{words.communities}</p>{application.communities.map((community) => <div key={community.id} className="space-y-1 rounded-xl bg-[#07070C] p-3 text-xs"><p className="font-bold text-white">{community.name} · {community.game}</p><p className="text-[#8888AA]">{community.size || "—"}</p><a href={community.publicUrl} target="_blank" rel="noopener noreferrer" className="block break-all text-[#A855F7] hover:underline">{community.publicUrl}</a><a href={community.responsibilityProofUrl} target="_blank" rel="noopener noreferrer" className="block break-all text-[#A855F7] hover:underline">{english ? "Responsibility proof" : "Justificatif de responsabilité"}</a></div>)}</div><p className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-[10px] leading-relaxed text-amber-200">{words.kyc}</p><button onClick={() => { setSelectedId(selectedId === application.id ? null : application.id); setNote(application.adminNote); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#8A2BE2]/40 px-4 py-2 text-[10px] font-black uppercase text-[#D6B7FF]"><Eye size={14} />{english ? "Review" : "Examiner"}</button>{selectedId === application.id && <div className="space-y-3 border-t border-white/10 pt-4"><label className="block space-y-1.5 text-[10px] font-bold text-[#B1B1C4]">{words.note}<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={words.placeholder} className="min-h-20 w-full rounded-xl border border-white/10 bg-[#07070C] px-3 py-2 text-xs text-white" /></label><div className="flex flex-wrap gap-2"><button disabled={busy} onClick={() => void decide(application,"under_review")} className="rounded-lg border border-sky-400/40 px-3 py-2 text-[9px] font-black uppercase text-sky-200">{words.review}</button><button disabled={busy} onClick={() => void decide(application,"more_info_requested")} className="rounded-lg border border-amber-400/40 px-3 py-2 text-[9px] font-black uppercase text-amber-200">{words.more}</button><button disabled={busy} onClick={() => void decide(application,"approved")} className="rounded-lg bg-emerald-600 px-3 py-2 text-[9px] font-black uppercase text-white">{words.approve}</button><button disabled={busy} onClick={() => void decide(application,"rejected")} className="rounded-lg border border-red-400/40 px-3 py-2 text-[9px] font-black uppercase text-red-200">{words.reject}</button>{application.status === "approved" && <button disabled={busy} onClick={() => void decide(application,"suspended")} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-[9px] font-black uppercase text-white"><ShieldAlert size={12} />{words.suspend}</button>}</div><ol className="space-y-1 text-[10px] text-[#8888AA]"><p className="font-bold uppercase tracking-wider">{english ? "Decision history" : "Historique des décisions"}</p>{application.decisions.map((decision, index) => <li key={`${decision.createdAt}-${index}`}>{new Date(decision.createdAt).toLocaleString(english ? "en-GB" : "fr-FR")} · {statusLabels[decision.status]}{decision.note ? ` — ${decision.note}` : ""}</li>)}</ol></div>}</article>)}</div>}</section>

        <section className="space-y-3"><h2 className="text-lg font-gaming font-black uppercase">{words.communities} ({communities.length})</h2>{communities.length === 0 ? <p className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-[#8888AA]">{english ? "No communities yet." : "Aucune communauté pour le moment."}</p> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{communities.map((community) => <article key={community.id} className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0F0F1E] p-4"><div className="min-w-0"><p className="break-words text-sm font-bold text-white">{community.name}</p><p className="text-[10px] text-[#A855F7]">{community.game} · {community.status}</p></div><button disabled={busy} onClick={() => void toggleCommunity(community)} className="shrink-0 rounded-lg border border-amber-400/30 px-2.5 py-2 text-[9px] font-black uppercase text-amber-200">{community.status === "active" ? words.suspend : words.reactivate}</button></article>)}</div>}</section>
      </main>
    </div>
  );
};

export default OrganizerAdmin;
