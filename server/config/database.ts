import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize sql.js (WASM-based SQLite — works on all platforms including Vercel)
const SQL = await initSqlJs();
const sqlDb = new SQL.Database();

/**
 * Compatibility wrapper providing better-sqlite3-like API over sql.js
 */
const db = {
  prepare(sql: string) {
    return {
      all(...params: any[]) {
        const stmt = sqlDb.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        const results: any[] = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },
      get(...params: any[]) {
        const stmt = sqlDb.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        let result: any = undefined;
        if (stmt.step()) {
          result = stmt.getAsObject();
        }
        stmt.free();
        return result;
      },
      run(...params: any[]) {
        sqlDb.run(sql, params);
        const changes = sqlDb.getRowsModified();
        const lastRow = sqlDb.exec('SELECT last_insert_rowid() as id');
        const lastInsertRowid = lastRow.length > 0 ? lastRow[0].values[0][0] : 0;
        return { changes, lastInsertRowid };
      },
    };
  },
  exec(sql: string) {
    sqlDb.exec(sql);
  },
  transaction<T>(fn: () => T): () => T {
    return () => {
      sqlDb.run('BEGIN TRANSACTION');
      try {
        const result = fn();
        sqlDb.run('COMMIT');
        return result;
      } catch (e) {
        sqlDb.run('ROLLBACK');
        throw e;
      }
    };
  },
};

export function initializeDatabase() {
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const seedPath = path.join(__dirname, '..', 'db', 'seed.sql');

  const schema = fs.readFileSync(schemaPath, 'utf-8');
  const seed = fs.readFileSync(seedPath, 'utf-8');

  db.exec(schema);

  // Only seed if tables are empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    db.exec(seed);
    console.log('Database seeded with initial data');
  }
}

export default db;
