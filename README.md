# FormChronos - Formulário Multi-Step

Este é um projeto de formulário web multi-step profissional para coleta de dados de eventos.

## Tecnologias

- React + TypeScript + Vite
- Tailwind CSS + Shadcn/ui
- React Hook Form + Zod
- Supabase (Storage + Database)

## Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_key
VITE_N8N_WEBHOOK_URL=seu_webhook
```

## Setup

```bash
npm install
npm run dev
```

## Estrutura

- `/evento/:token`: Formulário principal
- `/sucesso`: Tela de agradecimento
- `src/components/steps`: Implementação de cada passo
