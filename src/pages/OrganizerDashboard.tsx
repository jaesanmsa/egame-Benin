import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Gamepad2, Hash, ShieldCheck, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { loadOrganizerDemoState } from "@/lib/organizerV2";
import OrganizerV2Notice from "@/components/OrganizerV2Notice";

const OrganizerDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [demoEnabled, setDemoEnabled] = useState(false);
  const demo = useMemo(() => demoEnabled ? loadOrganizerDemoState() : null, [demoEnabled]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: current } }) => {
      setUser(current);
      setLoading(false);
    });
  }, []);

  const application = demo?.applications.find((item) => item.userId === user?.id);
  const approved = application?.status === "approved";
  const suspended = application?.status === "suspended";
  const communities = approved && !suspended ? demo?.communities.filter((item) => item.organizerUserId === user.id) ?? [] : [];
  const invitations = approved && !suspended ? demo?.invitations.filter((item) => item.organizerUserId === user.id) ?? [] : [];

  if (loading) return <div className="min-h-screen bg-[#07070C]" />;
  if (!user) return <div className="min-h-screen bg-[#07070C] px-5 pt-32 text-center text-white"><Navbar /><p className="font-gaming">Connecte-toi à eGame Bénin.</p><Link to="/auth" className="mt-4 inline-flex rounded-xl bg-[#8A2BE2] px-5 py-3 text-xs font-black uppercase">Connexion</Link></div>;

  return (
    <div className="min-h-screen bg-[#07070C] pb-32 pt-24 text-white">
      <SEO title="Espace organisateur" noindex />
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-[10px] font-gaming font-black uppercase tracking-[0.2em] text-[#A855F7]">eGame V2</p><h1 className="mt-1 text-2xl font-gaming font-black uppercase sm:text-3xl">Espace organisateur</h1><p className="mt-2 text-sm text-[#A0A0B8]">Communautés, membres, invitations et outils tournoi.</p></div>
          <Link to="/profil" className="text-xs font-bold text-[#A855F7] hover:underline">Retour au profil</Link>
        </header>
        <OrganizerV2Notice />

        {suspended ? (
          <section className="rounded-3xl border border-red-500/40 bg-red-500/10 p-6">
            <h2 className="font-gaming font-black text-red-200">Accès organisateur suspendu</h2>
            <p className="mt-2 text-sm text-[#B1B1C4]">Les communautés et outils restent masqués tant que l’administration n’a pas rétabli l’accès.</p>
          </section>
        ) : !approved ? (
          <section className="space-y-4 rounded-3xl border border-[#8A2BE2]/30 bg-[#0F0F1E] p-6 sm:p-8">
            <h2 className="text-lg font-gaming font-black">Accès réservé aux organisateurs approuvés</h2>
            <p className="text-sm leading-relaxed text-[#A0A0B8]">
              Aucune candidature V2 n’est actuellement reliée à Supabase. L’interface de candidature est disponible, mais son envoi réel attend l’installation de la migration et des RPC sécurisés.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/devenir-organisateur" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#8A2BE2] px-5 py-3 text-xs font-gaming font-black uppercase text-white hover:bg-[#9B4DEB]">Devenir organisateur</Link>
              <button type="button" onClick={() => setDemoEnabled((value) => !value)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#A855F7]/40 px-5 py-3 text-xs font-gaming font-bold uppercase text-[#D6B7FF] hover:bg-[#8A2BE2]/10">{demoEnabled ? "Masquer la démo locale" : "Prévisualiser les outils (démo locale)"}</button>
            </div>
          </section>
        ) : (
          <OrganizerV2Notice />
        )}

        {(approved && !suspended && demo) || demoEnabled ? (
          <>
            <section className="grid gap-3 sm:grid-cols-3">
              <Stat label="Communautés actives" value={`${communities.filter((item) => item.status === "active").length}/2`} />
              <Stat label="Membres confirmés (démo)" value={communities.reduce((sum, community) => sum + demo!.invitations.filter((invite) => invite.communityId === community.id && invite.status === "accepted").length, 0)} />
              <Stat label="Invitations en attente" value={invitations.filter((invite) => invite.status === "pending").length} />
            </section>
            <section className="space-y-3">
              <h2 className="text-lg font-gaming font-black uppercase">Mes communautés</h2>
              {communities.length === 0 ? <Empty text="Aucune communauté approuvée ou créée dans la prévisualisation locale." /> : <div className="grid gap-3 sm:grid-cols-2">{communities.map((community) => <article key={community.id} className="rounded-2xl border border-[#8A2BE2]/25 bg-[#0F0F1E] p-4"><h3 className="font-gaming font-bold text-white">{community.name}</h3><p className="mt-1 text-xs text-[#A855F7]">{community.game} · {community.status}</p><p className="mt-3 text-[10px] text-[#8888AA]">Accès aux membres et invitations visibles uniquement dans les outils connectés.</p></article>)}</div>}
            </section>
            <section className="space-y-3">
              <h2 className="text-lg font-gaming font-black uppercase">Mes membres et invitations</h2>
              <Empty text="La recherche de vrais comptes, l'envoi des invitations et les réponses nécessitent les RPC Supabase préparées, qui ne sont pas encore appliquées." />
            </section>
          </>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-lg font-gaming font-black uppercase">Outils organisateur</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FutureCard icon={CalendarDays} title="Mes tournois" />
            <FutureCard icon={Gamepad2} title="Créer un tournoi" />
            <FutureCard icon={Users} title="Mes équipes" />
            <FutureCard icon={Hash} title="Inscriptions et tickets" />
            <FutureCard icon={ShieldCheck} title="Résultats et contestations" />
            <FutureCard icon={ArrowRight} title="Historique des actions" />
          </div>
        </section>
      </main>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string | number }) => <div className="rounded-2xl border border-[#8A2BE2]/25 bg-[#0F0F1E] p-4"><p className="text-[10px] uppercase tracking-widest text-[#8888AA]">{label}</p><p className="mt-1 text-2xl font-gaming font-black text-white">{value}</p></div>;
const Empty = ({ text }: { text: string }) => <p className="rounded-2xl border border-dashed border-white/15 p-5 text-sm text-[#8888AA]">{text}</p>;
const FutureCard = ({ icon: Icon, title }: { icon: typeof CalendarDays; title: string }) => <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0F0F1E] p-4 opacity-70"><Icon size={18} className="text-[#A855F7]" /><div><p className="text-sm font-bold text-white">{title}</p><p className="text-[10px] text-[#8888AA]">Fonctionnalité en préparation</p></div></div>;

export default OrganizerDashboard;
