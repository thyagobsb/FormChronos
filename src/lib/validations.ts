import { z } from "zod";


export const linhaVisualSchema = z.object({
  background: z.string().url().optional().or(z.literal("")),
  logo_01_evento: z.string().url("Logo obrigatória"),
  logo_02_evento: z.string().url().optional().or(z.literal("")),
  decor_01: z.string().url().optional().or(z.literal("")),
  decor_02: z.string().url().optional().or(z.literal("")),
});

export const eventoSchema = z.object({
  nome_evento: z.string().min(1, "Nome do evento é obrigatório"),
  local: z.string().min(1, "Local é obrigatório"),
  localizacao_endereco: z.string().min(1, "Endereço é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().length(2, "UF deve ter 2 letras").transform(v => v.toUpperCase()),
  data_evento: z.string().min(1, "Data é obrigatória"),
  hora_inicio_evento: z.string().min(1, "Hora de início é obrigatória"),
  hora_termino_evento: z.string().min(1, "Hora de término é obrigatória"),
  abertura_portoes: z.string().min(1, "Abertura dos portões é obrigatória"),
  insta_evento: z.string().min(1, "Instagram é obrigatório"),
  site_evento: z.string().url("URL inválida").or(z.literal("")),
  contato_info: z.string().min(1, "Contato é obrigatório"),
  ticketeira: z.string().min(1, "Selecione a ticketeira"),
  ticketeira_id: z.string().uuid().optional().nullable(),
  nome_ticketeira_outra: z.string().optional(),
  logo_ticketeira_outra: z.string().url().optional().or(z.literal("")),
  genero_evento: z.string().min(1, "Selecione o gênero"),
  genero_musical_id: z.string().uuid().optional().nullable(),
  genero_evento_outro: z.string().optional(),
  classificacao: z.string().min(1, "Selecione a classificação"),
  release_evento: z.string().min(20, "O release deve ter no mínimo 20 caracteres").max(2000, "Release muito longo"),
  producao: z.object({
    ativa: z.boolean().optional().default(false),
    nome: z.string().optional(),
    logo: z.string().optional(),
  }).refine(data => !data.ativa || (data.nome && data.nome.length >= 2), { message: "Nome deve ter no mínimo 2 caracteres", path: ["nome"] }),
  patrocinador: z.object({
    ativa: z.boolean().optional().default(false),
    nome: z.string().optional(),
    logo: z.string().optional(),
  }).refine(data => !data.ativa || (data.nome && data.nome.length >= 2), { message: "Nome deve ter no mínimo 2 caracteres", path: ["nome"] }),
  apoio_01: z.object({
    ativa: z.boolean().optional().default(false),
    nome: z.string().optional(),
    logo: z.string().optional(),
  }).refine(data => !data.ativa || (data.nome && data.nome.length >= 2), { message: "Nome deve ter no mínimo 2 caracteres", path: ["nome"] }),
  apoio_02: z.object({
    ativa: z.boolean().optional().default(false),
    nome: z.string().optional(),
    logo: z.string().optional(),
  }).refine(data => !data.ativa || (data.nome && data.nome.length >= 2), { message: "Nome deve ter no mínimo 2 caracteres", path: ["nome"] }),
}).refine((data) => {
  if (data.ticketeira === "Outra" && !data.nome_ticketeira_outra) return false;
  return true;
}, { message: "Informe o nome da ticketeira", path: ["nome_ticketeira_outra"] });

export const atracaosSchema = z.object({
  atracao_01: z.object({
    nome: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    logo: z.string().url("Logo obrigatória").optional().or(z.literal("")),
    foto01: z.string().url("Foto 01 obrigatória"),
    foto02: z.string().url("Foto 02 obrigatória").optional().or(z.literal("")),
    release: z.string().min(20, "O release deve ter no mínimo 20 caracteres"),
  }),
  atracao_02: z.object({
    ativa: z.boolean(),
    nome: z.string().optional(),
    logo: z.string().url().optional().or(z.literal("")),
    foto01: z.string().url("Foto 01 obrigatória").optional().or(z.literal("")),
    foto02: z.string().url().optional().or(z.literal("")),
    release: z.string().optional(),
  }).refine(data => !data.ativa || (data.nome && data.nome.length >= 2), { message: "Nome deve ter no mínimo 2 caracteres", path: ["nome"] })
    .refine(data => !data.ativa || (data.foto01 && data.foto01.length > 0), { message: "Foto Principal obrigatória", path: ["foto01"] }),
  atracao_03: z.object({
    ativa: z.boolean(),
    nome: z.string().optional(),
    logo: z.string().url().optional().or(z.literal("")),
    foto01: z.string().url("Foto 01 obrigatória").optional().or(z.literal("")),
    foto02: z.string().url().optional().or(z.literal("")),
    release: z.string().optional(),
  }).refine(data => !data.ativa || (data.nome && data.nome.length >= 2), { message: "Nome deve ter no mínimo 2 caracteres", path: ["nome"] })
    .refine(data => !data.ativa || (data.foto01 && data.foto01.length > 0), { message: "Foto Principal obrigatória", path: ["foto01"] }),
  atracao_04: z.object({
    ativa: z.boolean(),
    nome: z.string().optional(),
    logo: z.string().url().optional().or(z.literal("")),
    foto01: z.string().url("Foto 01 obrigatória").optional().or(z.literal("")),
    foto02: z.string().url().optional().or(z.literal("")),
    release: z.string().optional(),
  }).refine(data => !data.ativa || (data.nome && data.nome.length >= 2), { message: "Nome deve ter no mínimo 2 caracteres", path: ["nome"] })
    .refine(data => !data.ativa || (data.foto01 && data.foto01.length > 0), { message: "Foto Principal obrigatória", path: ["foto01"] }),
});

const areaItemSchema = z.object({
  ativa: z.boolean().optional().default(false),
  descricao: z.string().nullish(),
}).refine(data => {
  if (!data.ativa) return true;
  return !!(data.descricao && data.descricao.trim().length > 0);
}, {
  message: "Descreva os benefícios/detalhes",
  path: ["descricao"]
});

export const complementoSchema = z.object({
  info_pista: areaItemSchema,
  info_pista_premium: areaItemSchema,
  info_areavip: areaItemSchema,
  info_camarote: areaItemSchema,
  info_camarote_openbar: areaItemSchema,
  info_lounge: areaItemSchema,
  info_arquibancada: areaItemSchema,
  info_openbar: areaItemSchema,
  info_openfood: areaItemSchema,
  info_mesas: areaItemSchema,
  info_bistros: areaItemSchema,
  info_mesas_num: areaItemSchema,
  info_camarote_corp: areaItemSchema,
  info_hospitality: areaItemSchema,
  info_convidados: areaItemSchema,
  info_meetgreet: areaItemSchema,
  info_diferenciais: areaItemSchema,
  info_pontos_fisicos: areaItemSchema,
  info_estacionamento: areaItemSchema,
  info_limitacoes: areaItemSchema,
  info_acessibilidade: areaItemSchema,
  info_area_pcd: areaItemSchema,
  info_meia_entrada: areaItemSchema,
  info_meia_social: areaItemSchema,
});

export const formSchema = z.object({
  evento: eventoSchema,
  atracoes: atracaosSchema.partial(),
  complemento: complementoSchema.partial().optional(),
  linha_visual: linhaVisualSchema,
}).refine(data => {
  // Garantir que atracao_01 (obrigatória) esteja preenchida
  if (!data.atracoes?.atracao_01?.nome || !data.atracoes?.atracao_01?.foto01 || !data.atracoes?.atracao_01?.release) {
    return false;
  }
  return true;
}, {
  message: "Preencha os dados da Atração Principal",
  path: ["atracoes", "atracao_01"]
}).refine(data => {
  if (data.complemento?.info_openbar?.ativa && data.evento?.classificacao !== "18+") {
    return false;
  }
  return true;
}, {
  message: "Eventos Open Bar devem ter classificação 18+",
  path: ["evento", "classificacao"]
});

export type FormSchema = z.infer<typeof formSchema>;
