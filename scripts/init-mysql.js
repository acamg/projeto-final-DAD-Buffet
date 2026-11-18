'use strict';
/**
 * BUFFET MANAGER — SCRIPT DE INICIALIZAÇÃO E POPULAÇÃO DO MYSQL
 * Especialistas: Agent_MySQL_Database & Agent_Electron_Typescript
 * Executa as migrações DDL e popula as tabelas caso estejam vazias.
 */

const fs = require('node:fs');
const path = require('node:path');

// 1. Carrega variáveis de ambiente do .env
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key && values.length > 0) {
          process.env[key.trim()] = values.join('=').trim();
        }
      }
    }
  }
}

loadEnv();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'buffet_manager',
  multipleStatements: true,
  connectTimeout: 10000
};

const TABLES = [
  'clientes',
  'cardapios',
  'itens_cardapio',
  'fornecedores',
  'profissionais',
  'eventos',
  'equipes_evento',
  'fornecedores_evento',
  'fretes',
  'orcamentos'
];

async function runInit() {
  console.log('====================================================');
  console.log('BUFFET MANAGER — INICIALIZAÇÃO AUTOMÁTICA DO MYSQL');
  console.log('====================================================');
  console.log(`Conectando ao MySQL em: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`Base de Dados: ${dbConfig.database} | Usuário: ${dbConfig.user}`);
  console.log('----------------------------------------------------');

  let mysql;
  try {
    mysql = require('mysql2/promise');
  } catch {
    console.error('ERRO: O pacote mysql2 não foi encontrado em node_modules.');
    console.error('Execute "npm install mysql2" antes de rodar este script.');
    process.exit(1);
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Conexão com o servidor MySQL estabelecida com sucesso!');
  } catch (err) {
    console.error(`✗ Falha ao conectar no MySQL: ${err.message}`);
    process.exit(1);
  }

  try {
    // 2. Executar Schema DDL
    console.log('\n[1/3] Criando tabelas do sistema (001_initial_schema.sql)...');
    const schemaPath = path.resolve(__dirname, '../database/migrations/001_initial_schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Arquivo de schema não encontrado: ${schemaPath}`);
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await connection.query(schemaSql);
    console.log('✓ Estrutura de tabelas verificada/criada com sucesso!');

    // 3. Verificar se as tabelas precisam ser populadas
    console.log('\n[2/3] Verificando se as tabelas já possuem registros...');
    const [clienteRows] = await connection.query('SELECT COUNT(*) AS total FROM clientes');
    const clienteCount = clienteRows[0].total;

    if (clienteCount === 0) {
      console.log('Tabelas vazias detectadas. Populando com dados de validação do buffet (001_sample_data.sql)...');
      const seedPath = path.resolve(__dirname, '../database/seeds/001_sample_data.sql');
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf-8');
        await connection.query(seedSql);
        console.log('✓ Dados de teste inseridos com sucesso!');
      } else {
        console.log('Aviso: Arquivo de seeds não encontrado em ' + seedPath);
      }
    } else {
      console.log(`✓ As tabelas já contêm dados (${clienteCount} clientes cadastrados). População ignorada para preservar dados existentes.`);
    }

    // 4. Relatório de Auditoria
    console.log('\n[3/3] Relatório de contagem de registros no banco:');
    console.log('----------------------------------------------------');
    const summary = [];
    for (const table of TABLES) {
      try {
        const [rows] = await connection.query(`SELECT COUNT(*) AS total FROM ${table}`);
        summary.push({ Tabela: table, Registros: rows[0].total });
      } catch (err) {
        summary.push({ Tabela: table, Registros: `Erro: ${err.message}` });
      }
    }
    console.table(summary);
    console.log('----------------------------------------------------');
    console.log('✓ Integração com MySQL concluída e homologada com sucesso!\n');
  } catch (err) {
    console.error(`\n✗ Erro durante a inicialização: ${err.message}`);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runInit();
