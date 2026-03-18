import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { supabase } from "./supabase";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "egame-benin-be9af.firebaseapp.com",
  projectId: "egame-benin-be9af",
  storageBucket: "egame-benin-be9af.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-X2YXK4V044"
};

const app = initializeApp(firebaseConfig);

export const requestNotificationPermission = async (userId: string) => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    throw new Error("Les Service Workers ne sont pas supportés.");
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      await reg.unregister();
    }

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;

    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BNk49YPeSwHRBHif2ElexCX4ehO5-_O0UKASf9A4TP1GBwbHzZV4PtAbQ08HzXJHDKCbwzidA9HhBAfM6xrH7MU',
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