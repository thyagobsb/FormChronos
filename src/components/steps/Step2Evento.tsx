import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { FormSchema } from '@/lib/validations';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/FileUpload';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormItemLayout } from '@/components/common/FormItemLayout';
import { cn } from '@/lib/utils';

interface Step2Props {
  form: UseFormReturn<FormSchema>;
}

export const Step2Evento: React.FC<Step2Props> = ({ form }) => {
  const { register, setValue, watch, formState: { errors } } = form;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary">Dados do Evento</CardTitle>
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
          <CardTitle className="text-lg font-semibold text-primary">Presença Digital & Classificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItemLayout label="Instagram do evento" error={errors.evento?.insta_evento?.message}>
              <Input {...register("evento.insta_evento")} placeholder="@usuario" />
            </FormItemLayout>
            <FormItemLayout label="Site do evento" error={errors.evento?.site_evento?.message}>
              <Input {...register("evento.site_evento")} placeholder="https://..." />
            </FormItemLayout>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItemLayout 
              label="Contato (Whatsapp)" 
              error={errors.evento?.contato_info?.message}
            >
              <Input {...register("evento.contato_info")} placeholder="(00) 00000-0000" />
            </FormItemLayout>
            
            <FormItemLayout 
              label="Ticketeira" 
              error={errors.evento?.ticketeira?.message}
            >
              <Select onValueChange={(v) => setValue("evento.ticketeira", v)} value={watch("evento.ticketeira")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a ticketeira..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="App Ticket">App Ticket</SelectItem>
                  <SelectItem value="BaladApp">BaladApp</SelectItem>
                  <SelectItem value="Bilheteria Digital">Bilheteria Digital</SelectItem>
                  <SelectItem value="Event Brite">Event Brite</SelectItem>
                  <SelectItem value="Eventim">Eventim</SelectItem>
                  <SelectItem value="Ingresse">Ingresse</SelectItem>
                  <SelectItem value="Ingresso Digital">Ingresso Digital</SelectItem>
                  <SelectItem value="Pag Tickets">Pag Tickets</SelectItem>
                  <SelectItem value="Sympla">Sympla</SelectItem>
                  <SelectItem value="Shotgun">Shotgun</SelectItem>
                  <SelectItem value="Ticket Master">Ticket Master</SelectItem>
                  <SelectItem value="Tickets for Fun">Tickets for Fun</SelectItem>
                  <SelectItem value="Ticket 360">Ticket 360</SelectItem>
                  <SelectItem value="Zig Fun">Zig Fun</SelectItem>
                  <SelectItem value="Outgo">Outgo</SelectItem>
                  <SelectItem value="Outra">Outra</SelectItem>
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
              <Select onValueChange={(v) => setValue("evento.genero_evento", v)} value={watch("evento.genero_evento")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gênero..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pop / Pop Nacional">Pop / Pop Nacional</SelectItem>
                  <SelectItem value="Rock">Rock</SelectItem>
                  <SelectItem value="Pop Rock">Pop Rock</SelectItem>
                  <SelectItem value="Rock Nacional">Rock Nacional</SelectItem>
                  <SelectItem value="Sertanejo">Sertanejo</SelectItem>
                  <SelectItem value="Sertanejo Universitário">Sertanejo Universitário</SelectItem>
                  <SelectItem value="Sertanejo Raiz / Romântico">Sertanejo Raiz / Romântico</SelectItem>
                  <SelectItem value="Funk Carioca">Funk Carioca</SelectItem>
                  <SelectItem value="Funk Ostentação">Funk Ostentação</SelectItem>
                  <SelectItem value="Funk Melody">Funk Melody</SelectItem>
                  <SelectItem value="Funk Proibidão">Funk Proibidão</SelectItem>
                  <SelectItem value="Pagode / Samba">Pagode / Samba</SelectItem>
                  <SelectItem value="Axé Music">Axé Music</SelectItem>
                  <SelectItem value="Brega Funk">Brega Funk</SelectItem>
                  <SelectItem value="Forró (tradicional e eletrônico)">Forró (tradicional e eletrônico)</SelectItem>
                  <SelectItem value="Trap">Trap</SelectItem>
                  <SelectItem value="Rap">Rap</SelectItem>
                  <SelectItem value="Hip Hop">Hip Hop</SelectItem>
                  <SelectItem value="Indie">Indie</SelectItem>
                  <SelectItem value="Alternativo">Alternativo</SelectItem>
                  <SelectItem value="Reggaeton">Reggaeton</SelectItem>
                  <SelectItem value="Frevo / Maracatu">Frevo / Maracatu</SelectItem>
                  <SelectItem value="Baião / Xote / Forró Pé de Serra">Baião / Xote / Forró Pé de Serra</SelectItem>
                  <SelectItem value="Pagode Baiano / Samba Reggae">Pagode Baiano / Samba Reggae</SelectItem>
                  <SelectItem value="MPB">MPB</SelectItem>
                  <SelectItem value="Samba">Samba</SelectItem>
                  <SelectItem value="Samba Rock">Samba Rock</SelectItem>
                  <SelectItem value="Bossa Nova">Bossa Nova</SelectItem>
                  <SelectItem value="R&B">R&B</SelectItem>
                  <SelectItem value="Jazz">Jazz</SelectItem>
                  <SelectItem value="House">House</SelectItem>
                  <SelectItem value="Techno">Techno</SelectItem>
                  <SelectItem value="Tech House">Tech House</SelectItem>
                  <SelectItem value="Deep House">Deep House</SelectItem>
                  <SelectItem value="Progressive House">Progressive House</SelectItem>
                  <SelectItem value="Techno / Minimal">Techno / Minimal</SelectItem>
                  <SelectItem value="Trance / Psytrance">Trance / Psytrance</SelectItem>
                  <SelectItem value="Bass music / Dubstep / Trap eletrônico">Bass music / Dubstep / Trap eletrônico</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </FormItemLayout>

            <FormItemLayout
              label="Classificação"
              error={errors.evento?.classificacao?.message}
            >
              <Select onValueChange={(v) => setValue("evento.classificacao", v)} value={watch("evento.classificacao")}>
                <SelectTrigger disabled={watch("areas.info_openbar.ativa")}>
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
                "text-[9px] font-bold uppercase tracking-wider",
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
          <CardTitle className="text-lg font-semibold text-primary">Produção & Apoio</CardTitle>
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
