import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

const rootElement = document.getElementById("root")!;
createRoot(rootElement).render(<App />);

// Retrait de l'écran de chargement avec fondu
window.addEventListener('load', () => {
  const loader = document.getElementById('loading-screen');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.visibility = 'hidden';
    setTimeout(() => {
      loader.remove();
    }, 500);
  }
});