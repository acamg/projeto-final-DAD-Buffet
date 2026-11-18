-- ====================================================================
-- BUFFET MANAGER — SEED DE DADOS DE TESTE E VALIDAÇÃO
-- Arquivo: database/seeds/001_sample_data.sql
-- Especialistas: Agent_Buffet_Eventos & Agent_MySQL_Database
-- Dados fictícios para homologação das regras de negócio
-- ====================================================================

-- Clientes Fictícios
INSERT INTO clientes (nome, telefone, email, documento, observacoes) VALUES
('Mariana Souza Santos', '(11) 98765-4321', 'mariana.souza@exemplo.com.br', '345.678.901-23', 'Noiva, prefere atendimento aos sábados pela manhã.'),
('Carlos Eduardo Lima', '(11) 97654-3210', 'carlos.eduardo@exemplo.com.br', '234.567.890-12', 'Pai da debutante Beatriz Lima.'),
('Nexus Tecnologia Ltda', '(11) 3210-9876', 'contato@nexustec.exemplo.com.br', '12.345.678/0001-90', 'Cliente corporativo frequente. Faturamento em 30 dias.');

-- Cardápios com faixas de precificação do buffet
INSERT INTO cardapios (nome, categoria, preco_pessoa, descricao) VALUES
('Coquetel Tradicional & Finger Food', 'Econômico', 65.00, 'Seleção de 12 tipos de salgados finos, mini empratados quentes, canapés e refrigerantes/água.'),
('Churrasco Buffet Completo', 'Intermediário', 95.00, 'Carnes nobres (Picanha, Alcatra, Fraldinha), buffet de saladas variadas, guarnições quentes e sobremesas tradicionais.'),
('Jantar Real Première', 'Premium', 140.00, 'Entrada de folhados, prato principal com filé mignon ao molho madeira ou salmão grelhado, risoto de cogumelos e mesa de sobremesas finas.');

-- Itens do Cardápio Coquetel (cardapio_id: 1)
INSERT INTO itens_cardapio (cardapio_id, nome, categoria, quantidade, observacoes) VALUES
(1, 'Coxinha de Frango com Catupiry', 'Salgado Frito', '4 unidades/pessoa', 'Servir bem crocante'),
(1, 'Mini Quiche de Alho Poró', 'Salgado Assado', '3 unidades/pessoa', 'Opção vegetariana'),
(1, 'Escondidinho de Carne Seca em Mini Ramequim', 'Mini Empratado', '1 porção/pessoa', 'Servido quente'),
(1, 'Refrigerantes Linha Coca-Cola e Sucos Naturais', 'Bebida', '600ml/pessoa', 'Servir em taças de vidro');

-- Fornecedores Parceiros
INSERT INTO fornecedores (nome, categoria, telefone, email, cidade, observacoes) VALUES
('Luz & Magia Sonorização', 'Som e Iluminação', '(11) 91234-5678', 'contato@luzemagia.exemplo.com', 'São Paulo', 'Equipamento completo de som, DJ e iluminação cênica.'),
('Flor & Arte Cenografia', 'Decoração', '(11) 92345-6789', 'contato@florarte.exemplo.com', 'São Paulo', 'Especialistas em flores nobres e lounges para eventos.'),
('Memórias em Foto & Vídeo', 'Foto e Vídeo', '(11) 93456-7890', 'contato@memoriasfoto.exemplo.com', 'Campinas', 'Cobertura completa com drone e entrega de álbum.');

-- Profissionais Operacionais (Equipe do Buffet)
INSERT INTO profissionais (nome, funcao, telefone, valor_diaria, observacoes) VALUES
('Antônio Ferreira', 'Garçom', '(11) 94567-8901', 180.00, 'Experiência de 8 anos em casamentos de alto padrão.'),
('Juliana Barbosa', 'Garçonete', '(11) 95678-9012', 180.00, 'Ágil, ótima comunicação com convidados.'),
('Cláudio Mendes', 'Chefe de Cozinha', '(11) 96789-0123', 350.00, 'Responsável pela finalização dos pratos quentes.'),
('Renata Silveira', 'Metre / Coordenadora', '(11) 97890-1234', 280.00, 'Supervisão de salão e alinhamento de horários.');

-- Eventos de Exemplo
INSERT INTO eventos (cliente_id, titulo, tipo, data, horario, local, endereco, cidade, estado, cep, convidados, status, observacoes) VALUES
(1, 'Casamento Mariana & Rodrigo', 'Casamento', '2026-12-19', '18:00', 'Espaço Villa das Flores', 'Av. das Hortênsias, 1200', 'São Paulo', 'SP', '01234-567', 150, 'Confirmado', 'Cerimônia no local seguida de jantar.'),
(2, 'Festa Debutante Beatriz - 15 Anos', 'Debutante', '2026-11-28', '20:00', 'Salão Cristal Eventos', 'Rua das Palmeiras, 450', 'Campinas', 'SP', '13080-000', 100, 'Planejamento', 'Tema: Noite em Paris. Aguarda degustação de cardápio.'),
(3, 'Confraternização de Final de Ano Nexus', 'Corporativo', '2026-12-15', '12:30', 'Espaço Verde Buffet', 'Rodovia dos Bandeirantes, km 32', 'Jundiaí', 'SP', '13200-000', 80, 'Confirmado', 'Almoço com churrasco para funcionários e parceiros.');

-- Orçamentos com Fórmulas de Custos e Margem
INSERT INTO orcamentos (evento_id, cardapio_id, convidados, preco_pessoa, adicional, desconto, custo_ingredientes, custo_outros, status, validade, observacoes) VALUES
(1, 3, 150, 140.00, 1500.00, 500.00, 6500.00, 1200.00, 'Aprovado', '2026-10-30', 'Proposta fechada com Jantar Real Première.'),
(2, 1, 100, 65.00, 500.00, 0.00, 2200.00, 400.00, 'Enviado', '2026-11-20', 'Proposta inicial com Coquetel Tradicional.');
