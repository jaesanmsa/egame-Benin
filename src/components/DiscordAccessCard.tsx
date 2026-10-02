import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import {
  DiscordConnection,
  discordAvatarUrl,
  discordDisplayName,
  fetchDiscordConnection,
  startDiscordConnect,
  syncDiscordRegistration,
} from "@/lib/discordConnection";
import { showError } from "@/utils/toast";
import DiscordLogo from "./DiscordLogo";

interface DiscordAccessCardProps {
  tournamentId: string;
  tournamentTitle?: string;
}

/**
 * « Accès Discord au tournoi » : visible sur la page d'un tournoi quand le
 * joueur y est inscrit avec un ticket valide. Étapes :
 *  1. Discord non lié → proposition de connexion OAuth ;
 *  2. Discord lié → « Activer mon accès Discord » (rôle/salon privé via
 *     l'Edge Function discord-sync-registration).
 */
const DiscordAccessCard = ({ tournamentId, tournamentTitle }: DiscordAccessCardProps) => {
  const [connection, setConnection] = useState<DiscordConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const [guildInviteUrl, setGuildInviteUrl] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setConnection(await fetchDiscordConnection());
    } catch {
      setConnection(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      // Retour OAuth sur la page du tournoi : l'état se recharge au montage.
      const authorizationUrl = await startDiscordConnect(window.location.href);
      window.location.href = authorizationUrl;
    } catch (err: any) {
      showError(err?.message || "Impossible de démarrer la connexion Discord. Réessaie.");
      setConnecting(false);
    }
  };

  const handleActivate = async () => {
    setActivating(true);
    setSyncError(null);
    setGuildInviteUrl(null);
    try {
      const result = await syncDiscordRegistration(tournamentId);
      if (result.ok) {
        setActivated(true);
        return;
      }
      switch (result.errorCode) {
        case "DISCORD_NOT_CONNECTED":
          setConnection(null);
          setSyncError("Connecte ton Discord pour activer l'accès au tournoi.");
          break;
        case "NO_VALID_TICKET":
          setSyncError("Ton inscription n'est pas encore validée.");
          break;
        case "NOT_IN_GUILD":
          setGuildInviteUrl(result.inviteUrl || null);
          break;
        case "ROLE_ASSIGN_FAILED":
          setSyncError("L'activation du rôle Discord a échoué. Contacte le support eGame Bénin pour terminer l'activation.");
          break;
        default:
          setSyncError("Une erreur inattendue est survenue. Réessaie dans un instant.");
      }
    } catch (err: any) {
      setSyncError(err?.message || "Une erreur est survenue. Réessaie.");
    } finally {
      setActivating(false);
    }
  };

  const avatar = discordAvatarUrl(connection);
  const displayName = discordDisplayName(connection);

  return (
    <div className="rounded-3xl border border-[#5865F2]/40 bg-[#5865F2]/5 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/50 flex items-center justify-center shrink-0">
          <DiscordLogo size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-gaming font-black uppercase tracking-widest text-white">
            Accès Discord au tournoi
          </h3>
          {tournamentTitle && (
            <p className="text-[10px] text-[#8888AA] truncate">{tournamentTitle}</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-3">
          <Loader2 size={18} className="text-[#5865F2] animate-spin" />
        </div>
      ) : activated ? (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[9px] font-gaming font-black uppercase tracking-widest">
              <CheckCircle2 size={11} />
              Accès Discord activé
            </span>
          </div>
          <p className="text-xs text-[#8888AA] leading-relaxed">
            L'espace privé du tournoi est maintenant disponible sur Discord.
          </p>
        </motion.div>
      ) : !connection ? (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <p className="text-xs text-[#8888AA] leading-relaxed">
            Connecte ton Discord pour accéder à l'espace privé {tournamentTitle ? "de ce tournoi" : "du tournoi"}.
          </p>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="w-full py-3.5 rounded-xl bg-[#8A2BE2] hover:bg-[#9B4DEB] text-white font-gaming font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#8A2BE2]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {connecting ? <Loader2 size={15} className="animate-spin" /> : <DiscordLogo size={15} className="text-white" />}
            {connecting ? "Redirection vers Discord..." : "Connecter Discord"}
          </button>
        </motion.div>
      ) : guildInviteUrl ? (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-2">
            <p className="text-xs font-bold text-amber-300 flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0" />
              Rejoins d'abord le serveur Discord eGame Bénin
            </p>
            <p className="text-[11px] text-amber-100/80 leading-relaxed">
              Ton compte Discord est bien lié, mais tu n'es pas encore membre du serveur.
              Rejoins-le, puis reviens activer ton accès.
            </p>
          </div>
          <a
            href={guildInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-gaming font-black text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            <DiscordLogo size={15} className="text-white" />
            Rejoindre le serveur eGame Bénin
            <ExternalLink size={12} />
          </a>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-[#0A0A0F] border border-white/5 px-4 py-3">
            {avatar ? (
              <img
                src={avatar}
                alt={`Avatar Discord de ${displayName}`}
                className="w-9 h-9 rounded-full border-2 border-[#5865F2]/50 object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#5865F2]/20 border-2 border-[#5865F2]/40 flex items-center justify-center shrink-0">
                <DiscordLogo size={16} />
              </div>
            )}
            <p className="text-xs font-bold text-white truncate">{displayName}</p>
            <span className="ml-auto inline-flex items-center gap-1 text-[9px] font-gaming font-black uppercase tracking-widest text-emerald-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Lié
            </span>
          </div>

          {syncError && (
            <p className="text-[11px] font-bold text-red-400 leading-relaxed flex items-start gap-1.5">
              <AlertTriangle size={13} className="shrink-0 mt-0.5" />
              {syncError}
            </p>
          )}

          <button
            onClick={handleActivate}
            disabled={activating}
            className="w-full py-3.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-gaming font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#5865F2]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {activating ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
            {activating ? "Activation en cours..." : "Activer mon accès Discord"}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default DiscordAccessCard;
