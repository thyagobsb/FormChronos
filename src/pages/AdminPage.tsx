
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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
import { Loader2, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const AdminPage = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
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
    } catch (error) {
      console.error('Erro ao buscar submissões:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToWebhook = async (submission: any) => {
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      alert("URL do Webhook N8N não configurada!");
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
        alert("Enviado com sucesso para o N8N!");
      } else {
        const text = await response.text();
        alert(`Erro ao enviar: ${text}`);
      }
    } catch (e) {
      console.error(e);
      alert("Erro de conexão ou CORS ao tentar enviar.");
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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Monitoramento de submissões do FormChronos.</p>
          </div>
          <Button onClick={fetchSubmissions} variant="outline" size="sm">
            Atualizar
          </Button>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Submissões Recentes</CardTitle>
          </CardHeader>
          <CardContent>
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
                          <div className="font-bold">{eventData.evento?.nome_evento || "Sem nome"}</div>
                          <div className="text-xs text-muted-foreground">
                             {eventData.evento?.cidade ? `${eventData.evento.cidade}/${eventData.evento.state || eventData.evento.estado}` : '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {eventData.evento?.data_evento ? new Date(eventData.evento.data_evento + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {new Date(sub.submitted_at).toLocaleDateString()}
                          <span className="block text-xs text-muted-foreground">
                            {new Date(sub.submitted_at).toLocaleTimeString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          {sub.technical_release_url ? (
                            <Button 
                              variant="link" 
                              className="text-primary p-0 h-auto font-bold flex items-center gap-1"
                              onClick={() => window.open(sub.technical_release_url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                              Master Context
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">Aguardando N8N...</span>
                          )}
                        </TableCell>
                        <TableCell>
                           {sub.event_tokens?.used ? (
                             <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">Usado</Badge>
                           ) : (
                             <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Disponível</Badge>
                           )}
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
                              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
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

        <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
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
      </div>
    </div>
  );
};
