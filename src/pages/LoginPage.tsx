import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Mail, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || '/chronosadminpage';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login realizado",
        description: "Bem-vindo ao FormChronos Admin.",
      });

      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Erro de login:', err.message);
      setError(err.message === 'Invalid login credentials' 
        ? 'E-mail ou senha incorretos.' 
        : 'Ocorreu um erro ao tentar entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-4 pb-8 text-center">
          <div className="flex justify-center">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">Admin Login</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Proteção de dados e gestão de eventos
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground font-medium text-xs uppercase tracking-wider">
                  E-mail de acesso
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplo@anotae.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 bg-background/50 border-border/40 focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" title="password" className="text-muted-foreground font-medium text-xs uppercase tracking-wider">
                  Senha segura
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-11 bg-background/50 border-border/40 focus:border-primary/50"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[13px] text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-base font-medium transition-all active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Acessar Painel'
              )}
            </Button>
          </form>
        </CardContent>

        <div className="px-8 pb-8 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
            FormChronos © 2026 • Powered by Anotaê
          </p>
        </div>
      </Card>
    </div>
  );
};
