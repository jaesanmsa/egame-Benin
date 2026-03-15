import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { supabase } from "./supabase";

// IMPORTANT : Remplacez ces valeurs par celles de votre projet Firebase (Console Firebase > Paramètres du projet)
const firebaseConfig = {
  apiKey: "AIzaSyB-v-v-v-v-v-v-v-v-v-v-v-v-v-v", 
  authDomain: "egame-benin.firebaseapp.com",
  projectId: "egame-benin",
  storageBucket: "egame-benin.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const messaging = typeof window !== 'undefined' && 'serviceWorker' in navigator ? getMessaging(app) : null;

export const requestNotificationPermission = async (userId: string) => {
  if (!messaging) {
    console.error("Le navigateur ne supporte pas les notifications ou le Service Worker est manquant.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // REMPLACEZ 'VAPID_KEY_HERE' par votre clé VAPID (Console Firebase > Cloud Messaging > Web configuration)
      const token = await getToken(messaging, {
        vapidKey: 'VAPID_KEY_HERE' 
      });

      if (token) {
        await supabase
          .from('profiles')
          .update({ fcm_token: token, notifications_enabled: true })
          .eq('id', userId);
        return token;
      }
    } else {
      console.warn("Permission de notification refusée par l'utilisateur.");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du token FCM:", error);
    throw error;
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });