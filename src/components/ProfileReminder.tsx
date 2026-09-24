"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRoundCheck, X, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Réapparition du rappel après fermeture : 5 minutes.
const REMINDER_DELAY_MS = 5 * 60 * 1000;

const ProfileReminder = () => {
  const location = useLocation();
  const [incomplete, setIncomplete] = useState(false);
  const [visible, setVisible] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);
  const comebackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Vérifie les informations clés du profil du joueur connecté.
  const checkProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setIncomplete(false);
      setVisible(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, phone, country, avatar_url')
      .eq('id', session.user.id)
      .maybeSingle();

    const gaps: string[] = [];
    if (!profile?.username?.trim()) gaps.push('pseudo');
    if (!profile?.phone?.trim()) gaps.push('numéro Mobile Money');
    if (!profile?.country?.trim()) gaps.push('pays');
    if (!profile?.avatar_url?.trim()) gaps.push('avatar');

    setMissing(gaps);
    setIncomplete(gaps.length > 0);
    setVisible(gaps.length > 0);
  };

  useEffect(() => {
    checkProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkProfile();
    });

    return () => {
      subscription.unsubscribe();
      if (comebackTimer.current) clearTimeout(comebackTimer.current);
    };
  }, []);

  // Le joueur ferme le rappel : il réapparaît 5 minutes plus tard.
  const dismiss = () => {
    setVisible(false);
    if (comebackTimer.current) clearTimeout(comebackTimer.current);
    comebackTimer.current = setTimeout(() => {
      if (incomplete) setVisible(true);
    }, REMINDER_DELAY_MS);
  };

  // Pas de rappel pendant l'édition du profil ou sur les pages d'authentification.
  const onProfilePage = location.pathname === '/edit-profile' || location.pathname === '/avatar-maker' || location.pathname === '/auth' || location.pathname === '/profil';

  if (!incomplete || !visible || onProfilePage) return null;

  const label = missing.length > 1
    ? `Il manque : ${missing.slice(0, -1).join(', ')} et ${missing[missing.length - 1]}`
    : `Il manque : ${missing[0]}`;

  return (
    <AnimatePresence>
      <motion.div
        key="profile-reminder"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="fixed left-4 right-4 bottom-28 md:left-auto md:right-6 md:bottom-auto md:top-24 z-40 mx-auto md:mx-0 max-w-md"
      >
        <div className="relative bg-[#0F0F1E]/95 backdrop-blur-2xl border border-[#8A2BE2]/50 rounded-3xl p-5 shadow-2xl shadow-[#8A2BE2]/20">
          <button
            onClick={dismiss}
            aria-label="Fermer le rappel"
            className="absolute top-3 right-3 p-1.5 rounded-full text-[#8888AA] hover:text-white hover:bg-[#8A2BE2]/20 transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex items-start gap-4 pr-6">
            <div className="shrink-0 w-11 h-11 rounded-2xl bg-[#8A2BE2]/20 border border-[#8A2BE2]/50 flex items-center justify-center text-[#A855F7]">
              <UserRoundCheck size={22} />
            </div>

            <div className="space-y-2 min-w-0">
              <p className="font-gaming font-black text-white text-sm uppercase tracking-wider flex items-center gap-2">
                Complète ton profil
              </p>
              <p className="text-xs text-[#8888AA] leading-relaxed">
                {label}. Un profil complet facilite tes inscriptions aux tournois et le contact du support.
              </p>

              <Link
                to="/edit-profile"
                className="inline-flex items-center gap-2 mt-2 bg-[#8A2BE2] hover:bg-[#A855F7] text-white font-gaming font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl transition-colors"
              >
                <Sparkles size={13} /> Compléter maintenant
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileReminder;
