# BACKLOG E DOCUMENTAÇÃO DA SPRINT 1
## PROJETO: BUFFET MANAGER
**Coordenador**: `Agent_Orchestrator_Scrum`  
**Data**: 2026-11-18  
**Objetivo da Sprint**: Estabelecer a fundação TypeScript, modelagem relacional MySQL 8.x e contratos tipados de dados e IPC.

---

## 1. USER STORIES DA SPRINT 1

### US-001: Configuração do Ambiente TypeScript
- **Como**: Desenvolvedor da equipe (`Agent_Electron_Typescript`, `Agent_Frontend_Typescript_Bootstrap`).
- **Quero**: Ter o compilador TypeScript (`tsc`) configurado com checagem estrita de tipos e aliases de caminho.
- **Para que**: O código do processo principal, preload e interface seja fortemente tipado, evitando erros de execução e facilitando a manutenção.
- **Critérios de Aceitação**:
  - `tsconfig.json` criado com `strict: true`, `noImplicitAny: true` e lib `ES2022`.
  - Scripts `build:ts` e `check:ts` adicionados ao `package.json`.
  - Nenhuma quebra na inicialização da aplicação legada.

### US-002: Modelagem Relacional MySQL 8.x e Scripts DDL
- **Como**: Arquiteto e DBA (`Agent_MySQL_Database`).
- **Quero**: Scripts SQL estruturados e versionados para criar as 10 tabelas do sistema com integridade referencial e índices.
- **Para que**: Os dados de clientes, eventos, cardápios, orçamentos e custos tenham persistência robusta, transações ACID e imunidade a inconsistências.
- **Critérios de Aceitação**:
  - Script `database/migrations/001_initial_schema.sql` cobrindo todas as 10 entidades.
  - Chaves primárias com auto-incremento e chaves estrangeiras com regras `ON DELETE RESTRICT` / `CASCADE` explícitas.
  - Índices em colunas de pesquisa e filtros frequentes (`data`, `cliente_id`, `status`).

### US-003: Contratos Tipados de Domínio e IPC
- **Como**: Desenvolvedor de Interface e Desktop (`Agent_Frontend_Typescript_Bootstrap`, `Agent_Electron_Typescript`).
- **Quero**: Tipos e interfaces compartilhados para todas as entidades e canais de IPC.
- **Para que**: O frontend consuma os dados com autocompletar e validação em tempo de design, eliminando o uso de `any`.
- **Critérios de Aceitação**:
  - `src/types/models.ts` com interfaces completas de todas as entidades de buffet.
  - `src/types/ipc.ts` com o contrato da interface `ElectronAPI` e tipagem de `window.api`.

### US-004: Conexão Segura com MySQL
- **Como**: Desenvolvedor Desktop (`Agent_Electron_Typescript`).
- **Quero**: Módulo de pool de conexões utilizando `mysql2/promise` com leitura de variáveis de ambiente.
- **Para que**: A aplicação conecte de forma segura ao MySQL utilizando prepared statements.
- **Critérios de Aceitação**:
  - `src/main/mysql-connection.js` implementando pool de conexões e prepared statements.
  - `.env.example` documentando todos os parâmetros necessários.

---

## 2. QUADRO DE ENTREGÁVEIS DA SPRINT 1

| Entregável | Arquivo | Responsável | Status |
| :--- | :--- | :--- | :--- |
| Configuração TypeScript | [`tsconfig.json`](file:///C:/Users/aluno/Documents/projto/tsconfig.json) | `Agent_Electron_Typescript` | **Concluído** |
| Modelos de Domínio | [`src/types/models.ts`](file:///C:/Users/aluno/Documents/projto/src/types/models.ts) | `Agent_Electron_Typescript` & `Agent_Buffet_Eventos` | **Concluído** |
| Contratos IPC | [`src/types/ipc.ts`](file:///C:/Users/aluno/Documents/projto/src/types/ipc.ts) | `Agent_Electron_Typescript` & `Agent_Frontend_Typescript_Bootstrap` | **Concluído** |
| Migração Schema DDL | [`database/migrations/001_initial_schema.sql`](file:///C:/Users/aluno/Documents/projto/database/migrations/001_initial_schema.sql) | `Agent_MySQL_Database` | **Concluído** |
| Seeds de Validação | [`database/seeds/001_sample_data.sql`](file:///C:/Users/aluno/Documents/projto/database/seeds/001_sample_data.sql) | `Agent_Buffet_Eventos` & `Agent_MySQL_Database` | **Concluído** |
| Módulo Conexão MySQL | [`src/main/mysql-connection.js`](file:///C:/Users/aluno/Documents/projto/src/main/mysql-connection.js) | `Agent_Electron_Typescript` | **Concluído** |
| Modelo de Variáveis | [`.env.example`](file:///C:/Users/aluno/Documents/projto/.env.example) | `Agent_Electron_Typescript` | **Concluído** |
