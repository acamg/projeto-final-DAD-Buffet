/**
 * BUFFET MANAGER — DOMAIN MODELS
 * Tipagens rigorosas para as entidades de negócio do sistema de buffet e eventos.
 * Especialistas: Agent_Electron_Typescript & Agent_Buffet_Eventos
 */

export type StatusEvento = 'Planejamento' | 'Confirmado' | 'Concluído' | 'Cancelado';
export type CategoriaCardapio = 'Econômico' | 'Intermediário' | 'Premium' | 'Personalizado';
export type StatusFornecedorEvento = 'Pendente' | 'Contratado' | 'Pago';
export type StatusOrcamento = 'Rascunho' | 'Enviado' | 'Aprovado' | 'Recusado';

export interface Cliente {
  id?: number;
  nome: string;
  telefone?: string | null;
  email?: string | null;
  documento?: string | null;
  observacoes?: string | null;
  criado_em?: string;
}

export interface Evento {
  id?: number;
  cliente_id: number;
  titulo: string;
  tipo?: string | null;
  data: string; // Formato YYYY-MM-DD
  horario?: string | null; // Formato HH:mm
  local?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  pais?: string;
  convidados: number;
  status: StatusEvento;
  observacoes?: string | null;
  criado_em?: string;
  cliente_nome?: string; // Para joins em listagens e dashboards
}

export interface Cardapio {
  id?: number;
  nome: string;
  categoria: CategoriaCardapio;
  preco_pessoa: number;
  descricao?: string | null;
}

export interface ItemCardapio {
  id?: number;
  cardapio_id: number;
  nome: string;
  categoria: string;
  quantidade?: string | null;
  observacoes?: string | null;
}

export interface Fornecedor {
  id?: number;
  nome: string;
  categoria: string;
  telefone?: string | null;
  email?: string | null;
  cidade?: string | null;
  observacoes?: string | null;
}

export interface Profissional {
  id?: number;
  nome: string;
  funcao: string;
  telefone?: string | null;
  valor_diaria: number;
  observacoes?: string | null;
}

export interface EquipeEvento {
  id?: number;
  evento_id: number;
  profissional_id: number;
  funcao_evento?: string | null;
  quantidade_diarias: number;
  custo_total: number;
  observacoes?: string | null;
  profissional_nome?: string;
}

export interface FornecedorEvento {
  id?: number;
  evento_id: number;
  fornecedor_id: number;
  descricao?: string | null;
  custo: number;
  status: StatusFornecedorEvento;
  fornecedor_nome?: string;
}

export interface Frete {
  id?: number;
  evento_id: number;
  origem?: string | null;
  destino_cep?: string | null;
  distancia_km: number;
  descricao?: string | null;
  valor: number;
}

export interface Orcamento {
  id?: number;
  evento_id: number;
  cardapio_id?: number | null;
  convidados: number;
  preco_pessoa: number;
  adicional: number;
  desconto: number;
  custo_ingredientes: number;
  custo_outros: number;
  status: StatusOrcamento;
  validade?: string | null;
  observacoes?: string | null;
  criado_em?: string;
  // Campos calculados
  receita?: number;
  custo?: number;
  lucro?: number;
  margem?: number;
  custosVinculados?: number;
  evento_titulo?: string;
  cliente_nome?: string;
  cliente_email?: string;
}

export interface DashboardMetrics {
  clientes: number;
  eventos: number;
  orcamentos: number;
  fornecedores: number;
  proximos: Evento[];
}
