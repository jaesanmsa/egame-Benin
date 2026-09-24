const RETRY_KEY = 'egame:module-reload-at';
const RETRY_WINDOW_MS = 5 * 60 * 1000;

export function isModuleLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i.test(message);
}

export function recoverModuleLoad(): boolean {
  if (!navigator.onLine) return false;
  try {
    const previous = Number(sessionStorage.getItem(RETRY_KEY));
    if (previous && Date.now() - previous < RETRY_WINDOW_MS) return false;
    sessionStorage.setItem(RETRY_KEY, String(Date.now()));
  } catch {
    // Sans stockage persistant, ne pas risquer une boucle de rechargements.
    return false;
  }
  window.location.reload();
  return true;
}

window.addEventListener('vite:preloadError', (event) => {
  if (recoverModuleLoad()) event.preventDefault();
});
