import { readFile } from 'fs/promises';
import pkg from 'pg';
const { Pool } = pkg;

async function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const envRaw = await readFile(new URL('../.env', import.meta.url), 'utf8');
    const m = envRaw.match(/DATABASE_URL=(.*)/);
    if (m) return m[1].trim().replace(/^"|"$/g, '');
  } catch (e) {
    // ignore
  }
  return undefined;
}

const username = process.argv[2];
if (!username) {
  console.error('Usage: node scripts/findUser.mjs <username>');
  process.exit(2);
}

const databaseUrl = await getDatabaseUrl();
if (!databaseUrl) {
  console.error('DATABASE_URL not found in env or .env');
  process.exit(2);
}

const pool = new Pool({ connectionString: databaseUrl });
try {
  const res = await pool.query('SELECT id, username, avatar, status FROM users WHERE username = $1', [username]);
  if (!res.rows.length) {
    console.log(`User not found: ${username}`);
    process.exit(0);
  }
  console.log('Found users:', JSON.stringify(res.rows, null, 2));
} catch (err) {
  console.error('Query error:', err);
  process.exit(1);
} finally {
  await pool.end();
}
