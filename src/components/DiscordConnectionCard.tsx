import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Unlink } from "lucide-react";
import {
  DiscordConnection,
  discordAvatarUrl,
  discordDisplayName,
  disconnectDiscord,
  fetchDiscordConnection,
  startDiscordConnect,
} from "@/lib/discordConnection";
import { showError, showSuccess } from "@/utils/toast";
import DiscordLogo from "./DiscordLogo";

/**
 * Section « Discord » du profil : liaison secondaire et FACULTATIVE.
 * Elle ne remplace jamais l'authentification eGame (Google / e-mail) et
 * reste persistante dans discord_connections d'une session à l'autre.
 */
const DiscordConnectionCard = () => {
  const [connection, setConnection] = useState<DiscordConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

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

  // Connexion OAuth : redirection vers l'URL d'autorisation Discord renvoyée
  // par l'Edge Function, avec retour sur la page profil actuelle.
  const handleConnect = async () => {
    setConnecting(true);
    try {
      const authorizationUrl = await startDiscordConnect(window.location.href);
      window.location.href = authorizationUrl;
    } catch (err: any) {
      showError(err?.message || "Impossible de démarrer la connexion Discord. Réessaie.");
      setConnecting(false);
    }
  };

  // Déconnexion : suppression UNIQUEMENT de la ligne du joueur connecté.
  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await disconnectDiscord();
      setConnection(null);
      showSuccess("Discord déconnecté de ton compte eGame.");
    } catch (err: any) {
      showError(err?.message || "Impossible de déconnecter Discord. Réessaie.");
    } finally {
      setDisconnecting(false);
    }
  };

  const avatar = discordAvatarUrl(connection);
  const displayName = discordDisplayName(connection);

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#5865F2]/15 border border-[#5865F2]/40 flex items-center justify-center shrink-0">
            <DiscordLogo size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-gaming font-black uppercase tracking-widest text-white">Discord</p>
            <p className="text-[10px] text-[#8888AA]">Liaison facultative pour les espaces privés des tournois</p>
          </div>
        </div>
        {connection && !loading && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[9px] font-gaming font-black uppercase tracking-widest shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Discord connecté
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-3">
          <Loader2 size={18} className="text-[#5865F2] animate-spin" />
        </div>
      ) : connection ? (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl bg-[#0A0A0F] border border-white/5 px-4 py-3">
            {avatar ? (
              <img
                src={avatar}
                alt={`Avatar Discord de ${displayName}`}
                className="w-11 h-11 rounded-full border-2 border-[#5865F2]/50 object-cover shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#5865F2]/20 border-2 border-[#5865F2]/40 flex items-center justify-center shrink-0">
                <DiscordLogo size={20} />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{displayName}</p>
              {connection.discord_username && connection.discord_global_name && (
                <p className="text-[11px] text-[#8888AA] truncate">@{connection.discord_username}</p>
              )}
            </div>
            <CheckCircle2 size={16} className="text-emerald-400 ml-auto shrink-0" />
          </div>

          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="w-full py-3 rounded-xl bg-[#0A0A0F] border border-red-500/30 hover:border-red-500/60 text-red-400 font-gaming font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {disconnecting ? <Loader2 size={14} className="animate-spin" /> : <Unlink size={14} />}
            {disconnecting ? "Déconnexion..." : "Déconnecter Discord"}
          </button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <p className="text-xs text-[#8888AA] leading-relaxed">Discord non connecté.</p>
          <p className="text-[10px] text-[#8888AA]/70 leading-relaxed">
            Connecte ton Discord pour accéder aux espaces privés des tournois et suivre la communauté.
            Ta connexion eGame (Google ou e-mail) reste inchangée.
          </p>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="w-full py-3.5 rounded-xl bg-[#8A2BE2] hover:bg-[#9B4DEB] text-white font-gaming font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#8A2BE2]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {connecting ? <Loader2 size={15} className="animate-spin" /> : <DiscordLogo size={15} className="text-white" />}
            {connecting ? "Redirection vers Discord..." : "Connecter mon Discord"}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default DiscordConnectionCard;
