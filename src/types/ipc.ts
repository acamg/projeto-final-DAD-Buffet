/**
 * BUFFET MANAGER — IPC CONTRACTS
 * Contratos tipados de comunicação entre Main Process e Renderer Process.
 * Especialistas: Agent_Electron_Typescript & Agent_Frontend_Typescript_Bootstrap
 */

import {
  Cliente,
  Evento,
  Cardapio,
  ItemCardapio,
  Fornecedor,
  Profissional,
  EquipeEvento,
  FornecedorEvento,
  Frete,
  Orcamento,
  DashboardMetrics
} from './models';

export type TabelaModulo =
  | 'clientes'
  | 'eventos'
  | 'cardapios'
  | 'itens_cardapio'
  | 'fornecedores'
  | 'profissionais'
  | 'equipes_evento'
  | 'fornecedores_evento'
  | 'fretes'
  | 'orcamentos';

export type EntidadePorTabela<T extends TabelaModulo> =
  T extends 'clientes' ? Cliente :
  T extends 'eventos' ? Evento :
  T extends 'cardapios' ? Cardapio :
  T extends 'itens_cardapio' ? ItemCardapio :
  T extends 'fornecedores' ? Fornecedor :
  T extends 'profissionais' ? Profissional :
  T extends 'equipes_evento' ? EquipeEvento :
  T extends 'fornecedores_evento' ? FornecedorEvento :
  T extends 'fretes' ? Frete :
  T extends 'orcamentos' ? Orcamento : never;

export interface IpcResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ElectronAPI {
  // Operações Genéricas CRUD
  list: <T extends TabelaModulo>(table: T) => Promise<EntidadePorTabela<T>[]>;
  get: <T extends TabelaModulo>(table: T, id: number) => Promise<EntidadePorTabela<T> | null>;
  save: <T extends TabelaModulo>(table: T, data: Partial<EntidadePorTabela<T>>) => Promise<number>;
  remove: <T extends TabelaModulo>(table: T, id: number) => Promise<boolean>;

  // Métricas e Dashboards
  dashboard: () => Promise<DashboardMetrics>;

  // Consultas Específicas de Buffet
  quoteDetail: (id: number) => Promise<Orcamento>;
  
  // Utilidades e Backup
  backup: () => Promise<{ canceled: boolean; filePath?: string }>;
  weather: (city: string, date: string) => Promise<unknown>;
  openMail: (to: string, subject: string, body: string) => Promise<void>;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
