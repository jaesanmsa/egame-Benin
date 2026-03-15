import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { supabase } from "./supabase";

const firebaseConfig = {
  apiKey: "AIzaSyD2XGohWwMcPedeXTfcgHPK2RZvWLTDYcE",
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
    throw new Error("Les Service Workers ne sont pas supportés par ce navigateur.");
  }

  try {
    // On s'assure que le service worker est bien enregistré avant de demander le token
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log("[Firebase] Service Worker enregistré avec succès:", registration);

    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
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
        throw new Error("Aucun jeton d'enregistrement (FCM token) n'a été généré.");
      }
    } else {
      throw new Error("La permission de notification a été refusée.");
    }
  } catch (error: any) {
    console.error("[Firebase] Erreur détaillée:", error);
    throw error;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (typeof window === 'undefined') return;
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      console.log("[Firebase] Message reçu en premier plan:", payload);
      resolve(payload);
    });
  });