import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "Erreur 404 : L'utilisateur a tenté d'accéder à une route inexistante :",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 bg-card rounded-[2.5rem] border border-border shadow-2xl">
        <h1 className="text-6xl font-black mb-4 text-violet-500">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Oups ! Cette page n'existe pas.</p>
        <Link to="/" className="inline-block bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-2xl font-bold transition-all">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
