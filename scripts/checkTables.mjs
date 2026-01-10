import { readFile } from 'fs/promises';
import pkg from 'pg';
const { Pool } = pkg;

let databaseUrl = process.env.DATABASE_URL;
try {
  if (!databaseUrl) {
    const envRaw = await readFile(new URL('../.env', import.meta.url), 'utf8');
    const m = envRaw.match(/DATABASE_URL=(.*)/);
    if (m) databaseUrl = m[1].trim().replace(/^"|"$/g, '');
  }
} catch (e) {
  // ignore
}

if (!databaseUrl) {
  console.error('DATABASE_URL not found in environment or .env');
  process.exit(2);
}

const pool = new Pool({ connectionString: databaseUrl });
try {
  const res = await pool.query("select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE';");
  console.log('public tables:', res.rows.map(r => r.table_name));
  process.exit(0);
} catch (err) {
  console.error('query error:', err);
  process.exit(1);
} finally {
  await pool.end();
}
