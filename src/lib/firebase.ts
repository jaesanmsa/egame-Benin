import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { supabase } from "./supabase";

const firebaseConfig = {
  apiKey: "AIzaSyApEBdsAlebt0znnUEYzEN6JYDEpW4mLTM",
  authDomain: "egame-benin-be9af.firebaseapp.com",
  projectId: "egame-benin-be9af",
  storageBucket: "egame-benin-be9af.firebasestorage.app",
  messagingSenderId: "986273563315",
  appId: "1:986273563315:web:635e87ddb8c0b5b79526c6",
  measurementId: "G-X2YXK4V044"
};

const app = initializeApp(firebaseConfig);

export const requestNotificationPermission = async (userId: string) => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    throw new Error("Les Service Workers ne sont pas supportés.");
  }

  try {
    // 1. Nettoyage des anciens Service Workers pour forcer la nouvelle config
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      await reg.unregister();
    }

    // 2. Nouvel enregistrement
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;

    const messaging = getMessaging(app);
    
    // 3. Demande de permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // 4. Récupération du token avec la clé VAPID publique
      const token = await getToken(messaging, {
        vapidKey: 'BNk49YPeSwHRBHif2ElexCX4ehO5-_OOUKASf9A4TP1GBwbHzZV4PtAbQ08HzXJHDKCbwzidA9HhBAfM6xrH7MU',
        serviceWorkerRegistration: registration
      });

      if (token) {
        const { error } = await supabase
          .from('profiles')
          .update({ fcm_token: token, notifications_enabled: true })
          .eq('id', userId);
        
        if (error) throw error;
        return token;
      } else {
        throw new Error("Le jeton FCM n'a pas pu être généré.");
      }
    } else {
      throw new Error("Permission de notification refusée.");
    }
  } catch (error: any) {
    console.error("[Firebase] Erreur lors de l'abonnement:", error);
    throw error;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (typeof window === 'undefined') return;
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      console.log("[Firebase] Message reçu:", payload);
      resolve(payload);
    });
  });