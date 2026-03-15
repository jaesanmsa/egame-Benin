importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyD2XGohWwMcPedeXTfcgHPK2RZvWLTDYcE",
  authDomain: "egame-benin-be9af.firebaseapp.com",
  projectId: "egame-benin-be9af",
  storageBucket: "egame-benin-be9af.firebasestorage.app",
  messagingSenderId: "986273563315",
  appId: "1:986273563315:web:635e87ddb8c0b5b79526c6",
  measurementId: "G-X2YXK4V044"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Notification en arrière-plan:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon-192.png',
    badge: '/favicon-32.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});