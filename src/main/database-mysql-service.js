'use strict';
/**
 * BUFFET MANAGER — SERVIÇO DE BANCO DE DADOS MYSQL
 * Especialistas: Agent_Electron_Typescript & Agent_MySQL_Database
 * Implementa as operações de persistência e consultas do Buffet Manager conectando ao MySQL.
 */

const fs = require('node:fs');
const path = require('node:path');
const mysqlConnection = require('./mysql-connection');

const definitions = {
  clientes: { label: 'Clientes', fields: { nome: 'text', telefone: 'text', email: 'email', documento: 'text', observacoes: 'text' } },
  eventos: { label: 'Eventos', fields: { cliente_id: 'ref:clientes', titulo: 'text', tipo: 'text', data: 'date', horario: 'time', local: 'text', endereco: 'text', cidade: 'text', estado: 'text', cep: 'text', pais: 'text', convidados: 'integer', status: 'choice:Planejamento|Confirmado|Concluído|Cancelado', observacoes: 'text' } },
  cardapios: { label: 'Cardápios', fields: { nome: 'text', categoria: 'choice:Econômico|Intermediário|Premium|Personalizado', preco_pessoa: 'money', descricao: 'text' } },
  itens_cardapio: { label: 'Itens do cardápio', fields: { cardapio_id: 'ref:cardapios', nome: 'text', categoria: 'text', quantidade: 'text', observacoes: 'text' } },
  fornecedores: { label: 'Fornecedores', fields: { nome: 'text', categoria: 'text', telefone: 'text', email: 'email', cidade: 'text', observacoes: 'text' } },
  profissionais: { label: 'Profissionais', fields: { nome: 'text', funcao: 'text', telefone: 'text', valor_diaria: 'money', observacoes: 'text' } },
  equipes_evento: { label: 'Equipe por evento', fields: { evento_id: 'ref:eventos', profissional_id: 'ref:profissionais', funcao_evento: 'text', quantidade_diarias: 'number', custo_total: 'money', observacoes: 'text' } },
  fornecedores_evento: { label: 'Fornecedores por evento', fields: { evento_id: 'ref:eventos', fornecedor_id: 'ref:fornecedores', descricao: 'text', custo: 'money', status: 'choice:Pendente|Contratado|Pago' } },
  fretes: { label: 'Fretes e deslocamentos', fields: { evento_id: 'ref:eventos', origem: 'text', destino_cep: 'text', distancia_km: 'number', descricao: 'text', valor: 'money' } },
  orcamentos: { label: 'Orçamentos', fields: { evento_id: 'ref:eventos', cardapio_id: 'ref:cardapios', convidados: 'integer', preco_pessoa: 'money', adicional: 'money', desconto: 'money', custo_ingredientes: 'money', custo_outros: 'money', status: 'choice:Rascunho|Enviado|Aprovado|Recusado', validade: 'date', observacoes: 'text' } }
};

function definition(table) {
  if (!Object.hasOwn(definitions, table)) {
    throw new Error(`Módulo inválido: ${table}`);
  }
  return definitions[table];
}

function parseId(id) {
  const n = Number(id);
  if (!Number.isSafeInteger(n) || n <= 0) {
    throw new Error('ID inválido');
  }
  return n;
}

function validate(table, input) {
  const def = definition(table);
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Dados inválidos');
  }

  const out = {};
  for (const [field, type] of Object.entries(def.fields)) {
    let v = input[field];
    if (v === undefined || v === null || v === '') {
      out[field] = null;
      continue;
    }

    if (type === 'integer' || type === 'number' || type === 'money' || type.startsWith('ref:')) {
      v = Number(v);
      if (!Number.isFinite(v) || v < 0 || ((type === 'integer' || type.startsWith('ref:')) && !Number.isSafeInteger(v)) || (type.startsWith('ref:') && v === 0)) {
        throw new Error(`Número inválido no campo: ${field}`);
      }
      out[field] = type === 'money' ? Math.round(v * 100) / 100 : v;
    } else {
      v = String(v).trim();
      if (v.length > 1500) throw new Error(`Campo muito longo: ${field}`);
      if (type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new Error(`Data inválida: ${field}`);
      if (type === 'time' && !/^\d{2}:\d{2}(:\d{2})?$/.test(v)) throw new Error(`Horário inválido: ${field}`);
      if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new Error(`E-mail inválido: ${field}`);
      if (type.startsWith('choice:') && !type.slice(7).split('|').includes(v)) throw new Error(`Opção inválida: ${field}`);
      out[field] = v || null;
    }
  }

  for (const f of ['nome', 'titulo']) {
    if (Object.hasOwn(def.fields, f) && !out[f]) {
      throw new Error(`Preencha o campo obrigatório: ${f}`);
    }
  }

  if (table === 'eventos') {
    if (!out.status) out.status = 'Planejamento';
    if (!out.cliente_id || !out.data || !out.convidados) {
      throw new Error('Cliente, data e convidados são obrigatórios para eventos');
    }
  }

  if (table === 'orcamentos') {
    if (!out.status) out.status = 'Rascunho';
    if (!out.evento_id || !out.convidados) {
      throw new Error('Evento e quantidade de convidados são obrigatórios para orçamentos');
    }
  }

  return out;
}

/**
 * Lista todos os registros de uma tabela
 */
async function list(table) {
  definition(table);
  const pool = await mysqlConnection.getPool();
  const [rows] = await pool.query(`SELECT * FROM \`${table}\` ORDER BY id DESC`);
  return rows;
}

/**
 * Busca um registro pelo ID
 */
