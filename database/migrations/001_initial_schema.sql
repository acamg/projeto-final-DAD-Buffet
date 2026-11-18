-- ====================================================================
-- BUFFET MANAGER — SCHEMA INICIAL MYSQL 8.X
-- Migração: 001_initial_schema.sql
-- Especialista: Agent_MySQL_Database
-- Diretrizes: Normalização, Integridade Referencial e Otimização
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. TABELA: CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(50) NULL,
    email VARCHAR(255) NULL,
    documento VARCHAR(50) NULL COMMENT 'CPF ou CNPJ',
    observacoes TEXT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clientes_nome (nome),
    INDEX idx_clientes_documento (documento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABELA: EVENTOS
CREATE TABLE IF NOT EXISTS eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NULL COMMENT 'Casamento, Aniversário Infantil, Debutante, Corporativo',
    data DATE NOT NULL,
    horario TIME NULL,
    local VARCHAR(255) NULL,
    endereco VARCHAR(255) NULL,
    cidade VARCHAR(100) NULL,
    estado VARCHAR(50) NULL,
    cep VARCHAR(20) NULL,
    pais VARCHAR(100) DEFAULT 'Brasil',
    convidados INT NOT NULL DEFAULT 1,
    status ENUM('Planejamento', 'Confirmado', 'Concluído', 'Cancelado') NOT NULL DEFAULT 'Planejamento',
    observacoes TEXT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_eventos_convidados CHECK (convidados >= 1),
    CONSTRAINT fk_eventos_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_eventos_data (data),
    INDEX idx_eventos_cliente (cliente_id),
    INDEX idx_eventos_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABELA: CARDÁPIOS
CREATE TABLE IF NOT EXISTS cardapios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    categoria ENUM('Econômico', 'Intermediário', 'Premium', 'Personalizado') NOT NULL DEFAULT 'Econômico',
    preco_pessoa DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    descricao TEXT NULL,
    CONSTRAINT chk_cardapios_preco CHECK (preco_pessoa >= 0.00),
    INDEX idx_cardapios_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABELA: ITENS DO CARDÁPIO
CREATE TABLE IF NOT EXISTS itens_cardapio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cardapio_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL COMMENT 'Entrada, Salgado, Prato Principal, Sobremesa, Bebida',
    quantidade VARCHAR(100) NULL COMMENT 'Ex: 10 unidades/pessoa, 300g/pessoa',
    observacoes TEXT NULL,
    CONSTRAINT fk_itens_cardapio FOREIGN KEY (cardapio_id) REFERENCES cardapios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_itens_cardapio_cardapio (cardapio_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABELA: FORNECEDORES
CREATE TABLE IF NOT EXISTS fornecedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL COMMENT 'Decoração, Som e Iluminação, Foto e Vídeo, Bebidas',
    telefone VARCHAR(50) NULL,
    email VARCHAR(255) NULL,
    cidade VARCHAR(100) NULL,
    observacoes TEXT NULL,
    INDEX idx_fornecedores_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABELA: PROFISSIONAIS (EQUIPE OPERACIONAL)
CREATE TABLE IF NOT EXISTS profissionais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    funcao VARCHAR(100) NOT NULL COMMENT 'Garçom, Cozinheiro, Metre, Copeiro, Barman',
    telefone VARCHAR(50) NULL,
    valor_diaria DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    observacoes TEXT NULL,
    CONSTRAINT chk_profissionais_diaria CHECK (valor_diaria >= 0.00),
    INDEX idx_profissionais_funcao (funcao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABELA: EQUIPES POR EVENTO
CREATE TABLE IF NOT EXISTS equipes_evento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    profissional_id INT NOT NULL,
    funcao_evento VARCHAR(100) NULL,
    quantidade_diarias DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    custo_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    observacoes TEXT NULL,
    CONSTRAINT fk_equipes_evento FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_equipes_profissional FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_equipes_evento (evento_id),
    INDEX idx_equipes_profissional (profissional_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. TABELA: FORNECEDORES POR EVENTO
CREATE TABLE IF NOT EXISTS fornecedores_evento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    fornecedor_id INT NOT NULL,
    descricao VARCHAR(255) NULL,
    custo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('Pendente', 'Contratado', 'Pago') NOT NULL DEFAULT 'Pendente',
    CONSTRAINT fk_forn_evento FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_forn_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_forn_evento (evento_id),
    INDEX idx_forn_fornecedor (fornecedor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TABELA: FRETES E DESLOCAMENTOS
CREATE TABLE IF NOT EXISTS fretes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    origem VARCHAR(255) NULL,
    destino_cep VARCHAR(20) NULL,
    distancia_km DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    descricao VARCHAR(255) NULL,
    valor DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_fretes_evento FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_fretes_evento (evento_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. TABELA: ORÇAMENTOS E PROPOSTAS COMERCIAIS
CREATE TABLE IF NOT EXISTS orcamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    cardapio_id INT NULL,
    convidados INT NOT NULL DEFAULT 1,
    preco_pessoa DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    adicional DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    desconto DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    custo_ingredientes DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    custo_outros DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('Rascunho', 'Enviado', 'Aprovado', 'Recusado') NOT NULL DEFAULT 'Rascunho',
    validade DATE NULL,
    observacoes TEXT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_orcamentos_convidados CHECK (convidados >= 1),
    CONSTRAINT fk_orcamentos_evento FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_orcamentos_cardapio FOREIGN KEY (cardapio_id) REFERENCES cardapios(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_orcamentos_evento (evento_id),
    INDEX idx_orcamentos_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
