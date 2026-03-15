// Ce fichier est nécessaire pour recevoir les notifications en arrière-plan
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// REMPLACEZ PAR VOTRE CONFIGURATION FIREBASE RÉELLE
firebase.initializeApp({
  apiKey: "AIzaSyB-v-v-v-v-v-v-v-v-v-v-v-v-v-v",
  authDomain: "egame-benin.firebaseapp.com",
  projectId: "egame-benin",
  storageBucket: "egame-benin.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Notification reçue en arrière-plan ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon-192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});