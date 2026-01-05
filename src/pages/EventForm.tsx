import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { formSchema } from '@/lib/validations';
import type { FormSchema } from '@/lib/validations';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { Stepper } from '@/components/Stepper';
import { AutoSaveIndicator } from '@/components/AutoSaveIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Step1LinhaVisual } from '@/components/steps/Step1LinhaVisual';
import { Step2Evento } from '@/components/steps/Step2Evento';
import { Step3Atracoes } from '@/components/steps/Step3Atracoes';
import { Step4Areas } from '@/components/steps/Step4Areas';
import { Loader2, AlertCircle, AlertTriangle, CheckCircle2, Circle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

// Passos (Componentes serão importados depois)
const STEPS = [
  "O Evento",
  "Atrações",
  "Complemento",
  "Linha Visual"
];

export const EventForm = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem(`form-step-${token || 'default'}`);
    return saved ? parseInt(saved) : 0;
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      evento: {
        cidade: "",
        estado: "",
      },
      linha_visual: {},
      areas: {}
    }
  });

  const { status: saveStatus } = useFormPersistence(form, token || 'default');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Token não fornecido.");
        setIsValidating(false);
        return;
      }

      const { data, error } = await supabase
        .from('event_tokens')
        .select('*')
        .eq('token', token)
        .single();

      if (error || !data) {
        setError("Token inválido ou expirado.");
        setIsValidating(false);
        return;
      }

      if (data.used) {
        setError("Este link já foi utilizado e não aceita novos envios.");
        setIsValidating(false);
        return;
      }
      setIsValidating(false);
    };

    validateToken();
  }, [token]);

  // Persistência do passo atual
  useEffect(() => {
    localStorage.setItem(`form-step-${token || 'default'}`, currentStep.toString());
  }, [currentStep, token]);

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) fieldsToValidate = ["evento"];
    if (currentStep === 1) fieldsToValidate = ["atracoes"];
    if (currentStep === 2) fieldsToValidate = ["areas"];
    if (currentStep === 3) fieldsToValidate = ["linha_visual"];
    
    const isValid = await form.trigger(fieldsToValidate as any);
    
    if (isValid) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos marcados corretamente.",
      });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const onSubmit = async (data: FormSchema) => {
    try {
      setIsLoading(true);

      // 1. Salvar no Supabase (Histórico)
      console.log('Salvando no Supabase...'); // LOG
      const { error: dbError } = await supabase
        .from('event_submissions')
        .insert([{
          token,
          data,
          submitted_at: new Date().toISOString(),
          genero_musical_id: data.evento.genero_musical_id,
          ticketeira_id: data.evento.ticketeira_id
        }]);

      if (dbError) {
        console.error('Erro Supabase Insert:', dbError); // LOG
        throw dbError;
      }
      console.log('Supabase Insert realizado com sucesso'); // LOG

      // 3. Marcar token como usado
      await supabase
        .from('event_tokens')
        .update({ used: true })
        .eq('token', token);

      // 4. Limpar persistência
      localStorage.removeItem(`form-persistence-${token}`);
      localStorage.removeItem(`form-step-${token}`);

      toast({
        title: "Sucesso!",
        description: "Seus dados foram enviados e processados.",
      });

      navigate('/sucesso');
    } catch (error) {
      console.error('CRITICAL SUBMISSION ERROR:', error); // Detailed Log
      toast({
        variant: "destructive",
        title: "Erro no envio",
        description: `Ocorreu um problema: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Verifique o console.`,
      });
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleFinalSubmit = () => {
    form.handleSubmit(onSubmit as any)();
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="max-w-md w-full border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div className="space-y-1">
              <h1 className="text-xl font-medium">Erro de Acesso</h1>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header Fixo */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-extrabold text-background">C</span>
            </div>
            <h1 className="font-medium tracking-tight">Chronos • Anotaê!</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <AutoSaveIndicator status={saveStatus} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-8">
        <Stepper steps={STEPS} currentStep={currentStep} />

        <div className="mt-8 mb-6 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                Passo {currentStep + 1} de 4
              </span>
            </div>
            <h2 className="text-3xl font-medium tracking-tight">{STEPS[currentStep]}</h2>
            <p className="text-muted-foreground text-sm">
              {currentStep === 0 && "Informações fundamentais sobre data, local e ticketing."}
              {currentStep === 1 && "Destaque as principais atrações do line-up."}
              {currentStep === 2 && "Especifique as áreas, benefícios e limitações do evento."}
              {currentStep === 3 && "Configure a identidade visual básica do seu evento."}
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
            {/* Passo Atual */}
            {currentStep === 0 && <Step2Evento form={form} />}
            {currentStep === 1 && <Step3Atracoes form={form} />}
            {currentStep === 2 && <Step4Areas form={form} />}
            {currentStep === 3 && <Step1LinhaVisual form={form} />}

            <div className="flex items-center justify-between">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={handleBack}
                disabled={currentStep === 0 || isLoading}
                className="gap-2"
              >
                Anterior
              </Button>
              
              {currentStep < 3 ? (
                  <Button 
                    type="button"
                    variant="default" 
                    size="sm"
                    onClick={handleNext}
                    disabled={isLoading}
                    className="gap-2 px-8"
                  >
                    Próximo
                  </Button>
              ) : (
                <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <Button 
                      type="button" 
                      variant="default"
                      size="sm"
                      onClick={() => setShowConfirmDialog(true)}
                      disabled={isLoading}
                      className="gap-2 px-8"
                    >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : 'Finalizar Coleta'}
                  </Button>
                  <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto w-full bg-background border-border text-foreground p-0">
                  <DialogHeader className="p-8 border-b border-border/50 sticky top-0 bg-background z-10">
                    <DialogTitle className="text-2xl font-medium text-center">Confirmar Envio</DialogTitle>
                    <DialogDescription className="sr-only">
                      Confirmação final dos dados do evento antes do envio.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="p-8 space-y-6">
                            {/* 1. DADOS DO EVENTO */}
                            <div className="space-y-4">
                              <h4 className="font-medium text-sm uppercase text-primary tracking-wider border-b border-border/50 pb-2">Dados do Evento</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
                                <div className="space-y-1">
                                  <span className="text-muted-foreground text-[12px] uppercase font-medium tracking-tight block">Nome do Evento</span>
                                  <span className="text-foreground font-semibold block">{form.getValues("evento.nome_evento") || '-'}</span>
                                </div>
                                
                                <div className="space-y-1">
                                  <span className="text-muted-foreground text-[12px] uppercase font-medium tracking-tight block">Data</span>
                                  <span className="text-foreground font-semibold block">
                                    {form.getValues("evento.data_evento") ? new Date(form.getValues("evento.data_evento")).toLocaleDateString('pt-BR') : '-'} 
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-muted-foreground text-[12px] uppercase font-medium tracking-tight block">Local</span>
                                  <span className="text-foreground font-semibold block">{form.getValues("evento.local") || '-'}</span>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-muted-foreground text-[12px] uppercase font-medium tracking-tight block">Horários</span>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 font-medium text-foreground">
                                    <span className="flex items-center gap-1.5"><span className="text-muted-foreground text-[10px] uppercase font-medium">Iní</span> {form.getValues("evento.hora_inicio_evento") || '-'}</span>
                                    <span className="flex items-center gap-1.5"><span className="text-muted-foreground text-[10px] uppercase font-medium">Tér</span> {form.getValues("evento.hora_termino_evento") || '-'}</span>
                                    <span className="flex items-center gap-1.5"><span className="text-muted-foreground text-[10px] uppercase font-medium">Abe</span> {form.getValues("evento.abertura_portoes") || '-'}</span>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-muted-foreground text-[12px] uppercase font-medium tracking-tight block">Endereço</span>
                                  <div className="flex flex-col">
                                    <span className="text-foreground font-semibold">{form.getValues("evento.cidade")}/{form.getValues("evento.estado")}</span>
                                    <span className="text-xs text-foreground/60 leading-tight">{form.getValues("evento.localizacao_endereco") || '-'}</span>
                                  </div>
                                </div>
                                
                                <div className="space-y-1">
                                  <span className="text-muted-foreground text-[12px] uppercase font-medium tracking-tight block">Classificação</span>
                                  <div>
                                    <span className="text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded text-xs inline-block">{form.getValues("evento.classificacao") || '-'}</span>
                                  </div>
                                </div>
                                
                                <div className="space-y-1">
                                  <span className="text-muted-foreground text-[12px] uppercase font-medium tracking-tight block">Gênero</span>
                                  <span className="text-foreground font-semibold block">
                                    {form.getValues("evento.genero_evento") === "Outro" ? form.getValues("evento.genero_evento_outro") : form.getValues("evento.genero_evento")}
                                  </span>
                                </div>
                                
                                <div className="space-y-1">
                                  <span className="text-muted-foreground text-[12px] uppercase font-medium tracking-tight block">Ticketeira</span>
                                  <div className="flex flex-col">
                                    <span className="text-foreground font-semibold">
                                      {form.getValues("evento.ticketeira") === "Outra" ? form.getValues("evento.nome_ticketeira_outra") : form.getValues("evento.ticketeira")}
                                    </span>
                                    {form.getValues("evento.logo_ticketeira_outra") && (
                                      <span className="text-[10px] text-green-500 font-medium flex items-center gap-1 mt-0.5">
                                        <CheckCircle2 className="h-3 w-3" /> Logo OK
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-muted-foreground text-[12px] uppercase font-medium tracking-tight block">Instagram</span>
                                  <span className="text-foreground font-semibold block">{form.getValues("evento.insta_evento") || '-'}</span>
                                </div>
                                
                                <div className="space-y-1">
                                  <span className="text-muted-foreground text-[12px] uppercase font-medium tracking-tight block">WhatsApp</span>
                                  <span className="text-foreground font-semibold block">{form.getValues("evento.contato_info") || '-'}</span>
                                </div>
                                
                                <div className="space-y-1 md:col-span-2">
                                  <span className="text-muted-foreground text-[12px] uppercase font-medium tracking-tight block">Site</span>
                                  <span className="text-foreground font-semibold block break-all">{form.getValues("evento.site_evento") || '-'}</span>
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                  <span className="text-muted-foreground text-[12px] uppercase font-medium tracking-tight block">Release do Evento</span>
                                  <p className="text-foreground font-medium text-sm leading-relaxed whitespace-pre-wrap">{form.getValues("evento.release_evento") || '-'}</p>
                                </div>
                              </div>
                            </div>

                            {/* 2. PRODUÇÃO & PARCEIROS */}
                            <div className="space-y-4">
                              <h4 className="font-medium text-sm uppercase text-primary tracking-wider border-b border-border/50 pb-2">Produção & Parceiros</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                  { key: 'producao', label: 'Produção' },
                                  { key: 'patrocinador', label: 'Patrocinador' },
                                  { key: 'apoio_01', label: 'Apoio 01' },
                                  { key: 'apoio_02', label: 'Apoio 02' }
                                ].map(({ key, label }) => {
                                  const data = form.getValues(`evento.${key}` as any);
                                  return (
                                    <div key={key} className="flex justify-between items-center text-sm bg-background/50 p-4 rounded-lg border border-border/30">
                                       <div className="flex items-center gap-2">
                                         <span className="text-muted-foreground text-[12px] uppercase tracking-tight font-medium">{label}:</span>
                                         <span className="text-foreground truncate max-w-[150px] font-semibold">{data?.ativa ? data.nome : "Não Adicionado"}</span>
                                       </div>
                                       <div className="flex items-center gap-1.5">
                                         {data?.ativa && (
                                           data.logo ? (
                                             <span className="text-[10px] text-green-500 font-medium flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> LOGO</span>
                                           ) : (
                                             <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1"><Circle className="h-3.5 w-3.5 text-muted-foreground/30" /> LOGO</span>
                                           )
                                         )}
                                       </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* 3. ATRAÇÕES */}
                            <div className="space-y-4">
                              <h4 className="font-medium text-sm uppercase text-primary tracking-wider border-b border-border/50 pb-2">Atrações</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {([1, 2, 3, 4] as const).map(num => {
                                  const key = `atracao_0${num}` as keyof FormSchema['atracoes'];
                                  const atracao = form.getValues(`atracoes.${key}`);
                                  const isPrincipal = num === 1;
                                  const label = isPrincipal ? "01 (Principal)" : `0${num}`;
                                  
                                  const isActiveAtraction = isPrincipal || (atracao as any)?.ativa;
                                  
                                  if (!isActiveAtraction) {
                                    return (
                                      <div key={key} className="flex justify-between items-center text-sm bg-background/50 p-4 rounded-lg border border-border/30 opacity-60">
                                        <span className="text-muted-foreground font-medium text-xs uppercase tracking-tight">{label}: Atração não Adicionada</span>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div key={key} className="flex justify-between items-center text-sm bg-background/50 p-4 rounded-lg border border-border/30">
                                      <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground text-[12px] uppercase tracking-tight font-medium">{label}:</span>
                                        <span className="text-foreground truncate max-w-[180px] font-semibold">{atracao?.nome || '-'}</span>
                                      </div>
                                      <div className="flex gap-4 text-[10px] font-medium uppercase">
                                        <span className="flex items-center gap-1">
                                          {atracao?.foto01 ? (
                                            <><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> <span className="text-green-500">Foto 01</span></>
                                          ) : (
                                            <><Circle className="h-3.5 w-3.5 text-muted-foreground/30" /> <span className="text-muted-foreground">Foto 01</span></>
                                          )}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          {atracao?.foto02 ? (
                                            <><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> <span className="text-green-500">Foto 02</span></>
                                          ) : (
                                            <><Circle className="h-3.5 w-3.5 text-muted-foreground/30" /> <span className="text-muted-foreground">Foto 02</span></>
                                          )}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          {atracao?.logo ? (
                                            <><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> <span className="text-green-500">Logo</span></>
                                          ) : (
                                            <><Circle className="h-3.5 w-3.5 text-muted-foreground/30" /> <span className="text-muted-foreground">Logo</span></>
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* 4. ÁREAS E BENEFÍCIOS */}
                            <div className="space-y-4">
                              <h4 className="font-medium text-sm uppercase text-primary tracking-wider border-b border-border/50 pb-2">Áreas e Benefícios</h4>
                              <div className="grid grid-cols-1 gap-3">
                                {!Object.entries(form.getValues("areas") || {}).some(([_, v]) => (v as any)?.ativa) ? (
                                  <div className="bg-background/50 p-4 rounded-lg border border-border/30 text-center italic text-muted-foreground text-sm">
                                    Nenhum item adicionado.
                                  </div>
                                ) : (
                                  Object.entries(form.getValues("areas") || {}).map(([areaId, value]) => {
                                      const area = value as any;
                                      if (!area?.ativa) return null;
                                      
                                      const label = areaId.replace('info_', '').replace(/_/g, ' ').toUpperCase();
                                      return (
                                        <div key={areaId} className="flex flex-col gap-1.5 bg-background/50 p-4 rounded-lg border border-border/30">
                                          <span className="text-muted-foreground text-[12px] uppercase font-medium tracking-tight">{label}</span>
                                          <p className="text-sm text-foreground leading-relaxed font-medium">
                                            {area.descricao}
                                          </p>
                                        </div>
                                      )
                                  })
                                )}
                              </div>
                            </div>

                            {/* 5. IDENTIDADE VISUAL */}
                            <div className="space-y-4">
                              <h4 className="font-medium text-sm uppercase text-primary tracking-wider border-b border-border/50 pb-2">Identidade Visual</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div className="bg-background/50 p-3 rounded-lg border border-border/30 flex flex-col gap-1.5">
                                  <span className="text-[12px] text-muted-foreground font-medium uppercase tracking-tight">Background</span>
                                  {form.getValues("linha_visual.background") ? (
                                    <span className="text-xs font-medium text-green-500 flex items-center gap-1.5">
                                      <CheckCircle2 className="h-3.5 w-3.5" /> Enviado
                                    </span>
                                  ) : (
                                    <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                      <Circle className="h-3.5 w-3.5 text-muted-foreground/30" /> Não informado
                                    </span>
                                  )}
                                </div>
                                <div className="bg-background/50 p-3 rounded-lg border border-border/30 flex flex-col gap-1.5">
                                  <span className="text-[12px] text-muted-foreground font-medium uppercase tracking-tight">Logo Evento 01</span>
                                  {form.getValues("linha_visual.logo_01_evento") ? (
                                    <span className="text-xs font-medium text-green-500 flex items-center gap-1.5">
                                      <CheckCircle2 className="h-3.5 w-3.5" /> Enviado
                                    </span>
                                  ) : (
                                    <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                      <Circle className="h-3.5 w-3.5 text-muted-foreground/30" /> Não informado
                                    </span>
                                  )}
                                </div>
                                <div className="bg-background/50 p-3 rounded-lg border border-border/30 flex flex-col gap-1.5">
                                  <span className="text-[12px] text-muted-foreground font-medium uppercase tracking-tight">Logo Evento 02</span>
                                  {form.getValues("linha_visual.logo_02_evento") ? (
                                    <span className="text-xs font-medium text-green-500 flex items-center gap-1.5">
                                      <CheckCircle2 className="h-3.5 w-3.5" /> Enviado
                                    </span>
                                  ) : (
                                    <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                      <Circle className="h-3.5 w-3.5 text-muted-foreground/30" /> Não informado
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                  </div>

                  <div className="p-8 pt-0 bg-background sticky bottom-0 z-10 border-t border-border/50">
                     <div className="bg-amber-500/10 border border-amber-500/20 rounded p-4 mb-6 mt-4">
                        <p className="text-amber-500 text-sm font-medium flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 mt-1 flex-shrink-0" />
                          <span>
                           Revise os dados acima. Após o envio, não será possível realizar alterações pelo link.
                          </span>
                        </p>
                     </div>

                     <div className="flex justify-end">
                       <Button 
                        onClick={handleFinalSubmit} 
                        disabled={isLoading}
                        variant="default"
                        size="sm"
                        className="gap-2 px-8"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : "Confirmar e Enviar"}
                      </Button>
                     </div>
                  </div>
                </DialogContent>
                    </Dialog>
                  )}
                </div>
              </form>
        </div>
      </div>
    </div>
  );
};
