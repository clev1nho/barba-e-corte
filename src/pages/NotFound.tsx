import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center">
        <h1 className="mb-4 text-7xl font-bold font-display text-gradient">404</h1>
        <div className="premium-divider" />
        <p className="mb-8 text-lg text-muted-foreground">Página não encontrada</p>
        <Link to="/">
          <Button variant="outline" className="border-primary/15 hover:border-primary/25">
            <Home className="w-4 h-4" />
            Voltar para o início
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
