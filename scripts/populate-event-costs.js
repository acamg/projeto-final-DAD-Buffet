'use strict';
/**
 * BUFFET MANAGER — SCRIPT DE POPULAÇÃO DE CUSTOS DE EVENTO
 * Especialistas: Agent_Buffet_Eventos & Agent_MySQL_Database
 */

const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');

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
  multipleStatements: true
};

async function main() {
  console.log('====================================================');
  console.log('BUFFET MANAGER — POPULAÇÃO DE CUSTOS POR EVENTO');
  console.log('====================================================');
  console.log(`Conectando ao MySQL em: ${dbConfig.host}:${dbConfig.port} (${dbConfig.database})`);

  const connection = await mysql.createConnection(dbConfig);
  console.log('✓ Conexão estabelecida com sucesso!');

  try {
    const [eqCount] = await connection.query('SELECT COUNT(*) AS total FROM equipes_evento');
    const [foCount] = await connection.query('SELECT COUNT(*) AS total FROM fornecedores_evento');
    const [frCount] = await connection.query('SELECT COUNT(*) AS total FROM fretes');

    const totalExisting = eqCount[0].total + foCount[0].total + frCount[0].total;

    if (totalExisting === 0) {
      console.log('\nTabelas de custos vazias. Inserindo dados de 002_event_costs_data.sql...');
      const seedPath = path.resolve(__dirname, '../database/seeds/002_event_costs_data.sql');
      const seedSql = fs.readFileSync(seedPath, 'utf-8');
      await connection.query(seedSql);
      console.log('✓ Inserção realizada com sucesso!');
    } else {
      console.log(`\n✓ As tabelas já continham registros (${eqCount[0].total} equipes, ${foCount[0].total} fornecedores, ${frCount[0].total} fretes). Inserção ignorada para evitar duplicidade.`);
    }

    // Relatório atualizado
    console.log('\nRelatório de Contagem Atualizado:');
    console.log('----------------------------------------------------');
    const tables = ['equipes_evento', 'fornecedores_evento', 'fretes', 'orcamentos'];
    const summary = [];
    for (const t of tables) {
      const [r] = await connection.query(`SELECT COUNT(*) AS total FROM \`${t}\``);
      summary.push({ Tabela: t, Registros: r[0].total });
    }
    console.table(summary);

    // Amostra de auditoria financeira no orçamento 1 (Casamento)
    console.log('\n--- Auditoria Financeira do Orçamento 1 (Casamento) ---');
    const mysqlService = require('../src/main/database-mysql-service');
    const quote = await mysqlService.quoteDetail(1);
    console.log(`Evento: ${quote.evento_titulo}`);
    console.log(`Receita da Proposta: R$ ${quote.receita.toFixed(2)}`);
    console.log(`Custos de Ingredientes/Outros: R$ ${(Number(quote.custo_ingredientes) + Number(quote.custo_outros)).toFixed(2)}`);
    console.log(`Custos Vinculados (Equipe + Fornecedores + Frete): R$ ${Number(quote.custosVinculados).toFixed(2)}`);
    console.log(`Custo Total: R$ ${Number(quote.custo).toFixed(2)}`);
    console.log(`Lucro Estimado: R$ ${Number(quote.lucro).toFixed(2)} (Margem: ${Number(quote.margem).toFixed(1)}%)`);
    console.log('----------------------------------------------------\n');
    const mysqlConnection = require('../src/main/mysql-connection');
    await mysqlConnection.closePool();
  } finally {
    await connection.end();
  }
  process.exit(0);
}

main().catch(err => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
