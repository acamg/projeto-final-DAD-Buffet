# ARQUITETURA DE REFERÊNCIA — SISTEMA BUFFET MANAGER

## 1. VISÃO GERAL DO SISTEMA

O **Buffet Manager** é um sistema desktop projetado para gerenciamento integral de empresas de buffet e organização de eventos. A arquitetura segue o modelo de separação em camadas, garantindo alta coesão, desacoplamento e segurança na execução local.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CAMADA DE APRESENTAÇÃO                          │
│   Renderer Process (HTML5 + Bootstrap 5 + TypeScript)                 │
│   - Dashboards analíticos, Modais de cadastro, Formulários de eventos  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ IPC Invoke (Typed Contracts)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          CAMADA DE ISOLAMENTO                          │
│   Preload Script (contextBridge.exposeInMainWorld)                     │
│   - Context Isolation: true | Node Integration: false                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ IPC Handle (Main Process)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        CAMADA DE APLICAÇÃO & CORE                      │
│   Main Process (Node.js + TypeScript)                                  │
│   - Janela BrowserWindow, Menus, Tratamento de Exceções               │
│   - Serviços de Negócio (Clientes, Eventos, Cardápios, Orçamentos)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Driver mysql2/promise (Prepared Stmts)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          CAMADA DE PERSISTÊNCIA                        │
│   MySQL 8.x Database Engine                                            │
│   - Tabelas Normalizadas, Foreign Keys, Transações ACID, Migrações    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. PILHA TECNOLÓGICA PADRÃO

| Camada | Tecnologia | Justificativa |
| :--- | :--- | :--- |
| **Plataforma Desktop** | Electron | Portabilidade nativa para Windows, ecossistema rico e acesso seguro a recursos de SO. |
| **Linguagem Principal** | TypeScript | Tipagem estrita, prevenção de erros em tempo de compilação, manutenibilidade e escalabilidade. |
| **Backend Local** | Node.js (Main Process) | Orquestração do ciclo de vida da aplicação, execução de serviços assíncronos e acesso a banco. |
| **Frontend / UI** | TypeScript + HTML5 | Lógica de interface desacoplada e tipada. |
| **Estilização** | Bootstrap 5 | Framework canônico de design responsivo, componentes acessíveis e consistência visual. |
| **Banco de Dados** | MySQL 8.x | Robustez relacional, suporte avançado a transações, procedimentos, constraints e escalabilidade. |
| **Metodologia** | Scrum | Entregas incrementais com validação constante e aprovação obrigatória do usuário. |
| **Versionamento** | Git | Rastreabilidade de código e histórico de alterações. |

---

## 3. SEGURANÇA E COMUNICAÇÃO INTER-PROCESSOS (IPC)

1. **Isolamento de Contexto (`Context Isolation`)**: O processo de renderização não possui acesso direto aos módulos do Node.js nem ao ambiente de execução do sistema operacional.
2. **Ponte de Contexto (`contextBridge`)**: Somente métodos explicitamente mapeados e tipados são expostos à interface através do objeto `window.api`.
3. **Validação de Payload**: Todas as requisições recebidas via `ipcMain.handle` devem passar por validação de formato e tipagem no processo principal antes de qualquer processamento ou consulta SQL.
4. **Proteção de Dados do Banco**: Parâmetros de conexão com o banco MySQL são carregados no processo principal via variáveis de ambiente seguras (`.env`), nunca sendo expostos ao Renderer.

---

## 4. MODELO DE DADOS CONCEITUAL (ENTIDADES PRINCIPAIS)

O sistema organiza suas entidades relacionais em torno do ciclo de vida dos eventos e orçamentos:

- **Clientes (`clientes`)**: Dados cadastrais, documentos (CPF/CNPJ), contato, histórico de eventos.
- **Eventos (`eventos`)**: Vínculo com cliente, data/hora, tipo de evento, número estimado de convidados, status (Em Negociação, Confirmado, Realizado, Cancelado).
- **Cardápios (`cardapios`)**: Título, tipo de serviço, preço base por pessoa, descrição detalhada.
- **Itens do Cardápio (`itens_cardapio`)**: Categorias (entradas, pratos principais, sobremesas, bebidas), fichas técnicas.
- **Orçamentos (`orcamentos`)**: Proposta comercial vinculada ao evento, cálculo de receita de cardápio, custos adicionais, descontos, margem e status da proposta.
- **Fornecedores & Parceiros (`fornecedores`)**: Serviços terceirizados (decoração, som, iluminação, foto/vídeo).
- **Equipe Operacional (`equipe_evento`)**: Profissionais alocados no evento (garçons, cozinheiros, coordenadores, copeiros) e valores de diárias.
- **Custos do Evento (`custos_evento`)**: Registro consolidado de fretes, fornecedores, equipe e insumos para apuração de lucro líquido real.
