import React, { Component, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

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
  }

  public render() {
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