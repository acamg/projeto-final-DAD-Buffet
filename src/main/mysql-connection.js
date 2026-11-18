'use strict';
/**
 * BUFFET MANAGER — MÓDULO DE CONEXÃO MYSQL
 * Especialistas: Agent_Electron_Typescript & Agent_MySQL_Database
 * Gerenciamento seguro de Pool de Conexões e Prepared Statements
 */

const fs = require('node:fs');
const path = require('node:path');

// Carregamento simples de variáveis de ambiente sem dependência externa obrigatória
function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
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

let pool = null;

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'buffet_manager',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  dateStrings: true // Preserva datas e horas como strings YYYY-MM-DD
};

/**
 * Inicializa o pool de conexões com o MySQL
 */
async function getPool() {
  if (pool) {
    return pool;
  }

  let mysql;
  try {
    mysql = require('mysql2/promise');
  } catch {
    throw new Error(
      'O pacote "mysql2" ainda não está instalado no projeto. Execute "npm install mysql2" para habilitar a conexão MySQL.'
    );
  }

  pool = mysql.createPool(dbConfig);
  return pool;
}

/**
 * Testa a conectividade com o banco de dados MySQL
 * @returns {Promise<{connected: boolean, message: string}>}
 */
async function testConnection() {
  try {
    const currentPool = await getPool();
    const [rows] = await currentPool.query('SELECT 1 + 1 AS result');
    return {
      connected: true,
      message: `Conexão com MySQL estabelecida com sucesso em ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`
    };
  } catch (error) {
    return {
      connected: false,
      message: `Falha na conexão com MySQL: ${error.message}`
    };
  }
}

/**
 * Executa uma consulta parametrizada segura (Prepared Statement)
 * @param {string} sql Instrução SQL com placeholders '?'
 * @param {Array<any>} params Parâmetros para substituição
 */
async function executeQuery(sql, params = []) {
  const currentPool = await getPool();
  const [results] = await currentPool.execute(sql, params);
  return results;
}

/**
 * Encerra o pool de conexões ao fechar o aplicativo
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  dbConfig,
  getPool,
  testConnection,
  executeQuery,
  closePool
};
