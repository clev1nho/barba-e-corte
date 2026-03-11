import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold font-display text-primary">404</h1>
        <div className="premium-divider" />
        <p className="mb-6 text-lg text-muted-foreground">Página não encontrada</p>
        <a href="/" className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors duration-200">
          Voltar para o início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
