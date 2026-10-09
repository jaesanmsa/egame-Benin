import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, CheckCircle2, FileCheck2, Plus, ShieldCheck, Trash2, UserRound } from "lucide-react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { ORGANIZER_GAMES, OrganizerApplication, OrganizerDemoState, RequestedCommunity, loadOrganizerDemoState, organizerId, saveOrganizerDemoState } from "@/lib/organizerV2";
import OrganizerV2Notice from "@/components/OrganizerV2Notice";

const blankCommunity = (): RequestedCommunity => ({
  id: organizerId("requested-community"), name: "", game: "", size: "", publicUrl: "", responsibilityProofUrl: "",
});

const OrganizerApplicationPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [state, setState] = useState<OrganizerDemoState>(() => loadOrganizerDemoState());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [country, setCountry] = useState("");
  const [professionalContact, setProfessionalContact] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [communities, setCommunities] = useState<RequestedCommunity[]>([blankCommunity()]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
      if (currentUser) {
        setApplicantName(currentUser.user_metadata?.full_name || "");
        setCountry(currentUser.user_metadata?.country || "");
      }
      setLoading(false);
    });
    const refresh = () => setState(loadOrganizerDemoState());
    window.addEventListener("egame-organizer-demo-updated", refresh);
    return () => window.removeEventListener("egame-organizer-demo-updated", refresh);
  }, []);

  const currentApplication = useMemo(
    () => state.applications.find((application) => application.userId === user?.id),
    [state.applications, user?.id],
  );

  const updateCommunity = (id: string, key: keyof RequestedCommunity, value: string) => {
    setCommunities((items) => items.map((item) => item.id === id ? { ...item, [key]: value } : item));
  };

  const addCommunity = () => {
    if (communities.length < 2) setCommunities((items) => [...items, blankCommunity()]);
  };

  const removeCommunity = (id: string) => {
    setCommunities((items) => items.length > 1 ? items.filter((item) => item.id !== id) : items);
  };

  const saveApplication = (event: FormEvent, submit: boolean) => {
    event.preventDefault();
    setError("");
    if (!user) { navigate("/auth"); return; }
    if (communities.length < 1 || communities.length > 2) {
      setError("Renseigne une ou deux communautés au maximum.");
      return;
    }
    const invalid = communities.some((community) => !community.name.trim() || !community.game || !community.publicUrl.trim() || !community.responsibilityProofUrl.trim());
    if (invalid) {
      setError("Pour chaque communauté, renseigne le nom, le jeu, un lien de vérification et un justificatif de responsabilité.");
      return;
    }
    if (new Set(communities.map((community) => community.game)).size !== communities.length) {
      setError("Choisis deux jeux différents pour tes communautés.");
      return;
    }
    if (submit && (!applicantName.trim() || !country.trim() || !professionalContact.trim() || !termsAccepted)) {
      setError("Complète ton identité, ton pays, un contact professionnel et accepte les conditions d’organisation.");
      return;
    }

    setSubmitting(true);
    const now = new Date().toISOString();
    const application: OrganizerApplication = {
      id: currentApplication?.id || organizerId("application"),
      userId: user.id,
      email: user.email || "",
      applicantName: applicantName.trim(),
      country: country.trim(),
      professionalContact: professionalContact.trim(),
      communities: communities.map((community) => ({ ...community, name: community.name.trim(), size: community.size.trim(), publicUrl: community.publicUrl.trim(), responsibilityProofUrl: community.responsibilityProofUrl.trim() })),
      termsAccepted,
      status: submit ? "submitted" : "draft",
      adminNote: "",
      kycStatus: "disabled_pending_vendor",
      createdAt: currentApplication?.createdAt || now,
      updatedAt: now,
      decisions: [
        ...(currentApplication?.decisions || []),
        { status: submit ? "submitted" : "draft", note: submit ? "Candidature soumise (démo locale)" : "Brouillon enregistré (démo locale)", actor: user.id, createdAt: now },
      ],
    };
    const nextState: OrganizerDemoState = {
      ...state,
      applications: [application, ...state.applications.filter((item) => item.userId !== user.id)],
    };
    saveOrganizerDemoState(nextState);
    setState(nextState);
    setSuccess(submit);
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen bg-[#07070C]" />;
  if (!user) {
    return <div className="min-h-screen bg-[#07070C] px-5 pt-32 text-center text-white"><Navbar /><h1 className="font-gaming text-xl font-black">Connecte-toi à eGame Bénin</h1><Link to="/auth" className="mt-5 inline-flex rounded-xl bg-[#8A2BE2] px-5 py-3 text-xs font-black uppercase">Connexion</Link></div>;
  }

  const inputClass = "w-full min-w-0 rounded-xl border border-[#8A2BE2]/30 bg-[#07070C] px-4 py-3 text-sm text-white placeholder:text-[#77778F] focus:border-[#A855F7] focus:outline-none";
  const activeCommunityCount = state.communities.filter((community) => community.organizerUserId === user.id && community.status === "active").length;

  return (
    <div className="min-h-screen bg-[#07070C] pb-32 pt-24 text-white">
      <SEO title="Devenir organisateur eGame Bénin" noindex />
      <Navbar />
      <main className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6">
        <Link to="/profil" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8888AA] hover:text-white"><ArrowLeft size={15} /> Retour au profil</Link>
        <header className="space-y-2">
          <p className="text-[10px] font-gaming font-black uppercase tracking-[0.2em] text-[#A855F7]">Programme organisateur</p>
          <h1 className="text-2xl font-gaming font-black uppercase sm:text-3xl">Devenir organisateur</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[#A0A0B8]">Présente tes communautés gaming. L’administration eGame examinera ta demande avant toute attribution de permissions.</p>
        </header>

        <OrganizerV2Notice />

        {currentApplication && (
          <section className="rounded-2xl border border-[#8A2BE2]/30 bg-[#0F0F1E] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-[10px] font-black uppercase tracking-widest text-[#8888AA]">Candidature locale actuelle</p><p className="mt-1 text-sm font-bold text-white">{currentApplication.applicantName || currentApplication.email}</p></div>
              <span className="rounded-full border border-[#A855F7]/40 bg-[#8A2BE2]/15 px-3 py-1.5 text-[10px] font-black uppercase text-[#D6B7FF]">{currentApplication.status}</span>
            </div>
            {currentApplication.adminNote && <p className="mt-3 text-xs text-amber-200">Retour admin démo : {currentApplication.adminNote}</p>}
          </section>
        )}

        {success && <div className="flex gap-3 rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-4 text-sm text-emerald-200"><CheckCircle2 className="shrink-0" size={18} />Candidature enregistrée dans cette prévisualisation locale. Elle n’est pas envoyée à l’administration en production.</div>}
        {error && <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">{error}</div>}

        <form onSubmit={(event) => saveApplication(event, true)} className="space-y-6 rounded-3xl border border-[#8A2BE2]/30 bg-[#0F0F1E] p-4 sm:p-7">
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-gaming font-black uppercase"><UserRound size={17} className="text-[#A855F7]" /> Responsable</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs text-[#B1B1C4]">Nom et prénom légaux *<input required value={applicantName} onChange={(e) => setApplicantName(e.target.value)} className={inputClass} autoComplete="name" /></label>
              <label className="space-y-1.5 text-xs text-[#B1B1C4]">Pays de résidence *<input required value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} autoComplete="country-name" placeholder="Ex. Bénin" /></label>
              <label className="space-y-1.5 text-xs text-[#B1B1C4] sm:col-span-2">Contact professionnel *<input required value={professionalContact} onChange={(e) => setProfessionalContact(e.target.value)} className={inputClass} placeholder="E-mail ou numéro professionnel" /></label>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-gaming font-black uppercase"><Building2 size={17} className="text-[#A855F7]" /> Communautés (1–2 maximum)</h2>
              <span className="text-[10px] font-bold text-[#8888AA]">Communautés actives déjà accordées : {activeCommunityCount}/2</span>
            </div>
            {communities.map((community, index) => (
              <fieldset key={community.id} className="min-w-0 space-y-4 rounded-2xl border border-white/10 bg-[#0A0A0F] p-4 sm:p-5">
                <legend className="px-2 text-[10px] font-black uppercase tracking-wider text-[#A855F7]">Communauté {index + 1}</legend>
                {communities.length > 1 && <button type="button" onClick={() => removeCommunity(community.id)} aria-label="Retirer cette communauté" className="ml-auto flex items-center gap-1 text-[10px] text-red-300 hover:text-red-200"><Trash2 size={13} /> Retirer</button>}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5 text-xs text-[#B1B1C4]">Nom de la communauté *<input required value={community.name} onChange={(e) => updateCommunity(community.id, "name", e.target.value)} className={inputClass} /></label>
                  <label className="space-y-1.5 text-xs text-[#B1B1C4]">Jeu associé *<select required value={community.game} onChange={(e) => updateCommunity(community.id, "game", e.target.value)} className={inputClass}><option value="">Sélectionner</option>{ORGANIZER_GAMES.map((game) => <option key={game} value={game} className="bg-[#0F0F1E]">{game}</option>)}</select></label>
                  <label className="space-y-1.5 text-xs text-[#B1B1C4]">Taille approximative<input value={community.size} onChange={(e) => updateCommunity(community.id, "size", e.target.value)} className={inputClass} placeholder="Ex. environ 80 membres" /></label>
                  <label className="space-y-1.5 text-xs text-[#B1B1C4]">Lien public de vérification *<input required type="url" value={community.publicUrl} onChange={(e) => updateCommunity(community.id, "publicUrl", e.target.value)} className={inputClass} placeholder="https://…" /></label>
                  <label className="space-y-1.5 text-xs text-[#B1B1C4] sm:col-span-2">Lien vers un justificatif de responsabilité *<input required type="url" value={community.responsibilityProofUrl} onChange={(e) => updateCommunity(community.id, "responsibilityProofUrl", e.target.value)} className={inputClass} placeholder="Lien vers profil admin public ou justificatif non sensible" /></label>
                  <p className="flex items-start gap-2 text-[11px] leading-relaxed text-amber-200/80 sm:col-span-2"><FileCheck2 size={14} className="mt-0.5 shrink-0" />Ne fournis pas de pièce d’identité ni de selfie : la collecte KYC réelle est désactivée jusqu’au choix et à la validation d’un prestataire sécurisé.</p>
                </div>
              </fieldset>
            ))}
            {communities.length < 2 && <button type="button" onClick={addCommunity} className="inline-flex items-center gap-2 rounded-xl border border-[#A855F7]/40 px-4 py-2.5 text-xs font-bold text-[#D6B7FF] hover:bg-[#8A2BE2]/10"><Plus size={15} /> Ajouter une communauté</button>}
          </section>

          <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#0A0A0F] p-4 text-xs leading-relaxed text-[#B1B1C4]"><input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5 accent-[#8A2BE2]" /><span>J’accepte les conditions d’organisation des tournois et comprends que mes permissions ne seront attribuées qu’après approbation administrative.</span></label>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" disabled={submitting} onClick={(event) => saveApplication(event, false)} className="min-h-11 rounded-xl border border-white/15 px-5 py-3 text-xs font-bold text-[#B1B1C4] hover:bg-white/5 disabled:opacity-50">Enregistrer le brouillon</button>
            <button type="submit" disabled={submitting} className="min-h-11 rounded-xl bg-[#8A2BE2] px-6 py-3 text-xs font-gaming font-black uppercase tracking-wider text-white hover:bg-[#9B4DEB] disabled:opacity-50">Soumettre la candidature</button>
          </div>
          <div className="flex items-start gap-2 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-[#8888AA]"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#A855F7]" />KYC préparé mais inactif. Aucun document d’identité ou selfie n’est collecté ni téléversé.</div>
        </form>
      </main>
    </div>
  );
};

export default OrganizerApplicationPage;
