import { AlertTriangle } from "lucide-react";

const OrganizerV2Notice = ({ english = false }: { english?: boolean }) => (
  <div className="flex gap-3 rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4 text-left" role="status">
    <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-400" />
    <div className="min-w-0 space-y-1">
      <p className="text-xs font-black text-amber-200">
        {english ? "Local preview — demo mode" : "Prévisualisation locale — mode démonstration"}
      </p>
      <p className="text-[11px] leading-relaxed text-amber-100/80">
        {english
          ? "Actions are stored only in this browser for interface testing. Nothing is submitted to Supabase or production; real applications, memberships and invitations require the approved migration and secured server functions. KYC document collection is disabled."
          : "Les actions sont stockées uniquement dans ce navigateur pour tester l’interface. Rien n’est envoyé à Supabase ni en production ; les vraies candidatures, adhésions et invitations nécessitent la migration approuvée et des fonctions serveur sécurisées. La collecte de documents KYC est désactivée."}
      </p>
    </div>
  </div>
);

export default OrganizerV2Notice;
