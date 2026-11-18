# REGISTRO DE DECISÕES DE ARQUITETURA (ADR)
## SISTEMA BUFFET MANAGER

Este documento mantém o histórico de decisões arquiteturais relevantes (Architecture Decision Records), registrando o contexto, as opções avaliadas e as justificativas técnicas acordadas pela equipe.

---

### ADR-001: Adoção do Protocolo de Governança Multiagentes em 5 Fases
- **Data**: 2026-11-18
- **Status**: Aprovado pelo Usuário
- **Contexto**: Necessidade de coordenar uma equipe técnica multidisciplinar (Electron, MySQL, Frontend, Buffet, Scrum) sem risco de execuções precipitadas, modificações indevidas no código ou perda de controle do projeto.
- **Decisão**: Instituir o protocolo de governança com portão inegociável de aprovação do usuário na Fase 3. Nenhuma operação modificadora pode ser executada sem a resposta explícita `APROVADO`.
- **Consequências**: Transparência absoluta, eliminação de ações não autorizadas e alinhamento contínuo entre arquitetura, dados e negócio.

---

### ADR-002: Transição Tecnológica para Electron + TypeScript + Bootstrap 5 + MySQL
- **Data**: 2026-11-18
- **Status**: Proposta Arquitetural Aprovada
- **Contexto**: A base atual do repositório (`buffet-manager-dad`) utiliza JavaScript puro (CommonJS), SQLite embutido local e CSS customizado sem framework. Para atendimento empresarial e escalabilidade das regras de negócio de buffet, faz-se necessária uma base mais tipada, segura e expansível.
- **Decisão**: Adotar formalmente:
  1. **TypeScript** em todas as camadas (Main, Preload e Renderer) com tipagem estrita.
  2. **Bootstrap 5** como framework visual canônico para componentes e formulários responsivos.
  3. **MySQL 8.x** como motor de banco de dados relacional com integridade referencial e transações ACID.
  4. Manter a migração em etapas graduais planejadas em sprints, sem quebrar o funcionamento do código legado até a substituição completa.
- **Consequências**: Maior manutenibilidade do código, contratos tipados no IPC, interfaces consistentes e dados íntegros e auditáveis.

---

### ADR-003: Separação de Responsabilidades e Preload Seguro
- **Data**: 2026-11-18
- **Status**: Aprovado
- **Contexto**: Aplicações Electron exigem cuidados estritos de segurança para evitar que vulnerabilidades no Renderer comprometam o sistema operacional ou acessem diretamente recursos de rede e banco de dados.
- **Decisão**: Manter `contextIsolation: true` e `nodeIntegration: false`. A camada Preload expõe apenas canais assíncronos específicos via `contextBridge.exposeInMainWorld('api', ...)`. O Renderer jamais acessa o driver do MySQL diretamente; todas as operações trafegam por serviços validados no Main Process.
- **Consequências**: Isolamento seguro de privilégios e prevenção de vetores de injeção ou RCE.
