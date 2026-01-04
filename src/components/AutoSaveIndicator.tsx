import React from 'react';
import { Loader2, Check } from 'lucide-react';

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ status }) => {
  if (status === 'idle') return null;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-[11px] font-medium text-muted-foreground transition-all duration-300">
      {status === 'saving' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
          <span>Salvando...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="h-3 w-3 text-primary" />
          <span>Salvo</span>
        </>
      )}
      {status === 'error' && (
        <span className="text-destructive">Erro ao salvar</span>
      )}
    </div>
  );
};
