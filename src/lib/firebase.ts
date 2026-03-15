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
const messaging = typeof window !== 'undefined' && 'serviceWorker' in navigator ? getMessaging(app) : null;

export const requestNotificationPermission = async (userId: string) => {
  if (!messaging) {
    console.error("[Firebase] Messaging non supporté ou Service Worker manquant.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BNk49YPeSwHRBHif2ElexCX4ehO5-_OOUKASf9A4TP1GBwbHzZV4PtAbQ08HzXJHDKCbwzidA9HhBAfM6xrH7MU' 
      });

      if (token) {
        console.log("[Firebase] Token récupéré:", token);
        const { error } = await supabase
          .from('profiles')
          .update({ fcm_token: token, notifications_enabled: true })
          .eq('id', userId);
        
        if (error) throw error;
        return token;
      }
    }
  } catch (error) {
    console.error("[Firebase] Erreur permission/token:", error);
    throw error;
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      console.log("[Firebase] Message reçu en premier plan:", payload);
      resolve(payload);
    });
  });