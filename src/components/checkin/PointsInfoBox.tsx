import React from "react";
import { Gift, Gamepad2 } from "lucide-react";

/**
 * Encart « À quoi servent mes points eGame ? » — partagé entre la fenêtre de
 * check-in et la carte du profil. Aucun seuil automatique : les tarifs seront
 * définis ultérieurement par l'administration.
 */
const PointsInfoBox = () => (
  <div className="rounded-2xl border border-[#8A2BE2]/30 bg-[#8A2BE2]/5 p-4 space-y-3">
    <p className="text-[10px] font-gaming font-black uppercase tracking-widest text-[#A855F7] flex items-center gap-2">
      <Gift size={14} className="text-[#FFD700]" />
      À quoi servent mes points eGame ?
    </p>
    <p className="text-[11px] leading-relaxed text-[#8888AA] font-medium">
      Accumule des points eGame en restant actif sur la plateforme. Tes points
      pourront notamment être utilisés pour participer <span className="text-white font-bold">gratuitement</span> à
      certains tournois eGame Bénin et profiter d'autres avantages. Plus tu es
      actif, plus tu accumules de points et plus tu pourras débloquer de récompenses.
    </p>
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-gaming font-black uppercase tracking-wider text-emerald-400">
      <Gamepad2 size={12} />
      Tournois gratuits avec tes points
    </span>
  </div>
);

export default PointsInfoBox;
