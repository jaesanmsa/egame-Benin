import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Building2, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { loadOrganizerDemoState, OrganizerStatus, ORGANIZER_STATUS_LABELS } from "@/lib/organizerV2";

const OrganizerProfileCard = () => {
  const { pathname } = useLocation();
  const english = pathname.startsWith("/en/");
  const [status, setStatus] = useState<OrganizerStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const application = loadOrganizerDemoState().applications.find((item) => item.userId === user.id);
        setStatus(application?.status ?? null);
      }
      setLoading(false);
    };
    void load();
    const refresh = () => void load();
    window.addEventListener("egame-organizer-demo-updated", refresh);
    return () => window.removeEventListener("egame-organizer-demo-updated", refresh);
  }, []);

  if (loading) return null;
  const approved = status === "approved";
  const suspended = status === "suspended";
  const href = english
    ? (approved ? "/en/organizer" : "/en/organizer-application")
    : (approved ? "/organizer" : "/devenir-organisateur");
  const title = approved
    ? (english ? "Organizer dashboard" : "Espace organisateur")
    : (english ? "Become an organizer" : "Devenir organisateur");
  const statusLabel = status ? ORGANIZER_STATUS_LABELS[status][english ? "en" : "fr"] : "";
  const description = suspended
    ? (english ? `Organizer access suspended — ${statusLabel}.` : `Accès organisateur suspendu — ${statusLabel}.`)
    : approved
      ? (english ? "Manage your communities, members and invitations." : "Gère tes communautés, membres et invitations.")
      : status
        ? `${english ? "Application status" : "Statut de candidature"} : ${statusLabel}`
        : (english ? "Apply to manage up to two gaming communities." : "Candidate pour gérer jusqu’à deux communautés gaming.");

  return (
    <Link to={href} className="group block rounded-2xl border border-[#8A2BE2]/30 bg-[#0F0F1E] p-4 transition-colors hover:border-[#A855F7]/70 sm:p-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#8A2BE2]/40 bg-[#8A2BE2]/15">
          {approved ? <ShieldCheck size={19} className="text-emerald-400" /> : <Building2 size={19} className="text-[#A855F7]" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-gaming font-black uppercase tracking-wider text-white">{title}</p>
          <p className="mt-1 text-[10px] leading-relaxed text-[#8888AA]">{description}</p>
        </div>
        <ArrowRight size={16} className="shrink-0 text-[#A855F7] transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
};

export default OrganizerProfileCard;
