-- ====================================================================
-- BUFFET MANAGER — SEED DE CUSTOS OPERACIONAIS VINCULADOS AOS EVENTOS
-- Arquivo: database/seeds/002_event_costs_data.sql
-- Especialistas: Agent_Buffet_Eventos & Agent_MySQL_Database
-- Tabelas: equipes_evento, fornecedores_evento, fretes
-- ====================================================================

-- 1. EQUIPE POR EVENTO (equipes_evento)
-- Evento 1: Casamento Mariana & Rodrigo (150 convidados)
INSERT INTO equipes_evento (evento_id, profissional_id, funcao_evento, quantidade_diarias, custo_total, observacoes) VALUES
(1, 4, 'Coordenação Geral / Metre', 1.00, 280.00, 'Coordenação geral do salão e cerimonial de entrada dos noivos'),
(1, 3, 'Chefe de Cozinha Principal', 1.00, 350.00, 'Supervisão do preparo e empratados do Jantar Real Première'),
(1, 1, 'Garçom Chefe', 1.50, 270.00, 'Montagem de mesa posta e atendimento às mesas dos noivos e familiares'),
(1, 2, 'Garçonete Volante', 1.50, 270.00, 'Serviço de coquetel, canapés e reposição de taças');

-- Evento 2: Festa Debutante Beatriz - 15 Anos (100 convidados)
INSERT INTO equipes_evento (evento_id, profissional_id, funcao_evento, quantidade_diarias, custo_total, observacoes) VALUES
(2, 4, 'Coordenadora de Cerimonial', 1.00, 280.00, 'Recepção de jovens e alinhamento do momento da valsa com a família'),
(2, 1, 'Garçom de Salão', 1.00, 180.00, 'Atendimento de mesas e salgados volantes'),
(2, 2, 'Garçonete de Pista', 1.00, 180.00, 'Serviço volante de finger food na pista de dança');

-- Evento 3: Confraternização de Final de Ano Nexus (80 convidados)
INSERT INTO equipes_evento (evento_id, profissional_id, funcao_evento, quantidade_diarias, custo_total, observacoes) VALUES
(3, 3, 'Chefe Churrasqueiro', 1.00, 350.00, 'Controle de cortes nobres na churrasqueira e reposição de carnes'),
(3, 1, 'Garçom de Apoio e Bebidas', 1.00, 180.00, 'Serviço de chopp e bebidas para convidados corporativos');


-- 2. FORNECEDORES POR EVENTO (fornecedores_evento)
-- Evento 1: Casamento Mariana & Rodrigo
INSERT INTO fornecedores_evento (evento_id, fornecedor_id, descricao, custo, status) VALUES
(1, 2, 'Decoração completa da nave da cerimônia, arranjos nobres e lounge', 3800.00, 'Contratado'),
(1, 1, 'Sonorização da cerimônia, DJ e iluminação cênica do salão', 2400.00, 'Contratado'),
(1, 3, 'Cobertura completa de fotos, gravação em vídeo e tomada com drone', 4500.00, 'Pendente');

-- Evento 2: Festa Debutante Beatriz - 15 Anos
INSERT INTO fornecedores_evento (evento_id, fornecedor_id, descricao, custo, status) VALUES
(2, 1, 'Pista de LED Paris, DJ especializado em festas de 15 anos e iluminação', 2900.00, 'Contratado'),
(2, 2, 'Cenografia e flores temáticas para lounge de fotos da debutante', 3200.00, 'Pendente');

-- Evento 3: Confraternização Corporativa Nexus
INSERT INTO fornecedores_evento (evento_id, fornecedor_id, descricao, custo, status) VALUES
(3, 1, 'Sonorização acústica e microfones sem fio para discursos da diretoria', 1500.00, 'Contratado');


-- 3. FRETES E DESLOCAMENTOS (fretes)
-- Evento 1: Casamento Mariana & Rodrigo
INSERT INTO fretes (evento_id, origem, destino_cep, distancia_km, descricao, valor) VALUES
(1, 'Galpão Central Buffet (São Paulo)', '01234-567', 18.50, 'Transporte de rechauds de prata, louças finas, taças e toalhas bordadas', 350.00),
(1, 'Cozinha Industrial Central', '01234-567', 18.50, 'Caminhão com câmara refrigerada para insumos nobres e sobremesas', 280.00);

-- Evento 2: Festa Debutante Beatriz - 15 Anos
INSERT INTO fretes (evento_id, origem, destino_cep, distancia_km, descricao, valor) VALUES
(2, 'Base Operacional Campinas', '13080-000', 12.00, 'Deslocamento de louças temáticas, prataria e taças de acrílico para pista', 220.00);

-- Evento 3: Confraternização Corporativa Nexus
INSERT INTO fretes (evento_id, origem, destino_cep, distancia_km, descricao, valor) VALUES
(3, 'Cozinha Central', '13200-000', 35.00, 'Transporte refrigerado de carnes, rechauds de churrasco e chopeiras a gelo', 420.00);
