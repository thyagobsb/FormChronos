import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import type { FormSchema } from '@/lib/validations';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { FormItemLayout } from '@/components/common/FormItemLayout';
import { cn } from '@/lib/utils';
import { Info, CheckCircle2 } from 'lucide-react';

interface Step4Props {
  form: UseFormReturn<FormSchema>;
}

const AREA_ITEMS = [
  { id: 'info_pista', label: 'Pista' },
  { id: 'info_pista_premium', label: 'Pista Premium/Front Stage' },
  { id: 'info_areavip', label: 'Área VIP' },
  { id: 'info_camarote', label: 'Camarote' },
  { id: 'info_camarote_openbar', label: 'Camarote Open Bar' },
  { id: 'info_lounge', label: 'Lounge' },
  { id: 'info_arquibancada', label: 'Arquibancada' },
  { id: 'info_openbar', label: 'Evento Open Bar', highlight: true },
  { id: 'info_openfood', label: 'Open Food' },
  { id: 'info_mesas', label: 'Mesas' },
  { id: 'info_bistros', label: 'Bistrôs' },
  { id: 'info_mesas_num', label: 'Mesas Numeradas' },
  { id: 'info_camarote_corp', label: 'Camarote Corporativo' },
  { id: 'info_hospitality', label: 'Hospitality' },
  { id: 'info_convidados', label: 'Convidados' },
  { id: 'info_meetgreet', label: 'Meet & Greet' },
  { id: 'info_diferenciais', label: 'Diferenciais' },
  { id: 'info_pontos_fisicos', label: 'Pontos Físicos' },
  { id: 'info_estacionamento', label: 'Estacionamento' },
  { id: 'info_limitacoes', label: 'Limitações Específicas' },
  { id: 'info_acessibilidade', label: 'Acessibilidade' },
  { id: 'info_area_pcd', label: 'Espaço Área PCD' },
  { id: 'info_meia_entrada', label: 'Meia Entrada' },
  { id: 'info_meia_social', label: 'Meia Entrada Social' },
] as const;

export const Step4Areas: React.FC<Step4Props> = ({ form }) => {
  const { register, setValue, control, formState: { errors } } = form;

  // Usar useWatch global para a lista, mas as atualizações individuais serão tratadas com cuidado
  const areasValues = useWatch({
    control,
    name: "areas"
  }) || {};

  const toggleArea = (id: string, currentStatus: boolean) => {
    const newVal = !currentStatus;
    setValue(`areas.${id}.ativa` as any, newVal, { shouldDirty: true });
    
    if (id === 'info_openbar' && newVal) {
      setValue("evento.classificacao", "18+", { shouldDirty: true });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3 items-start">
        <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">Configuração de Benefícios</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Selecione os setores e diferenciais do seu evento. Para cada item marcado, 
            descreva detalhadamente os benefícios e o que está incluso.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {AREA_ITEMS.map((item) => {
          const isActive = !!areasValues[item.id]?.ativa;
          const hasError = (errors.areas as any)?.[item.id]?.descricao;

          return (
            <Card 
              key={item.id} 
              className={cn(
                "transition-all duration-300 border-border/50 overflow-hidden",
                isActive 
                  ? "border-primary/30 ring-1 ring-primary/10 shadow-md bg-primary/[0.02]" 
                  : "hover:border-primary/20 bg-background/50 opacity-80"
              )}
            >
              <CardContent className="p-0">
                <div 
                  className={cn(
                    "flex items-center justify-between p-4 cursor-pointer select-none group/row",
                    isActive ? "bg-primary/5" : "hover:bg-muted/30"
                  )}
                  onClick={() => toggleArea(item.id, isActive)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] scale-110" 
                        : "bg-muted text-muted-foreground group-hover/row:bg-primary/10 group-hover/row:scale-105"
                    )}>
                      {isActive ? (
                        <CheckCircle2 className="w-6 h-6 animate-pulse" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-current opacity-30 group-hover/row:opacity-100" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <span className={cn(
                        "text-sm font-bold tracking-tight transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground group-hover/row:text-foreground"
                      )}>
                        {item.label}
                      </span>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Switch 
                      checked={isActive} 
                      onCheckedChange={() => toggleArea(item.id, isActive)}
                    />
                  </div>
                </div>

                {isActive && (
                  <div className="p-4 pt-0 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="h-px bg-border/50 mb-3" />
                    <FormItemLayout 
                      label={`Benefícios e Detalhes - ${item.label}`}
                      error={hasError?.message}
                    >
                      <Textarea 
                        {...register(`areas.${item.id}.descricao` as any)} 
                        placeholder={`Descreva o que está incluso no(a) ${item.label.toLowerCase()}...`} 
                        className={cn(
                          "resize-none h-24 text-xs transition-all focus:h-32",
                          hasError ? "border-destructive/50 bg-destructive/5" : "bg-background/80"
                        )}
                      />
                    </FormItemLayout>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
