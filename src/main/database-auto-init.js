'use strict';
/**
 * BUFFET MANAGER — INICIALIZADOR AUTOMÁTICO DE BANCO (MAIN PROCESS)
 * Especialistas: Agent_Electron_Typescript & Agent_MySQL_Database
 * Executado na inicialização do aplicativo Electron para garantir que o schema MySQL exista.
 */

const fs = require('node:fs');
const path = require('node:path');

/**
 * Garante a existência das tabelas no MySQL sem interromper o boot do Electron em caso de indisponibilidade
 */
async function ensureMySQLSchema() {
  let mysql;
  try {
    mysql = require('mysql2/promise');
  } catch {
    console.warn('[MySQL AutoInit] Driver mysql2 não instalado. O sistema continuará com a base local.');
    return { ok: false, reason: 'Driver mysql2 não instalado' };
  }

  const envPath = path.resolve(__dirname, '../../.env');
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

  const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'buffet_manager',
    multipleStatements: true,
    connectTimeout: 5000
  };

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const schemaPath = path.resolve(__dirname, '../../database/migrations/001_initial_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      await connection.query(schemaSql);
      console.log('[MySQL AutoInit] Schema verificado e tabelas garantidas com sucesso.');
    }
    return { ok: true };
  } catch (err) {
    console.warn(`[MySQL AutoInit] Aviso ao verificar banco MySQL (${dbConfig.host}:${dbConfig.port}): ${err.message}`);
    return { ok: false, error: err.message };
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch {
        // Ignora erro no fechamento
      }
    }
  }
}

module.exports = { ensureMySQLSchema };
