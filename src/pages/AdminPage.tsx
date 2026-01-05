import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, Copy, Check, Trash2, Edit2, Plus, Settings, ListFilter, LayoutDashboard, LogOut } from "lucide-react";
import { FormItemLayout } from "@/components/common/FormItemLayout";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Tab = 'submissions' | 'tokens' | 'settings';

export const AdminPage = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<Tab>('submissions');
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [newToken, setNewToken] = useState("");
  const [clientName, setClientName] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  const [tokens, setTokens] = useState<any[]>([]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [generos, setGeneros] = useState<any[]>([]);
  const [ticketeiras, setTicketeiras] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<{ id?: string, nome: string, type: 'genero' | 'ticketeira' } | null>(null);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "FormChronos Admin";
    fetchSubmissions();
    fetchTokens();
    fetchRefs();
  }, []);

  const fetchRefs = async () => {
    const [genRes, tickRes] = await Promise.all([
      supabase.from('generos_musicais').select('*').order('nome'),
      supabase.from('ticketeiras').select('*').order('nome')
    ]);
    if (genRes.data) setGeneros(genRes.data);
    if (tickRes.data) setTicketeiras(tickRes.data);
  };

  const fetchTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('event_tokens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTokens(data || []);
    } catch (error) {
      console.error('Erro ao buscar tokens:', error);
    }
  };

  const fetchSubmissions = async (withFeedback = true) => {
    if (withFeedback) setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('event_submissions')
        .select(`
          *,
          event_tokens (token, used)
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
      
      // Feedback visual se for gatilho manual
      if (withFeedback) setTimeout(() => setIsRefreshing(false), 2000);
    } catch (error) {
      console.error('Erro ao buscar submissões:', error);
      if (withFeedback) setIsRefreshing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchSubmissions(false),
      fetchTokens(),
      fetchRefs()
    ]);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const handleUpdateTokenStatus = async (token: string, used: boolean) => {
    try {
      const { error } = await supabase
        .from('event_tokens')
        .update({ used })
        .eq('token', token);

      if (error) throw error;
      
      toast({
        variant: "success",
        title: "Status atualizado",
        description: `O token agora está ${used ? 'Usado' : 'Disponível'}.`,
      });
      fetchSubmissions();
      fetchTokens();
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: "Não foi possível alterar o status do token.",
      });
    }
  };

  const handleGenerateToken = async () => {
    if (!newToken) return;
    try {
      const { error } = await supabase
        .from('event_tokens')
        .insert([{ 
          token: newToken, 
          client_name: clientName,
          used: false 
        }]);

      if (error) throw error;

      const link = `${window.location.origin}/evento/${newToken}`;
      setGeneratedLink(link);
      toast({
        variant: "success",
        title: "Token gerado com sucesso!",
        description: "O link já pode ser enviado ao cliente.",
      });
      fetchSubmissions();
      fetchTokens();
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Erro ao gerar token",
        description: "Certifique-se que o token é único.",
      });
    }
  };

  const crudAction = async (action: 'create' | 'update' | 'delete', type: 'genero' | 'ticketeira', payload?: any) => {
    const table = type === 'genero' ? 'generos_musicais' : 'ticketeiras';
    try {
      let res;
      if (action === 'create') res = await supabase.from(table).insert([{ nome: payload.nome }]);
      else if (action === 'update') res = await supabase.from(table).update({ nome: payload.nome }).eq('id', payload.id);
      else if (action === 'delete') res = await supabase.from(table).delete().eq('id', payload.id);

      if (res?.error) throw res.error;

      toast({ 
        variant: "success",
        title: "Sucesso", 
        description: "Operação realizada com sucesso." 
      });
      fetchRefs();
      setIsEditingModalOpen(false);
      setEditingItem(null);
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Erro", description: "Falha na operação." });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Sessão encerrada",
      description: "Você saiu do painel administrativo.",
    });
    navigate('/login');
  };

  const handleSendToWebhook = async (submission: any) => {
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      toast({
        variant: "destructive",
        title: "Erro de configuração",
        description: "URL do Webhook N8N não configurada!",
      });
      return;
    }

    if (!confirm("Tem certeza que deseja enviar estes dados para o N8N?")) return;

    try {
      const body = {
        ...submission.data,
        token: submission.event_tokens?.token,
        submitted_at: submission.submitted_at,
        manual_trigger: true
      };

      if (typeof submission.data === 'string') {
        Object.assign(body, JSON.parse(submission.data));
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast({ 
          variant: "success",
          title: "Enviado", 
          description: "Dados enviados com sucesso para o N8N!" 
        });
      } else {
        const text = await response.text();
        toast({ variant: "destructive", title: "Erro no envio", description: text });
      }
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Erro de conexão", description: "Erro de conexão ou CORS ao tentar enviar." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Fixo */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-extrabold text-background text-sm">C</span>
            </div>
            <h1 className="font-medium tracking-tight">Chronos • Anotaê!</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="tiny" 
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive transition-colors gap-1 px-3"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-8 space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-medium tracking-tight">Chronos Admin</h1>
          <p className="text-muted-foreground">Gestão de submissões e configurações do sistema.</p>
        </div>

        <div className="flex items-center justify-between">
          {/* Tabs Simples */}
          <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg w-fit border border-border/50">
            <Button
              variant={currentTab === 'submissions' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTab('submissions')}
              className="gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Submissões
            </Button>
            <Button
              variant={currentTab === 'tokens' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTab('tokens')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Formulários Criados
            </Button>
            <Button
              variant={currentTab === 'settings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTab('settings')}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              size="sm"
              onClick={() => {
                setNewToken("");
                setClientName("");
                setGeneratedLink("");
                setShowTokenDialog(true);
              }} 
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Gerar Link de Formulário
            </Button>
            <Button 
              onClick={handleRefreshAll} 
              variant="outline" 
              size="sm" 
              disabled={isRefreshing}
              className="gap-2 min-w-[100px]"
            >
              {isRefreshing ? (
                <>
                  <Check className="h-4 w-4 text-success" />
                  Atualizado
                </>
              ) : (
                <>
                  <Loader2 className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                  Atualizar
                </>
              )}
            </Button>
          </div>
        </div>

        {currentTab === 'submissions' ? (
          <Card className="border-border/50 shadow-lg overflow-hidden border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ListFilter className="h-5 w-5 text-primary" />
                  Lista de Submissões
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[10px] uppercase">
                  {submissions.length} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
            {submissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma submissão encontrada.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Data Evento</TableHead>
                    <TableHead>Data Envio</TableHead>
                    <TableHead>Master Context</TableHead>
                    <TableHead>Status Token</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => {
                    const eventData = typeof sub.data === 'string' ? JSON.parse(sub.data) : sub.data;
                    return (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div className="font-medium text-sm">
                            {eventData.evento?.['Nome do Evento'] || eventData.evento?.nome_evento || "Sem nome"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                             {eventData.evento?.['Cidade'] || eventData.evento?.cidade ? 
                               `${eventData.evento?.['Cidade'] || eventData.evento?.cidade}/${eventData.evento?.['Estado'] || eventData.evento?.estado || eventData.evento?.state || ''}` : '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {(eventData.evento?.['Data do Evento'] || eventData.evento?.data_evento) ? 
                            new Date((eventData.evento?.['Data do Evento'] || eventData.evento?.data_evento) + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {new Date(sub.submitted_at).toLocaleDateString()}
                          <span className="block text-xs text-muted-foreground">
                            {new Date(sub.submitted_at).toLocaleTimeString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          {sub.master_context ? (
                            <Button 
                              variant="link" 
                              className="text-primary p-0 h-auto font-medium flex items-center gap-1"
                              onClick={() => window.open(sub.master_context, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                              Master Context
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">Aguardando N8N...</span>
                          )}
                        </TableCell>
                        <TableCell>
                           <Badge variant={sub.event_tokens?.used ? "destructive" : "success"} className="text-[10px] uppercase">
                             {sub.event_tokens?.used ? "Usado" : "Disponível"}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              title="Ver Detalhes (JSON)"
                              onClick={() => setSelectedSubmission(eventData)}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              className="gap-2"
                              onClick={() => handleSendToWebhook(sub)}
                              title="Reenviar para N8N"
                            >
                              Enviar N8N
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  ) : currentTab === 'tokens' ? (
    <Card className="border-border/50 shadow-lg overflow-hidden border-0 bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-muted/30 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            Tokens e Links Ativos
          </CardTitle>
          <Badge variant="outline" className="font-mono text-[10px] uppercase">
            {tokens.length} Gerados
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {tokens.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum formulário gerado ainda.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento / Cliente</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token) => (
                <TableRow key={token.id}>
                  <TableCell className="font-medium">
                    {token.client_name || "Sem nome"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {token.token}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(token.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={token.used ? "true" : "false"} 
                      onValueChange={(val) => handleUpdateTokenStatus(token.token, val === "true")}
                    >
                      <SelectTrigger className={cn(
                        "w-[120px] h-8 text-xs",
                        token.used ? "bg-destructive/10 text-destructive-foreground border-destructive-border/50" : "bg-success/10 text-success-foreground border-success-border/50"
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Disponível</SelectItem>
                        <SelectItem value="true">Usado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 h-8"
                      onClick={() => {
                        const link = `${window.location.origin}/evento/${token.token}`;
                        navigator.clipboard.writeText(link);
                        setCopiedToken(token.token);
                        setTimeout(() => setCopiedToken(null), 2000);
                        toast({ 
                          variant: "success",
                          title: "Link Copiado!", 
                          description: "O link foi copiado para a área de transferência." 
                        });
                      }}
                    >
                      {copiedToken === token.token ? (
                        <>
                          <Check className="h-3 w-3 text-success" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copiar Link
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Gêneros Musicais */}
      <Card className="border-border/50 shadow-lg border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between py-4">
          <CardTitle className="text-sm uppercase tracking-wider font-medium text-primary">Gêneros Musicais</CardTitle>
          <Button size="sm" onClick={() => { setEditingItem({ nome: "", type: "genero" }); setIsEditingModalOpen(true); }} className="px-2">
            <Plus className="h-4 w-4 mr-1" /> Novo
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableBody>
              {generos.map(g => (
                <TableRow key={g.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium">{g.nome}</TableCell>
                  <TableCell className="text-right flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => { setEditingItem({ ...g, type: "genero" }); setIsEditingModalOpen(true); }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 text-destructive/70 hover:text-destructive" onClick={() => confirm("Excluir?") && crudAction('delete', 'genero', g)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ticketeiras */}
      <Card className="border-border/50 shadow-lg border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between py-4">
          <CardTitle className="text-sm uppercase tracking-wider font-medium text-primary">Ticketeiras Parceiras</CardTitle>
          <Button size="sm" onClick={() => { setEditingItem({ nome: "", type: "ticketeira" }); setIsEditingModalOpen(true); }} className="px-2">
            <Plus className="h-4 w-4 mr-1" /> Nova
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableBody>
              {ticketeiras.map(t => (
                <TableRow key={t.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium">{t.nome}</TableCell>
                  <TableCell className="text-right flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => { setEditingItem({ ...t, type: "ticketeira" }); setIsEditingModalOpen(true); }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 text-destructive/70 hover:text-destructive" onClick={() => confirm("Excluir?") && crudAction('delete', 'ticketeira', t)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )}

  {/* Modais Antigos */}
  <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
    {/* ... manteve-se igual ... */}
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-background border-border flex flex-col">
            <DialogHeader className="flex flex-row items-center justify-between pr-8">
              <div className="space-y-1">
                <DialogTitle>Dados Brutos (JSON)</DialogTitle>
                <DialogDescription>
                  Visualize todos os dados coletados do evento.
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedSubmission, null, 2));
                  const btn = document.getElementById('copy-json-btn');
                  if (btn) {
                    btn.innerHTML = 'Copiado!';
                    setTimeout(() => { btn.innerHTML = 'Copiar JSON'; }, 2000);
                  }
                }}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                <span id="copy-json-btn">Copiar JSON</span>
              </Button>
            </DialogHeader>
            <div className="relative mt-4 flex-1 overflow-hidden">
               <pre className="h-full max-h-[60vh] overflow-auto bg-muted/50 p-4 rounded-lg text-xs font-mono whitespace-pre-wrap text-muted-foreground">
                {JSON.stringify(selectedSubmission, null, 2)}
              </pre>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Gerador de Token */}
        <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
          <DialogContent className="max-w-md bg-background border-border">
            <DialogHeader>
              <DialogTitle>Gerar Novo Link de Formulário</DialogTitle>
              <DialogDescription>
                Criar novo Token Exclusivo para o cliente preencher o formulário.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <FormItemLayout 
                label="Nome do Evento"
                className="py-2"
              >
                <Input 
                  placeholder="Ex: Universo Paralello" 
                  value={clientName} 
                  onChange={(e) => setClientName(e.target.value)} 
                />
              </FormItemLayout>
              
              <FormItemLayout 
                label="Token (Identificador Único)"
                className="py-2"
              >
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ex: up-2026-vava" 
                    value={newToken} 
                    onChange={(e) => setNewToken(e.target.value)} 
                  />
                  <Button variant="outline" size="sm" onClick={() => setNewToken(Math.random().toString(36).substring(2, 12).toUpperCase())}>
                    Auto
                  </Button>
                </div>
              </FormItemLayout>

              {generatedLink && (
                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                  <Label className="text-primary text-[10px] uppercase font-medium tracking-widest px-0">Link Gerado</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={generatedLink} className="bg-background" />
                    <Button size="icon" onClick={() => {
                      navigator.clipboard.writeText(generatedLink);
                      setCopiedToken("dialog");
                      setTimeout(() => setCopiedToken(null), 2000);
                      toast({ 
                        variant: "success",
                        title: "Link Copiado!", 
                        description: "O link foi copiado para a área de transferência." 
                      });
                    }}>
                      {copiedToken === "dialog" ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              {!generatedLink ? (
                <Button size="sm" className="w-full" onClick={handleGenerateToken} disabled={!newToken}>
                  Salvar e Gerar Link
                </Button>
              ) : (
                <Button variant="secondary" size="sm" className="w-full" onClick={() => setShowTokenDialog(false)}>
                  Fechar
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal CRUD Referências */}
        <Dialog open={isEditingModalOpen} onOpenChange={setIsEditingModalOpen}>
          <DialogContent className="max-w-xs bg-background border-border">
            <DialogHeader>
              <DialogTitle>{editingItem?.id ? 'Editar' : 'Novo'} {editingItem?.type === 'genero' ? 'Gênero' : 'Ticketeira'}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input 
                value={editingItem?.nome || ""} 
                onChange={(e) => setEditingItem(prev => prev ? { ...prev, nome: e.target.value } : null)}
                placeholder="Nome..."
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button 
                className="w-full" 
                onClick={() => crudAction(editingItem?.id ? 'update' : 'create', editingItem!.type, editingItem)}
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};
