import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { FormSchema } from '@/lib/validations';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/FileUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormItemLayout } from '@/components/common/FormItemLayout';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface Step3Props {
  form: UseFormReturn<FormSchema>;
}

export const Step3Atracoes: React.FC<Step3Props> = ({ form }) => {
  const { register, setValue, watch, formState: { errors } } = form;

  const renderAtracao = (num: number, isPrincipal: boolean = false) => {
    const key = isPrincipal ? "atracao_01" : `atracao_0${num}` as keyof FormSchema['atracoes'];
    const title = isPrincipal ? "Atração Principal" : `Atração 0${num}`;
    const nameLabel = isPrincipal ? "Nome da Atração Principal" : `Nome da Atração 0${num}`;
    const releaseLabel = isPrincipal ? "Release Atração Principal" : `Release Atração 0${num}`;
    
    // Check if optional attraction is active
    const isActive = isPrincipal || watch(`atracoes.${key}.ativa` as any);

    return (
      <Card key={num} className={cn(
        "transition-all duration-300",
        isPrincipal ? "border-primary/20 bg-primary/2" : "opacity-90 hover:opacity-100"
      )}>
        <CardHeader className={cn(isPrincipal ? "pb-4" : "py-3")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={cn(isPrincipal ? "bg-primary" : "bg-muted text-muted-foreground", "font-medium")}>
                {num}
              </Badge>
              <CardTitle className="text-lg font-medium text-primary">{title}</CardTitle>
            </div>
            {!isPrincipal && (
              <div className="flex items-center transition-all">
                <Switch
                  checked={isActive}
                  disabled={
                    (num === 3 && !watch("atracoes.atracao_02.ativa")) ||
                    (num === 4 && !watch("atracoes.atracao_03.ativa"))
                  }
                  onCheckedChange={(val) => {
                    setValue(`atracoes.${key}.ativa` as any, val, { shouldDirty: true, shouldValidate: true });
                    // Deativação em cascata
                    if (num === 2 && !val) {
                      setValue("atracoes.atracao_03.ativa", false, { shouldValidate: true });
                      setValue("atracoes.atracao_04.ativa", false, { shouldValidate: true });
                    }
                    if (num === 3 && !val) {
                      setValue("atracoes.atracao_04.ativa", false, { shouldValidate: true });
                    }
                  }}
                />
              </div>
            )}
          </div>
        </CardHeader>

        {isActive && (
          <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            {/* Nome da Atração - Full Width Row */}
            <FormItemLayout 
              label={nameLabel} 
              error={(errors.atracoes as any)?.[key]?.nome?.message}
            >
              <Input 
                {...register(`atracoes.${key}.nome` as any)} 
                placeholder={`Nome da ${title.toLowerCase()}`} 
              />
            </FormItemLayout>

            {/* Grid for Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormItemLayout 
                label={`Logo ${title}`}
                error={(errors.atracoes as any)?.[key]?.logo?.message}
              >
                <FileUpload 
                  defaultValue={watch(`atracoes.${key}.logo` as any)}
                  onUploadComplete={(url) => setValue(`atracoes.${key}.logo` as any, url)}
                  dimensions="1200x480px"
                />
              </FormItemLayout>

              <FormItemLayout 
                label={`Foto 01 ${title}`}
                error={(errors.atracoes as any)?.[key]?.foto01?.message}
              >
                <FileUpload 
                  defaultValue={watch(`atracoes.${key}.foto01` as any)}
                  onUploadComplete={(url) => setValue(`atracoes.${key}.foto01` as any, url)}
                  dimensions="1440x2560px"
                />
              </FormItemLayout>

              <FormItemLayout 
                label={`Foto 02 ${title}`}
                error={(errors.atracoes as any)?.[key]?.foto02?.message}
              >
                <FileUpload 
                  defaultValue={watch(`atracoes.${key}.foto02` as any)}
                  onUploadComplete={(url) => setValue(`atracoes.${key}.foto02` as any, url)}
                  dimensions="1440x2560px"
                />
              </FormItemLayout>
            </div>

            {/* Release - Full Width Row */}
            <div className="space-y-1.5">
              <div className="flex items-end gap-2">
                <label className="text-sm font-medium leading-none truncate">
                  {releaseLabel}
                </label>
                <span className={cn(
                  "text-[9px] font-medium uppercase tracking-wider",
                  (watch(`atracoes.${key}.release` as any)?.length || 0) > 1000 ? "text-red-500" : "text-primary bg-primary/10 px-1.5 py-0.5 rounded"
                )}>
                  {watch(`atracoes.${key}.release` as any)?.length || 0} / 1000
                </span>
              </div>
              <FormItemLayout error={(errors.atracoes as any)?.[key]?.release?.message}>
                <Textarea 
                  {...register(`atracoes.${key}.release` as any)} 
                  placeholder={`Descreva a trajetória da ${title.toLowerCase()}...`} 
                  className="resize-none h-32"
                />
              </FormItemLayout>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {renderAtracao(1, true)}
      {[2, 3, 4].map((num) => renderAtracao(num))}
    </div>
  );
};
