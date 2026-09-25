import { useSyncExternalStore } from 'react';

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const INSTALLED_KEY = 'egame:pwa-installed';
const LATER_KEY = 'egame:pwa-later';
const listeners = new Set<() => void>();
const standalone = window.matchMedia('(display-mode: standalone)');
const isStandalone = () => standalone.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const read = (key: string) => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const save = (key: string, value: string) => {
  try { localStorage.setItem(key, value); } catch { /* Private browsing can disable storage. */ }
};
let installed = isStandalone() || read(INSTALLED_KEY) === 'true';
let laterUntil = Number(read(LATER_KEY)) || 0;
let promptEvent: InstallPrompt | null = null;
let version = 0;
const notify = () => { version += 1; listeners.forEach(listener => listener()); };

export function markPwaInstalled() {
  installed = true;
  promptEvent = null;
  save(INSTALLED_KEY, 'true');
  notify();
}

export function postponePwaInstall() {
  laterUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
  save(LATER_KEY, String(laterUntil));
  notify();
}

// Loaded at startup so the browser event is captured before lazy pages mount.
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  promptEvent = event as InstallPrompt;
  notify();
});
window.addEventListener('appinstalled', markPwaInstalled);
standalone.addEventListener('change', () => {
  if (isStandalone()) markPwaInstalled();
});
window.addEventListener('storage', event => {
  if (event.key === INSTALLED_KEY || event.key === LATER_KEY || event.key === null) {
    installed = isStandalone() || read(INSTALLED_KEY) === 'true';
    laterUntil = Number(read(LATER_KEY)) || 0;
    notify();
  }
});
if (isStandalone()) save(INSTALLED_KEY, 'true');

export async function requestPwaInstall() {
  const current = promptEvent;
  if (!current) return;
  promptEvent = null;
  try {
    await current.prompt();
    const choice = await current.userChoice;
    if (choice.outcome === 'accepted') markPwaInstalled();
    else postponePwaInstall();
  } finally {
    notify();
  }
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

export function usePwaInstall() {
  useSyncExternalStore(subscribe, () => version);
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const mobile = ios || /Android/.test(navigator.userAgent);
  return {
    ios,
    canPrompt: !!promptEvent,
    shouldOffer: !installed && !isStandalone() && Date.now() >= laterUntil && (mobile || !!promptEvent),
  };
}
