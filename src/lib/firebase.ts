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
    throw new Error("Les Service Workers ne sont pas supportés.");
  }

  try {
    // 1. Enregistrement et attente que le SW soit prêt
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    
    // Attendre que le service worker soit actif
    await navigator.serviceWorker.ready;

    const messaging = getMessaging(app);
    
    // 2. Demande de permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // 3. Récupération du token
      // IMPORTANT: Remplacez 'VOTRE_CLE_VAPID_PUBLIQUE' par la clé de votre console Firebase
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
        throw new Error("Impossible de générer le jeton FCM.");
      }
    } else {
      throw new Error("Permission de notification refusée.");
    }
  } catch (error: any) {
    console.error("[Firebase] Erreur détaillée:", error);
    if (error.code === 'messaging/token-subscribe-failed') {
      throw new Error("Erreur d'authentification FCM. Vérifiez votre clé VAPID et les restrictions de votre clé API dans Google Cloud.");
    }
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