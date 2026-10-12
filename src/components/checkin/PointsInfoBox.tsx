import React from "react";
import { Gift, Trophy } from "lucide-react";
import { useSiteLanguage } from "@/lib/siteLanguage";

/**
 * Points earned through daily check-ins recognize community engagement.
 * They are not a payment method, entry ticket or prerequisite for a tournament.
 */
const PointsInfoBox = () => {
  const language = useSiteLanguage();
  return (
    <div className="rounded-2xl border border-[#8A2BE2]/30 bg-[#8A2BE2]/5 p-4 space-y-3">
      <p className="text-[10px] font-gaming font-black uppercase tracking-widest text-[#A855F7] flex items-center gap-2">
        <Gift size={14} className="text-[#FFD700]" />
        {language === "en" ? "What are my eGame points for?" : "À quoi servent mes points eGame ?"}
      </p>
      <p className="text-[11px] leading-relaxed text-[#8888AA] font-medium">
        {language === "en"
          ? "Earn loyalty points by checking in and staying active in the eGame Bénin community. They reflect your activity and your community supporter level. Tournament registration is free for everyone: no points or payment are required to enter. Points have no cash value."
          : "Gagne des points de fidélité grâce à ta présence quotidienne et ton activité sur eGame Bénin. Ils reflètent ton assiduité et ton niveau de fidélité dans la communauté. L'inscription aux tournois est gratuite pour tout le monde : aucun point ni paiement n'est nécessaire. Les points n'ont pas de valeur monétaire."}
      </p>
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-gaming font-black uppercase tracking-wider text-emerald-400">
        <Trophy size={12} />
        {language === "en" ? "Community loyalty points" : "Points de fidélité communautaire"}
      </span>
    </div>
  );
};

export default PointsInfoBox;
