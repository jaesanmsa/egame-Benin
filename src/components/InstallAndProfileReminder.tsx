import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { markPwaInstalled, postponePwaInstall, requestPwaInstall, usePwaInstall } from '@/lib/pwaInstall';
import ProfileReminder from './ProfileReminder';

export default function InstallAndProfileReminder() {
  const { pathname } = useLocation();
  const { ios, canPrompt, shouldOffer } = usePwaInstall();
  const [guide, setGuide] = useState(false);
  const [busy, setBusy] = useState(false);
  const excluded = ['/auth', '/edit-profile', '/avatar-maker', '/profil', '/payment-success', '/payment-cancel'].some(path => pathname === path || pathname.startsWith(`${path}/`));

  if (excluded) return <ProfileReminder />;
  if (!shouldOffer) return <ProfileReminder />;

  const install = async () => {
    if (!canPrompt) { setGuide(true); return; }
    setBusy(true);
    try { await requestPwaInstall(); }
    catch { setGuide(true); }
    finally { setBusy(false); }
  };

  return (
    <aside aria-label="Installer eGame Bénin" className="fixed bottom-28 left-4 right-4 z-40 mx-auto max-h-[65dvh] max-w-md overflow-y-auto rounded-3xl border border-violet-400/50 bg-violet-950 p-5 text-white shadow-2xl md:bottom-auto md:left-auto md:right-6 md:top-24 md:mx-0">
      <button onClick={postponePwaInstall} aria-label="Me le rappeler dans une semaine" className="absolute right-3 top-3 rounded-full p-2 text-violet-100 hover:bg-violet-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><X size={16} /></button>
      <div className="flex items-center gap-3 pr-7">
        <img src="/favicon-192.png" alt="" className="h-12 w-12 rounded-2xl" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-200">Toujours à portée de main</p>
          <h2 className="mt-1 text-lg font-bold">Installe eGame Bénin</h2>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-violet-100">Ajoute eGame à ton écran d’accueil pour retrouver tes tournois et ta communauté, sans passer par le Play Store.</p>
      <p className="mt-2 text-xs text-violet-200">Installation gratuite · Connexion Internet nécessaire</p>
      {guide && (
        <div className="mt-4 rounded-2xl border border-violet-400/40 bg-violet-900 p-4 text-sm text-violet-50" role="status">
          <p className="mb-2 flex items-center gap-2 font-semibold"><Share2 size={16} /> Depuis ton navigateur</p>
          {ios ? (
            <p>Ouvre ce site dans Safari, touche <strong>Partager</strong>, puis <strong>Sur l’écran d’accueil</strong> et <strong>Ajouter</strong>. Si proposé, active « Ouvrir comme app web ».</p>
          ) : (
            <p>Ouvre ce site dans Chrome, puis le menu <strong>⋮ → Ajouter à l’écran d’accueil</strong> ou <strong>Installer l’application</strong>. Si tu es dans WhatsApp ou Facebook, ouvre d’abord le lien dans ton navigateur.</p>
          )}
          <p className="mt-2 text-xs text-violet-200">Les options varient selon le navigateur. Après l’ajout, lance eGame depuis sa nouvelle icône.</p>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button disabled={busy} onClick={install} className="flex-1 rounded-xl bg-violet-600 px-4 py-3 font-bold text-white hover:bg-violet-500"><Download className="mr-2 h-4 w-4" />{busy ? 'Installation…' : canPrompt ? 'Installer' : 'Comment installer'}</Button>
        <Button variant="outline" onClick={postponePwaInstall} className="rounded-xl border-violet-400 bg-transparent text-white hover:bg-violet-800 hover:text-white">Plus tard</Button>
      </div>
      <button onClick={markPwaInstalled} className="mt-3 w-full rounded-lg py-1 text-xs font-medium text-violet-100 underline underline-offset-4 hover:text-white">Déjà installé sur cet appareil</button>
    </aside>
  );
}
