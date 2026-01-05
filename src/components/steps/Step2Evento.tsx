import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import type { FormSchema } from '@/lib/validations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/FileUpload';
import { FormItemLayout } from '@/components/common/FormItemLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Step2Props {
  form: UseFormReturn<FormSchema>;
}

export const Step2Evento: React.FC<Step2Props> = ({ form }) => {
  const { register, setValue, watch, formState: { errors } } = form;
  const [generos, setGeneros] = useState<{ id: string; nome: string }[]>([]);
  const [ticketeiras, setTicketeiras] = useState<{ id: string; nome: string }[]>([]);
  const [isLoadingRefs, setIsLoadingRefs] = useState(true);

  useEffect(() => {
    const fetchRefs = async () => {
      try {
        const [genRes, tickRes] = await Promise.all([
          supabase.from('generos_musicais').select('id, nome').order('nome'),
          supabase.from('ticketeiras').select('id, nome').order('nome')
        ]);

        if (genRes.data) setGeneros(genRes.data);
        if (tickRes.data) setTicketeiras(tickRes.data);
      } catch (err) {
        console.error("Erro ao carregar referências:", err);
      } finally {
        setIsLoadingRefs(false);
      }
    };

    fetchRefs();
  }, []);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-primary">Dados do Evento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <FormItemLayout
            label="Nome do Evento"
            error={errors.evento?.nome_evento?.message}
          >
            <Input {...register("evento.nome_evento")} placeholder="Ex: Festival de Verão 2026" />
          </FormItemLayout>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            <FormItemLayout
              label="Local"
              error={errors.evento?.local?.message}
            >
              <Input {...register("evento.local")} placeholder="Ex: Allianz Parque" />
            </FormItemLayout>

            <FormItemLayout
              label="End. do Local"
              error={errors.evento?.localizacao_endereco?.message}
            >
              <Input {...register("evento.localizacao_endereco")} placeholder="Rua, número, bairro" />
            </FormItemLayout>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
             <FormItemLayout
              label="Cidade"
              error={errors.evento?.cidade?.message}
            >
              <Input {...register("evento.cidade")} placeholder="Cidade" />
            </FormItemLayout>

            <FormItemLayout
              label="Estado"
              error={errors.evento?.estado?.message}
            >
              <Select onValueChange={(val) => setValue("evento.estado", val)} value={watch("evento.estado")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione UF" />
                </SelectTrigger>
                <SelectContent>
                  {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItemLayout>
          </div>

          {/* Seção de Horários */}
          <div className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
              <div className="grid grid-cols-2 gap-6">
                <FormItemLayout
                  label="Data"
                  error={errors.evento?.data_evento?.message}
                >
                  <Input type="date" {...register("evento.data_evento")} />
                </FormItemLayout>
                
                <FormItemLayout label="Hora Início" error={errors.evento?.hora_inicio_evento?.message}>
                  <Input type="time" {...register("evento.hora_inicio_evento")} />
                </FormItemLayout>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormItemLayout label="Hora Término" error={errors.evento?.hora_termino_evento?.message}>
                  <Input type="time" {...register("evento.hora_termino_evento")} />
                </FormItemLayout>
                <FormItemLayout label="Abertura Portões" error={errors.evento?.abertura_portoes?.message}>
                  <Input type="time" {...register("evento.abertura_portoes")} />
                </FormItemLayout>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-primary">Presença Digital & Classificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItemLayout label="Instagram do Evento" error={errors.evento?.insta_evento?.message}>
              <Input 
                {...register("evento.insta_evento")} 
                placeholder="@usuario" 
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val && !val.startsWith('@')) {
                    setValue("evento.insta_evento", `@${val}`, { shouldValidate: true });
                  }
                }}
              />
            </FormItemLayout>
            <FormItemLayout label="Site do Evento" error={errors.evento?.site_evento?.message}>
              <Input 
                {...register("evento.site_evento")} 
                placeholder="https://..." 
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val && !val.startsWith('http')) {
                    setValue("evento.site_evento", `https://${val}`, { shouldValidate: true });
                  }
                }}
              />
            </FormItemLayout>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItemLayout 
              label="Contato (Whatsapp)" 
              error={errors.evento?.contato_info?.message}
            >
              <Input 
                {...register("evento.contato_info")} 
                placeholder="(00) 00000-0000" 
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, "");
                  if (val.length > 11) val = val.slice(0, 11);
                  
                  // Aplicar máscara
                  let formatted = val;
                  if (val.length > 2) {
                    formatted = `(${val.slice(0, 2)}) ${val.slice(2)}`;
                  }
                  if (val.length > 7) {
                    formatted = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
                  }
                  
                  setValue("evento.contato_info", formatted, { shouldValidate: true });
                }}
              />
            </FormItemLayout>
            
            <FormItemLayout 
              label="Ticketeira" 
              error={errors.evento?.ticketeira?.message}
            >
              <Select 
                onValueChange={(v) => {
                  setValue("evento.ticketeira", v);
                  const selected = ticketeiras.find(t => t.nome === v);
                  setValue("evento.ticketeira_id", selected?.id || null);
                }} 
                value={watch("evento.ticketeira")}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingRefs ? "Carregando..." : "Selecione a ticketeira..."} />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingRefs ? (
                    <div className="p-2 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <>
                      {ticketeiras.map((t) => (
                        <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>
                      ))}
                      <SelectItem value="Outra">Outra</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </FormItemLayout>
          </div>

          {watch("evento.ticketeira") === "Outra" && (
            <>
              <FormItemLayout
                label="Nome da Ticketeira"
                error={errors.evento?.nome_ticketeira_outra?.message}
              >
                <Input {...register("evento.nome_ticketeira_outra")} placeholder="Nome da plataforma" />
              </FormItemLayout>
              <FormItemLayout label="Logo da Ticketeira">
                <FileUpload
                  dimensions="1954x638px"
                  defaultValue={watch("evento.logo_ticketeira_outra")}
                  onUploadComplete={(url) => setValue("evento.logo_ticketeira_outra", url)}
                />
              </FormItemLayout>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItemLayout
              label="Gênero Musical"
              error={errors.evento?.genero_evento?.message}
            >
              <Select 
                onValueChange={(v) => {
                  setValue("evento.genero_evento", v);
                  const selected = generos.find(g => g.nome === v);
                  setValue("evento.genero_musical_id", selected?.id || null);
                }} 
                value={watch("evento.genero_evento")}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingRefs ? "Carregando..." : "Selecione o gênero..."} />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingRefs ? (
                    <div className="p-2 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <>
                      {generos.map((g) => (
                        <SelectItem key={g.id} value={g.nome}>{g.nome}</SelectItem>
                      ))}
                      <SelectItem value="Outro">Outro</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </FormItemLayout>

            <FormItemLayout
              label="Classificação"
              error={errors.evento?.classificacao?.message}
            >
              <Select onValueChange={(v) => setValue("evento.classificacao", v)} value={watch("evento.classificacao")}>
                <SelectTrigger disabled={watch("complemento.info_openbar.ativa" as any)}>
                  <SelectValue placeholder="Selecione a idade..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Livre">Livre</SelectItem>
                  <SelectItem value="10+">10+</SelectItem>
                  <SelectItem value="12+">12+</SelectItem>
                  <SelectItem value="14+">14+</SelectItem>
                  <SelectItem value="16+">16+</SelectItem>
                  <SelectItem value="18+">18+</SelectItem>
                </SelectContent>
              </Select>
            </FormItemLayout>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-end gap-2 px-1">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Release do Evento
              </label>
              <span className={cn(
                "text-[9px] font-medium uppercase tracking-wider",
                (watch("evento.release_evento")?.length || 0) > 2000 ? "text-red-500" : "text-primary bg-primary/10 px-1.5 py-0.5 rounded"
              )}>
                {watch("evento.release_evento")?.length || 0} / 2000
              </span>
            </div>
            <FormItemLayout error={errors.evento?.release_evento?.message}>
              <Textarea 
                {...register("evento.release_evento")} 
                placeholder="Descreva o evento em detalhes..." 
                className="resize-none h-32"
              />
            </FormItemLayout>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-primary">Produção & Apoio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Produção */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <h4 className="font-medium text-sm">Produção</h4>
                <Switch 
                  checked={watch("evento.producao.ativa")} 
                  onCheckedChange={(val) => setValue("evento.producao.ativa", val)} 
                />
              </div>
              {watch("evento.producao.ativa") && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300 pl-2">
                  <FormItemLayout 
                    label="Produção" 
                    error={errors.evento?.producao?.nome?.message}
                  >
                    <Input {...register("evento.producao.nome")} placeholder="Nome da produtora" />
                  </FormItemLayout>
                  <FormItemLayout label="Logo Produção">
                    <FileUpload
                      dimensions="1954x638px"
                      defaultValue={watch("evento.producao.logo")}
                      onUploadComplete={(url) => setValue("evento.producao.logo", url)}
                    />
                  </FormItemLayout>
                </div>
              )}
            </div>

            {/* Patrocinador */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <h4 className="font-medium text-sm">Patrocinador</h4>
                <Switch 
                  checked={watch("evento.patrocinador.ativa")} 
                  onCheckedChange={(val) => {
                    setValue("evento.patrocinador.ativa", val);
                  }} 
                />
              </div>
              {watch("evento.patrocinador.ativa") && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300 pl-2">
                  <FormItemLayout 
                    label="Patrocinador" 
                    error={errors.evento?.patrocinador?.nome?.message}
                  >
                    <Input {...register("evento.patrocinador.nome")} placeholder="Nome do patrocinador" />
                  </FormItemLayout>
                  <FormItemLayout label="Logo Patrocinador">
                    <FileUpload
                      dimensions="1954x638px"
                      defaultValue={watch("evento.patrocinador.logo")}
                      onUploadComplete={(url) => setValue("evento.patrocinador.logo", url)}
                    />
                  </FormItemLayout>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Apoio 01 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <h4 className="font-medium text-sm">Apoio 01</h4>
                <Switch 
                  checked={watch("evento.apoio_01.ativa")} 
                  onCheckedChange={(val) => {
                    setValue("evento.apoio_01.ativa", val);
                    if (!val) {
                      setValue("evento.apoio_02.ativa", false);
                    }
                  }} 
                />
              </div>
              {watch("evento.apoio_01.ativa") && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300 pl-2">
                  <FormItemLayout 
                    label="Apoio 01" 
                    error={errors.evento?.apoio_01?.nome?.message}
                  >
                    <Input {...register("evento.apoio_01.nome")} placeholder="Nome do apoio" />
                  </FormItemLayout>
                  <FormItemLayout label="Logo Apoio 01">
                    <FileUpload
                      dimensions="1954x638px"
                      defaultValue={watch("evento.apoio_01.logo")}
                      onUploadComplete={(url) => setValue("evento.apoio_01.logo", url)}
                    />
                  </FormItemLayout>
                </div>
              )}
            </div>

            {/* Apoio 02 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <h4 className="font-medium text-sm">Apoio 02</h4>
                <Switch 
                  checked={watch("evento.apoio_02.ativa")} 
                  disabled={!watch("evento.apoio_01.ativa")}
                  onCheckedChange={(val) => setValue("evento.apoio_02.ativa", val)} 
                />
              </div>
              {watch("evento.apoio_02.ativa") && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300 pl-2">
                  <FormItemLayout 
                    label="Apoio 02" 
                    error={errors.evento?.apoio_02?.nome?.message}
                  >
                    <Input {...register("evento.apoio_02.nome")} placeholder="Nome do apoio" />
                  </FormItemLayout>
                  <FormItemLayout label="Logo Apoio 02">
                    <FileUpload
                      dimensions="1954x638px"
                      defaultValue={watch("evento.apoio_02.logo")}
                      onUploadComplete={(url) => setValue("evento.apoio_02.logo", url)}
                    />
                  </FormItemLayout>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
