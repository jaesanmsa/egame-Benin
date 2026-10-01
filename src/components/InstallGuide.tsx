import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, PlusCircle, CheckCircle2, Copy, Compass, Smartphone, ArrowUp } from 'lucide-react';
import { usePwaInstall, markPwaInstalled } from '@/lib/pwaInstall';

interface InstallGuideProps {
  open: boolean;
  onClose: () => void;
}

const SITE_URL = 'https://www.egamebenin.com';

interface StepProps {
  n: number;
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}

const Step = ({ n, icon, title, children }: StepProps) => (
  <li className="flex gap-3 items-start">
    <div className="shrink-0 w-7 h-7 rounded-full bg-[#8A2BE2] text-white flex items-center justify-center text-xs font-gaming font-black shadow-lg shadow-[#8A2BE2]/30">
      {n}
    </div>
    <div className="min-w-0 flex-1 space-y-1">
      <p className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
        {title}
        <span className="text-[#A855F7]">{icon}</span>
      </p>
      {children}
    </div>
  </li>
);

/**
 * Assistant d'installation pas-à-pas.
 * Sur iPhone, Apple n'autorise aucune installation en un clic : la seule porte
 * d'entrée est « Partager → Sur l'écran d'accueil » dans Safari. Le guide
 * s'adapte : déjà dans Safari (aucune mention inutile) ou autre navigateur iOS
 * (explication simple de la règle Apple + copie de l'adresse).
 */
