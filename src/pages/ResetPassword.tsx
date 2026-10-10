import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Lock } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const authError = params.get("error_description") || hash.get("error_description");
    const hasRecoveryLink = params.has("code") || params.get("type") === "recovery" ||
      hash.get("type") === "recovery" || hash.has("access_token") || hash.has("token_hash");
    const subscription = supabase.auth.onAuthStateChange((event) => {
      if (active && event === "PASSWORD_RECOVERY") {
        setReady(true);
        setChecking(false);
        setError("");
      }
    }).data.subscription;
    const initialize = async () => {
      if (authError) {
        if (active) { setError("Ce lien a expiré ou est invalide. Demande un nouveau lien."); setChecking(false); }
        return;
      }
      if (!hasRecoveryLink) {
        if (active) { setError("Ouvre le lien reçu par e-mail pour réinitialiser ton mot de passe."); setChecking(false); }
        return;
      }
      try {
        const code = params.get("code");
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (hash.get("token_hash") && hash.get("type") === "recovery") {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: hash.get("token_hash")!,
            type: "recovery",
          });
          if (verifyError) throw verifyError;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (active) {
          setReady(!!session);
          if (!session) setError("Lien non vérifié. Demande un nouveau lien de récupération.");
        }
      } catch {
        if (active) setError("Ce lien est invalide ou expiré. Demande un nouveau lien de récupération.");
      } finally {
        if (active) setChecking(false);
      }
    };
    void initialize();
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!ready || loading) return;
    if (password.length < 8) { setError("Utilise au moins 8 caractères."); return; }
    if (password !== confirm) { setError("Les deux mots de passe sont différents."); return; }
    setLoading(true);
    setError("");
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      await supabase.auth.signOut();
      navigate("/auth", { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "La mise à jour a échoué. Essaie à nouveau.");
    } finally { setLoading(false); }
  };

  return <div className="min-h-screen bg-[#07070C] text-white flex items-center justify-center p-6">
    <main className="w-full max-w-md rounded-3xl border border-[#8A2BE2]/40 bg-[#0F0F1E] p-7 space-y-5">
      <h1 className="font-gaming text-2xl font-black">Nouveau mot de passe</h1>
      <p className="text-sm text-[#AAAACC]">Choisis un nouveau mot de passe pour ton compte eGame Bénin.</p>
      {checking ? <p role="status">Vérification du lien de récupération…</p> : null}
      {error && <p role="alert" className="rounded-xl bg-red-900/30 p-3 text-sm text-red-200">{error}</p>}
      {ready && !checking && <form onSubmit={save} className="space-y-4">
        <label className="block space-y-2 text-sm">Nouveau mot de passe
          <div className="relative"><Lock size={17} className="absolute left-3 top-3 text-[#AAAACC]" /><input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-xl border border-white/20 bg-[#07070C] p-3 pl-10" /></div>
        </label>
        <label className="block space-y-2 text-sm">Confirmer le nouveau mot de passe
          <input type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="w-full rounded-xl border border-white/20 bg-[#07070C] p-3" />
        </label>
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#8A2BE2] p-3 font-bold disabled:opacity-50">{loading ? "Enregistrement…" : "Changer mon mot de passe"}</button>
      </form>}
      <Link to="/forgot-password" className="block text-center text-sm text-[#C5A2FF] underline">Demander un nouveau lien</Link>
    </main>
  </div>;
};
export default ResetPassword;
