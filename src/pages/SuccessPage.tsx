import { CheckCircle2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const SuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full space-y-8 text-center animate-in fade-in zoom-in duration-700">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />
            <div className="relative bg-background border-2 border-primary rounded-full p-6">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Dados Enviados!</h1>
          <p className="text-muted-foreground leading-relaxed">
            As informações do seu evento foram coletadas com sucesso e nossa equipe de produção já foi notificada.
          </p>
        </div>

        <div className="pt-6">
          <Button 
            onClick={() => navigate('/')} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8"
          >
            <Home className="mr-2 h-4 w-4" />
            Voltar para o Início
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          FormChronos © 2026
        </p>
      </div>
    </div>
  );
};
