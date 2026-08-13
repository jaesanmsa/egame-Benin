import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

const rootElement = document.getElementById("root")!;
createRoot(rootElement).render(<App />);

// Retrait sécurisé de l'écran de chargement
const removeLoader = () => {
  const loader = document.getElementById('loading-screen');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.visibility = 'hidden';
    setTimeout(() => {
      loader.remove();
    }, 500);
  }
};

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  removeLoader();
} else {
  window.addEventListener('load', removeLoader);
  setTimeout(removeLoader, 1000);
}