const InstallGuide = ({ open, onClose }: InstallGuideProps) => {
  const { ios, iosSafari } = usePwaInstall();
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const finish = () => {
    markPwaInstalled();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm px-3 pb-3 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Installer eGame Bénin sur mon écran d'accueil"
            className="w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-3xl border border-[#8A2BE2]/50 bg-[#0F0F1E] shadow-2xl shadow-[#8A2BE2]/20"
          >
            {/* En-tête */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-[#0F0F1E]/95 backdrop-blur px-5 py-4 border-b border-[#8A2BE2]/20">
              <p className="text-sm font-gaming font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Smartphone size={18} className="text-[#A855F7]" />
                Installer <span className="text-[#FFD700]">eGame Bénin</span>
              </p>
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="p-2 rounded-full border border-white/10 text-[#8888AA] hover:text-white hover:border-[#8A2BE2]/60 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {ios ? (
                iosSafari ? (
                  <>
                    {/* ===== iPhone, déjà dans Safari : 3 étapes directes ===== */}
                    <p className="text-xs text-[#8888AA] leading-relaxed">
                      Tu es dans Safari — parfait ! 3 gestes suffisent pour retrouver eGame
                      sur ton écran d'accueil, comme une vraie application :
                    </p>

                    <ol className="space-y-4">
                      <Step n={1} icon={<ArrowUp size={15} />} title="Touche le bouton Partager">
                        <p className="text-[11px] text-[#8888AA] leading-relaxed">
                          C'est le <strong className="text-white">carré avec une flèche vers le haut ⬆️</strong>,
                          au bas de l'écran, au milieu de la barre de Safari.
                        </p>
                      </Step>
                      <Step n={2} icon={<Share2 size={15} />} title="Fais défiler, puis touche « Sur l'écran d'accueil »">
                        <p className="text-[11px] text-[#8888AA] leading-relaxed">
                          Glisse la liste du menu Partager vers le bas jusqu'à voir l'option.
                        </p>
                      </Step>
                      <Step n={3} icon={<PlusCircle size={15} />} title="Touche « Ajouter »">
                        <p className="text-[11px] text-[#8888AA] leading-relaxed">
                          L'icône eGame Bénin apparaît sur ton écran d'accueil 🎮
                        </p>
                      </Step>
                    </ol>

                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                      <p className="text-[10px] text-emerald-200/90 font-bold leading-relaxed">
                        ✅ Une fois ajoutée, l'app s'ouvre en plein écran, sans la barre de Safari,
                        et fonctionne comme une vraie application.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* ===== iPhone, autre navigateur que Safari ===== */}
                    <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-2">
                      <p className="text-xs font-gaming font-black text-amber-300 uppercase tracking-wide flex items-center gap-2">
                        <Compass size={15} /> Passe par Safari (obligatoire)
                      </p>
                      <p className="text-[11px] text-amber-100/90 leading-relaxed">
                        Sur iPhone, <strong className="text-white">Apple autorise uniquement Safari</strong> à
                        installer des applications web sur l'écran d'accueil. C'est une règle d'Apple pour
                        tous les sites — rien à voir avec eGame. 20 secondes et c'est fait !
                      </p>
                      <button
                        onClick={copyUrl}
                        className="w-full mt-1 py-2.5 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-100 font-gaming font-black text-[10px] uppercase tracking-widest hover:bg-amber-500/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <Copy size={13} />
                        {copied ? 'Adresse copiée ✓' : `Copier l'adresse ${SITE_URL.replace('https://www.', '')}`}
                      </button>
                    </div>

                    <ol className="space-y-4">
                      <Step n={1} icon={<Compass size={15} />} title="Ouvre Safari (l'app au logo bleu 🧭)">
                        <p className="text-[11px] text-[#8888AA] leading-relaxed">
                          Colle (ou tape) l'adresse copiée ci-dessus dans la barre d'adresse de Safari.
                        </p>
                      </Step>
                      <Step n={2} icon={<ArrowUp size={15} />} title="Touche le bouton Partager ⬆️">
                        <p className="text-[11px] text-[#8888AA] leading-relaxed">
                          Le carré avec la flèche vers le haut, au bas de l'écran.
                        </p>
                      </Step>
                      <Step n={3} icon={<PlusCircle size={15} />} title="« Sur l'écran d'accueil » puis « Ajouter »">
                        <p className="text-[11px] text-[#8888AA] leading-relaxed">
                          Fais défiler le menu Partager pour trouver l'option. L'icône eGame
                          arrive sur ton écran d'accueil 🎮
                        </p>
                      </Step>
                    </ol>
                  </>
                )
              ) : (
                <>
                  {/* ===== Android : menu du navigateur ===== */}
                  <p className="text-xs text-[#8888AA] leading-relaxed">
                    Quelques secondes suffisent depuis le menu de ton navigateur :
                  </p>

                  <ol className="space-y-4">
                    <Step n={1} icon={<Compass size={15} />} title="Ouvre eGame dans Chrome">
                      <p className="text-[11px] text-[#8888AA] leading-relaxed">
                        Si tu es dans WhatsApp, Facebook ou Instagram, appuie sur ⋮ puis
                        « Ouvrir dans Chrome ».
                      </p>
                    </Step>
                    <Step n={2} icon={<span className="font-black">⋮</span>} title="Ouvre le menu ⋮ en haut à droite">
                      <p className="text-[11px] text-[#8888AA] leading-relaxed">
                        Les trois petits points verticaux de Chrome.
                      </p>
                    </Step>
                    <Step n={3} icon={<PlusCircle size={15} />} title="« Installer l'application »">
                      <p className="text-[11px] text-[#8888AA] leading-relaxed">
                        Ou « Ajouter à l'écran d'accueil » selon la version. L'icône eGame
                        s'installe comme une vraie app 🎮
                      </p>
                    </Step>
                  </ol>
                </>
              )}

              <div className="pt-1 flex flex-col gap-2">
                <button
                  onClick={finish}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#8A2BE2] to-[#A855F7] hover:brightness-110 text-white font-gaming font-black text-xs uppercase tracking-widest shadow-lg shadow-[#8A2BE2]/30 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={15} /> J'ai réussi, c'est installé
                </button>
                <p className="text-[10px] text-[#8888AA]/70 text-center">
                  eGame s'ouvrira ensuite en plein écran, comme une vraie application.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallGuide;
