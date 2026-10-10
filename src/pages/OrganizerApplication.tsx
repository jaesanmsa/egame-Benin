import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, CheckCircle2, FileCheck2, Plus, ShieldCheck, Trash2, UserRound } from "lucide-react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { ORGANIZER_GAMES, OrganizerApplication, OrganizerStatus, RequestedCommunity, ORGANIZER_STATUS_LABELS } from "@/lib/organizerV2";
import { getMyOrganizerApplication, OrganizerBackendUnavailable, submitOrganizerApplication } from "@/lib/organizerService";

const blankCommunity = (): RequestedCommunity => ({ id: crypto.randomUUID(), name: "", game: "", size: "", publicUrl: "", responsibilityProofUrl: "" });

const OrganizerApplicationPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [application, setApplication] = useState<OrganizerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendUnavailable, setBackendUnavailable] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [country, setCountry] = useState("");
  const [professionalContact, setProfessionalContact] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [communities, setCommunities] = useState<RequestedCommunity[]>([blankCommunity()]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const refreshApplication = async () => {
    try {
      const current = await getMyOrganizerApplication();
      setApplication(current);
      setBackendUnavailable(false);
      if (current) {
        setApplicantName(current.applicantName);
        setCountry(current.country);
        setProfessionalContact(current.professionalContact);
        setTermsAccepted(current.termsAccepted);
        if (current.communities.length) setCommunities(current.communities);
      }
    } catch (err) {
      if (err instanceof OrganizerBackendUnavailable) setBackendUnavailable(true);
      else setError(err instanceof Error ? err.message : "Impossible de charger la candidature.");
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      const { data: { user: current } } = await supabase.auth.getUser();
      if (!active) return;
      setUser(current);
      if (!current) { setLoading(false); return; }
      setApplicantName(current.user_metadata?.full_name || "");
      setCountry(current.user_metadata?.country || "");
      await refreshApplication();
      if (active) setLoading(false);
    };
    void init();
    return () => { active = false; };
  }, []);

  const updateCommunity = (id: string, key: keyof RequestedCommunity, value: string) => setCommunities((items) => items.map((item) => item.id === id ? { ...item, [key]: value } : item));
  const removeCommunity = (id: string) => setCommunities((items) => items.length > 1 ? items.filter((item) => item.id !== id) : items);

  const saveApplication = async (event: FormEvent, submit: boolean) => {
    event.preventDefault();
    setError(""); setSuccess(false);
    if (!user) { navigate("/auth"); return; }
    if (backendUnavailable) { setError("Le schéma V2 n’est pas installé sur le projet Supabase actuellement connecté. Aucune donnée n’a été envoyée."); return; }
    if (application && application.status !== "draft" && application.status !== "rejected") {
      setError("Ta candidature est déjà en cours d’examen ou approuvée. Consulte son statut ci-dessus avant d’en soumettre une autre.");
      return;
    }
    if (communities.length < 1 || communities.length > 2) { setError("Renseigne une ou deux communautés au maximum."); return; }
    if (communities.some((item) => !item.name.trim() || !item.game || !item.publicUrl.trim() || !item.responsibilityProofUrl.trim())) {
      setError("Pour chaque communauté, renseigne le nom, le jeu, le lien public et le justificatif de responsabilité."); return;
    }
    if (new Set(communities.map((item) => item.game)).size !== communities.length) { setError("Choisis deux jeux différents pour tes communautés."); return; }
    if (!applicantName.trim() || !country.trim() || !professionalContact.trim() || !termsAccepted) {
      setError("Complète ton identité, ton pays et ton contact professionnel. Accepte les conditions pour poursuivre."); return;
    }

    setSubmitting(true);
    try {
      await submitOrganizerApplication({ legalName: applicantName.trim(), country: country.trim(), professionalContact: professionalContact.trim(), communities, termsAccepted }, submit);
      await refreshApplication();
      setSuccess(true);
    } catch (err) {
      if (err instanceof OrganizerBackendUnavailable) setBackendUnavailable(true);
      setError(err instanceof Error ? err.message : "La candidature n’a pas pu être enregistrée.");
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen bg-[#07070C]" />;
  if (!user) return <div className="min-h-screen bg-[#07070C] px-5 pt-32 text-center text-white"><Navbar /><h1 className="font-gaming text-xl font-black">Connecte-toi à eGame Bénin</h1><Link to="/auth" className="mt-5 inline-flex rounded-xl bg-[#8A2BE2] px-5 py-3 text-xs font-black uppercase">Connexion</Link></div>;

  const inputClass = "w-full min-w-0 rounded-xl border border-[#8A2BE2]/30 bg-[#07070C] px-4 py-3 text-sm text-white placeholder:text-[#77778F] focus:border-[#A855F7] focus:outline-none";
  const statusLabel = application ? ORGANIZER_STATUS_LABELS[application.status].fr : null;
  const canEdit = !application || application.status === "draft" || application.status === "rejected";

  return (
    <div className="min-h-screen bg-[#07070C] pb-32 pt-24 text-white">
      <SEO title="Devenir organisateur eGame Bénin" noindex /><Navbar />
      <main className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6">
        <Link to="/profil" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8888AA] hover:text-white"><ArrowLeft size={15} /> Retour au profil</Link>
        <header className="space-y-2"><p className="text-[10px] font-gaming font-black uppercase tracking-[0.2em] text-[#A855F7]">Programme organisateur</p><h1 className="text-2xl font-gaming font-black uppercase sm:text-3xl">Devenir organisateur</h1><p className="max-w-2xl text-sm leading-relaxed text-[#A0A0B8]">Présente tes communautés gaming. L’administration eGame examinera ta demande avant toute attribution de permissions.</p></header>
        <div className={`flex gap-3 rounded-2xl border p-4 ${backendUnavailable ? "border-amber-500/35 bg-amber-500/10" : "border-[#8A2BE2]/30 bg-[#0F0F1E]"}`}><FileCheck2 size={18} className={`mt-0.5 shrink-0 ${backendUnavailable ? "text-amber-400" : "text-[#A855F7]"}`} /><div className="space-y-1"><p className="text-xs font-black text-white">{backendUnavailable ? "Migration V2 non appliquée sur l’environnement connecté" : "Candidature reliée au service Supabase"}</p><p className="text-[11px] leading-relaxed text-[#B1B1C4]">{backendUnavailable ? "Aucune candidature ne peut être envoyée pour le moment. Les tables/RPC V2 n’existent pas encore dans Supabase sur ce projet." : "La candidature est sauvegardée dans Supabase. Les permissions ne sont accordées qu’après validation administrative."} La collecte KYC est désactivée ; aucun document sensible n’est demandé.</p></div></div>

        {application && <section className="rounded-2xl border border-[#8A2BE2]/30 bg-[#0F0F1E] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-widest text-[#8888AA]">Candidature Supabase</p><p className="mt-1 text-sm font-bold text-white">{application.applicantName || application.email}</p></div><span className="rounded-full border border-[#A855F7]/40 bg-[#8A2BE2]/15 px-3 py-1.5 text-[10px] font-black uppercase text-[#D6B7FF]">{statusLabel}</span></div>{application.adminNote && <p className="mt-3 text-xs text-amber-200">Message de l’administration : {application.adminNote}</p>}{application.decisions.length > 0 && <ol className="mt-4 space-y-1 border-t border-white/10 pt-3 text-[10px] text-[#8888AA]">{application.decisions.map((item, index) => <li key={`${item.createdAt}-${index}`}>{new Date(item.createdAt).toLocaleString("fr-FR")} · {ORGANIZER_STATUS_LABELS[item.status].fr}{item.note ? ` — ${item.note}` : ""}</li>)}</ol>}</section>}
        {success && <div className="flex gap-3 rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-4 text-sm text-emerald-200"><CheckCircle2 className="shrink-0" size={18} />{application?.status === "draft" ? "Brouillon sauvegardé dans Supabase." : "Candidature soumise à l’administration eGame."}</div>}
        {error && <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">{error}</div>}

        <form onSubmit={(event) => void saveApplication(event, true)} className="space-y-6 rounded-3xl border border-[#8A2BE2]/30 bg-[#0F0F1E] p-4 sm:p-7">
          <section className="space-y-4"><h2 className="flex items-center gap-2 text-sm font-gaming font-black uppercase"><UserRound size={17} className="text-[#A855F7]" /> Responsable</h2><div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-xs text-[#B1B1C4]">Nom et prénom légaux *<input disabled={!canEdit || backendUnavailable} required value={applicantName} onChange={(event) => setApplicantName(event.target.value)} className={inputClass} autoComplete="name" /></label>
            <label className="space-y-1.5 text-xs text-[#B1B1C4]">Pays de résidence *<input disabled={!canEdit || backendUnavailable} required value={country} onChange={(event) => setCountry(event.target.value)} className={inputClass} autoComplete="country-name" placeholder="Ex. Bénin" /></label>
            <label className="space-y-1.5 text-xs text-[#B1B1C4] sm:col-span-2">Contact professionnel *<input disabled={!canEdit || backendUnavailable} required value={professionalContact} onChange={(event) => setProfessionalContact(event.target.value)} className={inputClass} placeholder="E-mail ou numéro professionnel" /></label>
          </div></section>
          <section className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-sm font-gaming font-black uppercase"><Building2 size={17} className="text-[#A855F7]" /> Communautés (1–2 maximum)</h2><span className="text-[10px] font-bold text-[#8888AA]">La limite serveur est fixée à deux communautés actives.</span></div>
            {communities.map((community, index) => <fieldset key={community.id} disabled={!canEdit || backendUnavailable} className="min-w-0 space-y-4 rounded-2xl border border-white/10 bg-[#0A0A0F] p-4 sm:p-5"><legend className="px-2 text-[10px] font-black uppercase tracking-wider text-[#A855F7]">Communauté {index + 1}</legend>{communities.length > 1 && <button type="button" onClick={() => removeCommunity(community.id)} aria-label="Retirer cette communauté" className="ml-auto flex items-center gap-1 text-[10px] text-red-300"><Trash2 size={13} /> Retirer</button>}<div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5 text-xs text-[#B1B1C4]">Nom de la communauté *<input required value={community.name} onChange={(event) => updateCommunity(community.id,"name",event.target.value)} className={inputClass} /></label><label className="space-y-1.5 text-xs text-[#B1B1C4]">Jeu associé *<select required value={community.game} onChange={(event) => updateCommunity(community.id,"game",event.target.value)} className={inputClass}><option value="">Sélectionner</option>{ORGANIZER_GAMES.map((game) => <option key={game} value={game} className="bg-[#0F0F1E]">{game}</option>)}</select></label><label className="space-y-1.5 text-xs text-[#B1B1C4]">Taille approximative<input value={community.size} onChange={(event) => updateCommunity(community.id,"size",event.target.value)} className={inputClass} placeholder="Ex. environ 80 membres" /></label><label className="space-y-1.5 text-xs text-[#B1B1C4]">Lien public de vérification *<input required type="url" value={community.publicUrl} onChange={(event) => updateCommunity(community.id,"publicUrl",event.target.value)} className={inputClass} placeholder="https://…" /></label><label className="space-y-1.5 text-xs text-[#B1B1C4] sm:col-span-2">Lien vers un justificatif de responsabilité *<input required type="url" value={community.responsibilityProofUrl} onChange={(event) => updateCommunity(community.id,"responsibilityProofUrl",event.target.value)} className={inputClass} placeholder="Lien de vérification, sans document d’identité" /></label></div></fieldset>)}
            {communities.length < 2 && canEdit && !backendUnavailable && <button type="button" onClick={() => setCommunities((items) => [...items, blankCommunity()])} className="inline-flex items-center gap-2 rounded-xl border border-[#A855F7]/40 px-4 py-2.5 text-xs font-bold text-[#D6B7FF] hover:bg-[#8A2BE2]/10"><Plus size={15} /> Ajouter une communauté</button>}
          </section>
          <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#0A0A0F] p-4 text-xs leading-relaxed text-[#B1B1C4]"><input disabled={!canEdit || backendUnavailable} type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-0.5 accent-[#8A2BE2]" /><span>J’accepte les conditions d’organisation des tournois et comprends que mes permissions ne seront attribuées qu’après approbation administrative.</span></label>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={submitting || backendUnavailable || !canEdit} onClick={(event) => void saveApplication(event, false)} className="min-h-11 rounded-xl border border-white/15 px-5 py-3 text-xs font-bold text-[#B1B1C4] disabled:opacity-50">Enregistrer le brouillon</button><button type="submit" disabled={submitting || backendUnavailable || !canEdit} className="min-h-11 rounded-xl bg-[#8A2BE2] px-6 py-3 text-xs font-gaming font-black uppercase tracking-wider text-white hover:bg-[#9B4DEB] disabled:opacity-50">{submitting ? "Envoi…" : "Soumettre la candidature"}</button></div>
          <div className="flex items-start gap-2 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-[#8888AA]"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#A855F7]" />KYC préparé mais inactif. Aucun document d’identité ou selfie n’est collecté ni téléversé.</div>
        </form>
      </main>
    </div>
  );
};

export default OrganizerApplicationPage;
