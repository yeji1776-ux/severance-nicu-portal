export default async function handler(req: any, res: any) {
  try {
    // Test 1: Can we import sql.js?
    const initSqlJs = (await import('sql.js')).default;

    // Test 2: Can we find the WASM file?
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    let wasmPath = '';
    try {
      wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm');
    } catch (e: any) {
      wasmPath = 'NOT FOUND: ' + e.message;
    }

    // Test 3: Can we read the WASM file?
    const fs = await import('fs');
    let wasmSize = 0;
    try {
      const buf = fs.readFileSync(wasmPath);
      wasmSize = buf.length;
    } catch (e: any) {
      wasmSize = -1;
    }

    // Test 4: Can we initialize sql.js?
    let dbOk = false;
    try {
      const wasmBinary = fs.readFileSync(wasmPath);
      const SQL = await initSqlJs({ wasmBinary });
      const db = new SQL.Database();
      db.exec('CREATE TABLE test (id INTEGER)');
      dbOk = true;
    } catch (e: any) {
      res.json({ step: 'init-db', error: e.message, wasmPath, wasmSize });
      return;
    }

    res.json({ ok: true, wasmPath, wasmSize, dbOk, nodeVersion: process.version });
  } catch (e: any) {
    res.status(500).json({ error: e.message, stack: e.stack?.split('\n').slice(0, 5) });
  }
}
