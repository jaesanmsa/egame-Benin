import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Gamepad2, Users, LoaderCircle } from "lucide-react";

const AccountChoice = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) { navigate("/auth", { replace: true }); return; }
        // All existing profiles were marked player during migration; only new, unclassified profiles see this choice.
        const { data: profile, error: profileError } = await supabase.from("profiles")
          .select("account_kind").eq("id", user.id).maybeSingle();
        if (profileError) throw profileError;
        if (profile?.account_kind) {
          navigate("/", { replace: true }); return;
        }
        if (active) setUserId(user.id);
      } catch {
        if (active) setError("Impossible de préparer ton inscription. Réessaie dans un instant.");
      } finally { if (active) setChecking(false); }
    };
    void initialize();
    return () => { active = false; };
  }, [navigate]);

  const choose = async (kind: "player" | "community_organizer") => {
    if (!userId || saving) return;
    setSaving(true);
    setError("");
    try {
      const { data, error: updateError } = await supabase.from("profiles")
        .update({ account_kind: kind }).eq("id", userId).select("id").maybeSingle();
      if (updateError || !data) throw updateError || new Error("Ton profil n'est pas encore prêt. Actualise cette page.");
      // Organizer is a request, NOT automatically approved or allowed to manage tournaments.
      navigate(kind === "community_organizer" ? "/devenir-organisateur" : "/profil", { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erreur d'enregistrement. Réessaie.");
    } finally { setSaving(false); }
  };

  return <div className="min-h-screen bg-[#07070C] pb-24 pt-24 text-white">
    <SEO title="Choisir mon compte eGame Bénin" noindex />
    <Navbar />
    <main className="mx-auto max-w-3xl space-y-6 px-5 py-8 text-center">
      <p className="text-xs font-black uppercase tracking-widest text-[#A855F7]">Bienvenue sur eGame Bénin</p>
      <h1 className="font-gaming text-2xl font-black sm:text-3xl">Comment souhaites-tu utiliser eGame Bénin ?</h1>
      <p className="text-sm text-[#BBBBD0]">Choisis ton espace. Tu gardes un seul compte eGame Bénin dans tous les cas.</p>
      {checking && <p role="status" className="flex items-center justify-center gap-2"><LoaderCircle className="animate-spin" size={18} /> Vérification du compte…</p>}
      {error && <p role="alert" className="rounded-xl bg-red-900/30 p-4 text-red-200">{error}</p>}
      {!checking && userId && <div className="grid gap-4 text-left sm:grid-cols-2">
        <button disabled={saving} onClick={() => void choose("player")} className="rounded-2xl border border-[#8A2BE2]/35 bg-[#11101C] p-6 text-left transition hover:border-[#A855F7] disabled:opacity-50">
          <Gamepad2 size={30} className="mb-4 text-[#A855F7]" />
          <h2 className="font-gaming text-lg font-black">Compte joueur</h2>
          <p className="mt-3 text-sm text-[#BBBBD0]">Jouer, rejoindre des équipes, participer aux tournois et suivre mes résultats.</p>
          <p className="mt-5 text-xs font-bold text-[#C6A2FF]">Continuer comme joueur →</p>
        </button>
        <button disabled={saving} onClick={() => void choose("community_organizer")} className="rounded-2xl border border-[#8A2BE2]/35 bg-[#11101C] p-6 text-left transition hover:border-[#A855F7] disabled:opacity-50">
          <Users size={30} className="mb-4 text-[#A855F7]" />
          <h2 className="font-gaming text-lg font-black">Organisateur de communauté</h2>
          <p className="mt-3 text-sm text-[#BBBBD0]">Je dirige une communauté gaming et souhaite organiser ses compétitions sur eGame Bénin.</p>
          <p className="mt-3 text-xs text-amber-200">Accès organisateur uniquement après approbation de l'équipe eGame.</p>
          <p className="mt-5 text-xs font-bold text-[#C6A2FF]">Demander l'accès organisateur →</p>
        </button>
      </div>}
      <p className="text-xs text-[#8888AA]">Déjà inscrit ? Tu peux demander l'accès organisateur plus tard depuis ton profil, sans créer un autre compte.</p>
      <Link to="/" className="inline-block text-sm text-[#C6A2FF] underline">Aller à l'accueil</Link>
    </main>
  </div>;
};

export default AccountChoice;
