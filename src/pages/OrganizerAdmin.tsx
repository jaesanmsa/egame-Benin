import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, ShieldAlert } from "lucide-react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { CommunityStatus, loadOrganizerDemoState, OrganizerApplication, OrganizerDemoState, OrganizerStatus, saveOrganizerDemoState } from "@/lib/organizerV2";
import OrganizerV2Notice from "@/components/OrganizerV2Notice";

const OrganizerAdmin = () => {
  const navigate = useNavigate();
  const english = useLocation().pathname.startsWith("/en/");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<OrganizerDemoState>(() => loadOrganizerDemoState());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const isAdmin = user?.email?.toLowerCase() === "egamebenin@gmail.com";
      setAuthorized(isAdmin);
      if (!isAdmin) navigate(english ? "/en" : "/");
      setLoading(false);
    });
    const refresh = () => setState(loadOrganizerDemoState());
    window.addEventListener("egame-organizer-demo-updated", refresh);
    return () => window.removeEventListener("egame-organizer-demo-updated", refresh);
  }, [english, navigate]);

  const words = english
    ? { title: "Organizer applications & communities", subtitle: "Review local demo requests and oversee demo communities.", back: "Back to admin", empty: "No demo applications in this browser.", applicant: "Applicant", country: "Country", contact: "Professional contact", requested: "Requested communities", proof: "Responsibility proof", link: "Verification link", kyc: "KYC is disabled until a secure provider is approved. No identity documents or selfies are collected.", note: "Review note", notePlaceholder: "Reason or information requested", review: "Under review", info: "Request information", approve: "Approve", reject: "Reject", suspend: "Suspend", resume: "Reactivate", active: "Active", suspended: "Suspended", archived: "Archived", demo: "Preview data only. No production applications or communities are read or changed." }
    : { title: "Candidatures et communautés", subtitle: "Examine les demandes de démonstration et supervise les communautés locales.", back: "Retour à l’administration", empty: "Aucune candidature de démonstration dans ce navigateur.", applicant: "Candidat", country: "Pays", contact: "Contact professionnel", requested: "Communautés demandées", proof: "Justificatif de responsabilité", link: "Lien de vérification", kyc: "KYC désactivé jusqu’à validation d’un prestataire sécurisé. Aucune pièce d’identité ni selfie n’est collecté.", note: "Note de revue", notePlaceholder: "Motif ou informations demandées", review: "En vérification", info: "Demander des informations", approve: "Approuver", reject: "Refuser", suspend: "Suspendre", resume: "Réactiver", active: "Active", suspended: "Suspendue", archived: "Archivée", demo: "Données de prévisualisation uniquement. Aucune candidature ni communauté de production n’est consultée ou modifiée." };

  const persist = (next: OrganizerDemoState) => { saveOrganizerDemoState(next); setState(next); };

  const decide = (application: OrganizerApplication, status: OrganizerStatus) => {
    const now = new Date().toISOString();
    const updated: OrganizerApplication = {
      ...application,
      status,
      adminNote: note.trim(),
      updatedAt: now,
      decisions: [...application.decisions, { status, note: note.trim(), actor: "admin-demo", createdAt: now }],
    };
    let communities = state.communities;
    if (status === "approved") {
      const availableSlots = Math.max(0, 2 - communities.filter((item) => item.organizerUserId === application.userId && item.status === "active").length);
      const created = application.communities.slice(0, availableSlots).map((item) => ({
        id: `community-demo-${Date.now().toString(36)}-${item.id}`,
        applicationId: application.id,
        name: item.name,
        game: item.game,
        organizerUserId: application.userId,
        status: "active" as CommunityStatus,
        createdAt: now,
      }));
      communities = [...communities, ...created];
    }
    if (status === "suspended") {
      communities = communities.map((community) => community.organizerUserId === application.userId && community.status === "active"
        ? { ...community, status: "suspended" as const }
        : community);
    }
    persist({ ...state, communities, applications: state.applications.map((item) => item.id === application.id ? updated : item) });
    setSelectedId(application.id);
    setNotice(english ? `Demo decision saved: ${status}.` : `Décision de démonstration enregistrée : ${status}.`);
    setNote("");
  };

  const setCommunityStatus = (id: string, status: CommunityStatus) => {
    persist({ ...state, communities: state.communities.map((community) => community.id === id ? { ...community, status } : community) });
    setNotice(english ? "Demo community status updated." : "Statut de communauté de démonstration mis à jour.");
  };

  const labels: Record<OrganizerStatus, string> = english
    ? { draft: "Draft", submitted: "Submitted", under_review: "Under review", more_info_requested: "More information requested", approved: "Approved", rejected: "Rejected", suspended: "Suspended" }
    : { draft: "Brouillon", submitted: "Soumise", under_review: "En vérification", more_info_requested: "Informations demandées", approved: "Approuvée", rejected: "Refusée", suspended: "Suspendue" };

  if (loading || !authorized) return <div className="min-h-screen bg-[#07070C]" />;

  return (
    <div className="min-h-screen bg-[#07070C] pb-32 pt-24 text-white">
      <SEO title={words.title} noindex />
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-[10px] font-gaming font-black uppercase tracking-[0.2em] text-[#A855F7]">eGame V2 · Admin</p><h1 className="mt-1 text-2xl font-gaming font-black uppercase sm:text-3xl">{words.title}</h1><p className="mt-2 text-sm text-[#A0A0B8]">{words.subtitle}</p></div>
          <Link to={english ? "/en" : "/admin"} className="inline-flex items-center gap-2 text-xs font-bold text-[#A855F7]"><ArrowLeft size={14} />{words.back}</Link>
        </header>
        <OrganizerV2Notice english={english} />
        {notice && <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">{notice}</p>}

        <section className="space-y-3">
          <h2 className="text-lg font-gaming font-black uppercase">{english ? "Applications" : "Candidatures"} ({state.applications.length})</h2>
          {!state.applications.length ? <p className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-[#8888AA]">{words.empty}</p> : <div className="grid gap-4 lg:grid-cols-2">{state.applications.map((application) => (
            <article key={application.id} className="min-w-0 space-y-4 rounded-2xl border border-[#8A2BE2]/25 bg-[#0F0F1E] p-5">
              <header className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words text-base font-gaming font-black text-white">{application.applicantName || application.email}</h3><p className="break-all text-xs text-[#8888AA]">{application.email}</p></div><span className="rounded-full border border-[#A855F7]/40 bg-[#8A2BE2]/15 px-3 py-1.5 text-[9px] font-black uppercase text-[#D6B7FF]">{labels[application.status]}</span></header>
              <div className="grid gap-2 text-xs text-[#B1B1C4] sm:grid-cols-2"><p><b className="text-[#8888AA]">{words.country}:</b> {application.country || "—"}</p><p className="break-words"><b className="text-[#8888AA]">{words.contact}:</b> {application.professionalContact || "—"}</p></div>
              <div className="space-y-2"><p className="text-[10px] font-black uppercase tracking-widest text-[#8888AA]">{words.requested}</p>{application.communities.map((community) => <div key={community.id} className="space-y-1 rounded-xl bg-[#07070C] p-3 text-xs"><p className="font-bold text-white">{community.name} · {community.game}</p><p className="text-[#8888AA]">{community.size || "—"}</p><a href={community.publicUrl} target="_blank" rel="noopener noreferrer" className="block break-all text-[#A855F7] hover:underline">{words.link}: {community.publicUrl}</a><a href={community.responsibilityProofUrl} target="_blank" rel="noopener noreferrer" className="block break-all text-[#A855F7] hover:underline">{words.proof}</a></div>)}</div>
              <p className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-[10px] leading-relaxed text-amber-200">{words.kyc}</p>
              <button onClick={() => { setSelectedId(selectedId === application.id ? null : application.id); setNote(application.adminNote); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#8A2BE2]/40 px-4 py-2 text-[10px] font-black uppercase text-[#D6B7FF]"><Eye size={14} />{english ? "Review" : "Examiner"}</button>
              {selectedId === application.id && <div className="space-y-3 border-t border-white/10 pt-4"><label className="block space-y-1.5 text-[10px] font-bold text-[#B1B1C4]">{words.note}<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={words.notePlaceholder} className="min-h-20 w-full rounded-xl border border-white/10 bg-[#07070C] px-3 py-2 text-xs text-white" /></label><div className="flex flex-wrap gap-2"><button onClick={() => decide(application,"under_review")} className="rounded-lg border border-sky-400/40 px-3 py-2 text-[9px] font-black uppercase text-sky-200">{words.review}</button><button onClick={() => decide(application,"more_info_requested")} className="rounded-lg border border-amber-400/40 px-3 py-2 text-[9px] font-black uppercase text-amber-200">{words.info}</button><button onClick={() => decide(application,"approved")} className="rounded-lg bg-emerald-600 px-3 py-2 text-[9px] font-black uppercase text-white">{words.approve}</button><button onClick={() => decide(application,"rejected")} className="rounded-lg border border-red-400/40 px-3 py-2 text-[9px] font-black uppercase text-red-200">{words.reject}</button>{application.status === "approved" && <button onClick={() => decide(application,"suspended")} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-[9px] font-black uppercase text-white"><ShieldAlert size={12} />{words.suspend}</button>}</div><div className="space-y-1 text-[10px] text-[#8888AA]"><p className="font-bold uppercase tracking-wider">{english ? "Decision history" : "Historique des décisions"}</p>{application.decisions.map((decision, index) => <p key={`${decision.createdAt}-${index}`}>{new Date(decision.createdAt).toLocaleString(english ? "en-GB" : "fr-FR")} · {labels[decision.status]} · {decision.actor}{decision.note ? ` — ${decision.note}` : ""}</p>)}</div></div>}
            </article>
          ))}</div>}
        </section>

        <section className="space-y-3"><h2 className="text-lg font-gaming font-black uppercase">{english ? "Community oversight" : "Supervision des communautés"} ({state.communities.length})</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{state.communities.map((community) => <article key={community.id} className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0F0F1E] p-4"><div className="min-w-0"><p className="break-words text-sm font-bold text-white">{community.name}</p><p className="text-[10px] text-[#A855F7]">{community.game} · {english ? community.status : community.status === "active" ? words.active : community.status === "suspended" ? words.suspended : words.archived}</p></div>{community.status === "active" ? <button onClick={() => setCommunityStatus(community.id,"suspended")} className="shrink-0 rounded-lg border border-red-400/30 px-2.5 py-2 text-[9px] font-black uppercase text-red-200">{words.suspend}</button> : <button onClick={() => setCommunityStatus(community.id,"active")} className="shrink-0 rounded-lg border border-emerald-400/30 px-2.5 py-2 text-[9px] font-black uppercase text-emerald-200">{words.resume}</button>}</article>)}</div></section>
      </main>
    </div>
  );
};

export default OrganizerAdmin;
