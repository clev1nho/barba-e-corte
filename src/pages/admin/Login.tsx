import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scissors, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useShopSettings } from "@/hooks/useShopSettings";
import { toast } from "sonner";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAdminAuth();
  const { data: settings } = useShopSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error, role } = await signIn(email, password);

    if (error) {
      toast.error("Credenciais inválidas. Tente novamente.");
      setLoading(false);
      return;
    }

    if (!role || role === "user") {
      toast.error("Acesso negado. Você não possui permissão de acesso.");
      setLoading(false);
      return;
    }

    toast.success("Login realizado com sucesso!");
    
    if (role === "staff") {
      navigate("/admin/agenda");
    } else {
      navigate("/admin");
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors duration-200">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao site
        </Link>

        <div className="text-center mb-10">
          {settings?.logo_url ? (
            <img 
              src={settings.logo_url} 
              alt={settings.name || "Logo"} 
              className="h-20 w-auto mx-auto mb-5 object-contain"
            />
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-gold mb-5 shadow-lg shadow-primary/15">
              <Scissors className="w-10 h-10 text-primary-foreground" />
            </div>
          )}
          <h1 className="text-2xl font-bold font-display tracking-tight">Área Administrativa</h1>
          <div className="premium-divider mt-3" />
          <p className="text-muted-foreground mt-3 text-sm">Acesso exclusivo para administradores</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@barbeariaexclusiva.com"
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </div>
    </main>
  );
};

export default AdminLogin;
