import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Masquage immédiat du loader
const loader = document.getElementById('loading-screen');
if (loader) {
  loader.style.display = 'none';
  loader.remove();
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}