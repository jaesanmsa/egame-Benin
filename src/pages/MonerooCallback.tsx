import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Clock3, Copy, Loader2, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { showSuccess } from "@/utils/toast";

type PaymentState = "checking" | "pending" | "success" | "failed" | "cancelled" | "error";

const MonerooCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<PaymentState>("checking");
  const [message, setMessage] = useState("");
  const [validationCode, setValidationCode] = useState<string | null>(null);
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [tournamentTitle, setTournamentTitle] = useState<string | null>(null);
  const [checkingAgain, setCheckingAgain] = useState(false);
  const hasStarted = useRef(false);

  const verifyPayment = useCallback(async (manual = false) => {
    const monerooPaymentId = searchParams.get("monerooPaymentId");
    const paymentAttemptId = searchParams.get("paymentAttemptId") ||
      (monerooPaymentId ? sessionStorage.getItem(`moneroo_attempt:${monerooPaymentId}`) : null);

    if (!monerooPaymentId) {
      setStatus("error");
      setMessage("Identifiant Moneroo manquant. Aucun paiement n'a été considéré comme validé.");
      setCheckingAgain(false);
      return;
    }

    if (manual) setCheckingAgain(true);
    else setStatus("checking");

    try {
      const { data, error } = await supabase.functions.invoke("verify-moneroo", {
        body: {
          payment_id: monerooPaymentId,
          paymentAttemptId,
        },
      });

      let result = data as any;
      let httpStatus: number | undefined;
      if (error) {
        httpStatus = error.context?.status;
        try {
          const body = await error.context?.json?.();
          if (body) result = body;
        } catch {
          // Certains retours HTTP n'ont pas de corps JSON exploitable.
        }
      }

      const returnedTournamentId = result?.tournament_id || null;
      if (returnedTournamentId) {
        setTournamentId(returnedTournamentId);
        const { data: tournament } = await supabase
          .from("tournaments")
          .select("title")
          .eq("id", returnedTournamentId)
          .maybeSingle();
        setTournamentTitle(tournament?.title || null);
      }

      const returnedStatus = String(result?.status || "").toLowerCase();
      if (result?.success === true && returnedStatus === "success") {
        setValidationCode(result.validation_code || null);
        setStatus("success");
        setMessage("");
        sessionStorage.removeItem(`payment_gateway:${returnedTournamentId || ""}`);
        window.dispatchEvent(new CustomEvent("egame-payment-updated", {
          detail: { tournament_id: returnedTournamentId },
        }));
      } else if (returnedStatus === "pending" || httpStatus === 202 || (error && !result?.status)) {
        setStatus("pending");
        setMessage("Vérification du paiement en cours… Ne relance pas le paiement. Tu peux vérifier à nouveau dans quelques instants.");
      } else if (returnedStatus === "cancelled" || returnedStatus === "canceled") {
        setStatus("cancelled");
        setMessage("Le paiement a été annulé.");
      } else if (returnedStatus === "failed" || error || result?.success === false) {
        setStatus("failed");
        setMessage(result?.message || result?.error || "Le paiement n'a pas abouti.");
      } else {
        setStatus("pending");
        setMessage("Vérification du paiement en cours… Ne relance pas le paiement. Tu peux vérifier à nouveau dans quelques instants.");
      }
    } catch (verifyError: any) {
      setStatus("pending");
      setMessage(verifyError?.message
        ? `Vérification du paiement en cours… ${verifyError.message}`
        : "Vérification du paiement en cours… Ne relance pas le paiement.");
    } finally {
      setCheckingAgain(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    // monerooPaymentStatus peut être présent dans l'URL, mais ne sert jamais
    // de preuve. Le statut affiché provient exclusivement de verify-moneroo.
    void verifyPayment();
  }, [verifyPayment]);

  // Si Moneroo répond pending, réinterroge le serveur sans faire repayer le joueur.
  useEffect(() => {
    if (status !== "pending") return;
    const timer = window.setTimeout(() => { void verifyPayment(true); }, 8000);
    return () => window.clearTimeout(timer);
  }, [status, verifyPayment]);

  const copyCode = async () => {
    if (!validationCode) return;
    await navigator.clipboard.writeText(validationCode);
    showSuccess("Code copié !");
  };

  const title = status === "success"
    ? "Paiement confirmé"
    : status === "pending" || status === "checking"
      ? "Vérification du paiement"
      : "Paiement non confirmé";

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col">
      <SEO title="Retour de paiement Moneroo" noindex />
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 pt-24">
        <section className="w-full max-w-md min-w-0 bg-[#0F0F1E] border border-[#8A2BE2]/40 rounded-3xl p-5 sm:p-8 text-center shadow-2xl space-y-5">
          {status === "checking" ? (
            <div className="py-8 space-y-4">
              <Loader2 size={42} className="text-[#8A2BE2] animate-spin mx-auto" />
              <h1 className="text-lg sm:text-xl font-gaming font-bold">Vérification sécurisée du paiement…</h1>
              <p className="text-xs text-[#8888AA]">Nous confirmons la transaction auprès du serveur.</p>
            </div>
          ) : status === "pending" ? (
            <>
              <Clock3 size={42} className="text-amber-400 mx-auto" />
              <h1 className="text-xl font-gaming font-black text-white">Vérification du paiement en cours…</h1>
              <p className="text-xs text-[#8888AA] leading-relaxed">{message}</p>
              <button
                onClick={() => void verifyPayment(true)}
                disabled={checkingAgain}
                className="w-full min-h-12 rounded-xl bg-[#8A2BE2] hover:bg-[#9B4DEB] disabled:opacity-60 text-white font-gaming font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {checkingAgain ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                Vérifier à nouveau
              </button>
              <p className="text-[10px] text-amber-200/80">Ne paie pas une deuxième fois pendant la vérification.</p>
            </>
          ) : status === "success" ? (
            <>
              <div className="w-16 h-16 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 size={38} />
              </div>
              <h1 className="text-xl sm:text-2xl font-gaming font-black uppercase text-white">Paiement confirmé ✅</h1>
              <p className="text-sm font-bold text-white">Ton inscription au tournoi est validée.</p>
              {tournamentTitle && <p className="text-xs text-[#8888AA] break-words">{tournamentTitle}</p>}
              {validationCode && (
                <div className="p-4 sm:p-6 bg-[#0A0A0F] rounded-2xl border-2 border-dashed border-[#FFD700]/50 space-y-2">
                  <p className="text-[10px] font-gaming font-bold text-[#8888AA] uppercase tracking-widest">Ton ticket eGame Bénin</p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <span className="max-w-full break-all text-[#FFD700] font-gaming font-black text-xl sm:text-2xl tracking-widest">{validationCode}</span>
                    <button onClick={() => void copyCode()} aria-label="Copier le code" className="text-[#8888AA] hover:text-white p-2">
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
              )}
              <p className="text-xs text-[#8888AA]">Le paiement a été confirmé côté serveur. Les données de ton inscription ont été actualisées.</p>
              <div className="space-y-3">
                <Link to="/payments" className="block">
                  <button className="w-full min-h-12 bg-[#5865F2] hover:bg-[#4752C4] text-white font-gaming font-bold text-xs uppercase tracking-wider px-3 py-3 rounded-xl flex items-center justify-center gap-2">
                    Voir mes inscriptions
                  </button>
                </Link>
                {tournamentId && (
                  <Link to={`/tournament/${encodeURIComponent(tournamentId)}`} className="block">
                    <button className="w-full min-h-11 bg-[#0A0A0F] border border-[#8A2BE2]/30 hover:border-[#8A2BE2] text-white font-gaming font-bold text-xs uppercase tracking-wider px-3 py-3 rounded-xl">
                      Retour au tournoi
                    </button>
                  </Link>
                )}
              </div>
            </>
          ) : (
            <>
              <AlertCircle size={42} className="text-red-400 mx-auto" />
              <h1 className="text-xl font-gaming font-black text-red-400">{title}</h1>
              <p className="text-xs text-[#8888AA] leading-relaxed">{message || (status === "cancelled" ? "Le paiement a été annulé." : "Le paiement n'a pas abouti.")}</p>
              {tournamentId && (
                <Link to={`/tournament/${encodeURIComponent(tournamentId)}`} className="block">
                  <button className="w-full min-h-12 rounded-xl bg-[#8A2BE2] hover:bg-[#9B4DEB] text-white font-gaming font-black text-xs uppercase tracking-wider px-3 py-3">
                    Retourner au tournoi et réessayer
                  </button>
                </Link>
              )}
              <Link to="/contact" className="block text-xs text-[#A855F7] hover:underline">Contacter le support</Link>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default MonerooCallback;