async function get(table, id) {
  definition(table);
  const pool = await mysqlConnection.getPool();
  const [rows] = await pool.query(`SELECT * FROM \`${table}\` WHERE id = ?`, [parseId(id)]);
  return rows[0] || null;
}

/**
 * Salva ou atualiza um registro
 */
async function save(table, input) {
  const data = validate(table, input);
  const names = Object.keys(data);
  const values = names.map(k => data[k]);
  const id = input.id ? parseId(input.id) : null;
  const pool = await mysqlConnection.getPool();

  if (id) {
    const setClause = names.map(n => `\`${n}\` = ?`).join(', ');
    const [result] = await pool.execute(`UPDATE \`${table}\` SET ${setClause} WHERE id = ?`, [...values, id]);
    if (result.affectedRows === 0) {
      throw new Error('Registro não encontrado para atualização');
    }
    return id;
  }

  const columns = names.map(n => `\`${n}\``).join(', ');
  const placeholders = names.map(() => '?').join(', ');
  const [result] = await pool.execute(`INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders})`, values);
  return Number(result.insertId);
}

/**
 * Exclui um registro
 */
async function remove(table, id) {
  definition(table);
  const pool = await mysqlConnection.getPool();
  const [result] = await pool.execute(`DELETE FROM \`${table}\` WHERE id = ?`, [parseId(id)]);
  return result.affectedRows > 0;
}

/**
 * Retorna as métricas e próximos eventos para o dashboard
 */
async function dashboard() {
  const pool = await mysqlConnection.getPool();

  const count = async (t) => {
    const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM \`${t}\``);
    return Number(rows[0].total);
  };

  const today = new Date().toISOString().slice(0, 10);

  const [clientes, eventos, orcamentos, fornecedores] = await Promise.all([
    count('clientes'),
    count('eventos'),
    count('orcamentos'),
    count('fornecedores')
  ]);

  const [proximos] = await pool.query(
    `SELECT e.*, c.nome AS cliente_nome 
     FROM eventos e 
     JOIN clientes c ON c.id = e.cliente_id 
     WHERE e.status != 'Cancelado' 
     ORDER BY e.data ASC, e.horario ASC 
     LIMIT 8`
  );

  return {
    clientes,
    eventos,
    orcamentos,
    fornecedores,
    proximos
  };
}

/**
 * Calcula totais vinculados a um orçamento
 */
async function totals(quote) {
  const pool = await mysqlConnection.getPool();
  let eventCosts = 0;

  const costQueries = [
    { table: 'equipes_evento', col: 'custo_total' },
    { table: 'fornecedores_evento', col: 'custo' },
    { table: 'fretes', col: 'valor' }
  ];

  for (const { table, col } of costQueries) {
    const [rows] = await pool.query(
      `SELECT COALESCE(SUM(\`${col}\`), 0) AS total FROM \`${table}\` WHERE evento_id = ?`,
      [quote.evento_id]
    );
    eventCosts += Number(rows[0].total);
  }

  const receita = (Number(quote.convidados) || 0) * (Number(quote.preco_pessoa) || 0) + (Number(quote.adicional) || 0) - (Number(quote.desconto) || 0);
  const custo = (Number(quote.custo_ingredientes) || 0) + (Number(quote.custo_outros) || 0) + eventCosts;
  const lucro = receita - custo;
  const margem = receita > 0 ? (lucro / receita) * 100 : 0;

  return {
    receita,
    custo,
    lucro,
    margem,
    custosVinculados: eventCosts
  };
}

/**
 * Detalhes completos do orçamento para proposta comercial e e-mail
 */
async function quoteDetail(id) {
  const pool = await mysqlConnection.getPool();
  const [rows] = await pool.query(
    `SELECT o.*, 
            e.titulo AS evento_titulo, 
            e.data AS evento_data, 
            e.local AS evento_local, 
            e.endereco AS evento_endereco, 
            e.cidade AS evento_cidade, 
            e.cep AS evento_cep, 
            c.nome AS cliente_nome, 
            c.email AS cliente_email 
     FROM orcamentos o 
     JOIN eventos e ON e.id = o.evento_id 
     JOIN clientes c ON c.id = e.cliente_id 
     WHERE o.id = ?`,
    [parseId(id)]
  );

  if (!rows || rows.length === 0) {
    throw new Error('Orçamento não encontrado');
  }

  const quote = rows[0];
  const calculatedTotals = await totals(quote);
  return { ...quote, ...calculatedTotals };
}

/**
 * Backup lógico em SQL
 */
async function backup(filePath) {
  const pool = await mysqlConnection.getPool();
  let dump = `-- BUFFET MANAGER BACKUP (MYSQL)\n-- Data: ${new Date().toISOString()}\n\n`;

  for (const table of Object.keys(definitions)) {
    const [rows] = await pool.query(`SELECT * FROM \`${table}\``);
    dump += `-- Tabela: ${table} (${rows.length} registros)\n`;
    if (rows.length > 0) {
      for (const row of rows) {
        const keys = Object.keys(row).map(k => `\`${k}\``).join(', ');
        const values = Object.values(row).map(v => (v === null ? 'NULL' : `'${String(v).replace(/'/g, "\\'")}'`)).join(', ');
        dump += `INSERT INTO \`${table}\` (${keys}) VALUES (${values});\n`;
      }
    }
    dump += '\n';
  }

  fs.writeFileSync(filePath, dump, 'utf-8');
  return filePath;
}

module.exports = {
  definitions,
  list,
  get,
  save,
  remove,
  dashboard,
  quoteDetail,
  backup
};
