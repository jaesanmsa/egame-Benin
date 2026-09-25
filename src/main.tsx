import React, { Component, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import "./lib/pwaInstall";
import { isModuleLoadError, recoverModuleLoad } from "./utils/moduleRecovery";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    if (isModuleLoadError(error)) recoverModuleLoad();
  }

  public render() {
    if (this.state.hasError && isModuleLoadError(this.state.error)) {
      return (
        <main className="min-h-screen bg-violet-950 text-white flex items-center justify-center p-6">
          <section className="w-full max-w-md rounded-3xl border border-violet-400/50 bg-violet-900 p-8 space-y-5 text-center shadow-xl" role="alert">
            <h1 className="text-2xl font-bold">La page n’a pas pu être chargée</h1>
            <p className="text-violet-100 text-sm leading-relaxed">
              Le site a peut-être été mis à jour, ou votre connexion a été interrompue.
              Vérifiez votre connexion puis rechargez cette page.
            </p>
            <button onClick={() => window.location.reload()} className="w-full rounded-2xl border-2 border-violet-300 bg-violet-600 px-5 py-3 font-bold hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
              Recharger la page
            </button>
            <p className="text-xs text-violet-100">Si le problème persiste, réessayez dans quelques instants.</p>
          </section>
        </main>
      );
    }
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", color: "white", backgroundColor: "#0A0A0F", minHeight: "100vh", fontFamily: "sans-serif" }}>
          <h2>Une erreur s'est produite lors du chargement.</h2>
          <pre style={{ color: "#FF5555", backgroundColor: "#111", padding: "10px", borderRadius: "8px", overflowX: "auto" }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "10px 20px", backgroundColor: "#8A2BE2", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: "10px" }}
          >
            Recharger la page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Retrait sécurisé de l'écran de chargement
const loader = document.getElementById('loading-screen');
if (loader) {
  loader.style.display = 'none';
  loader.remove();
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}