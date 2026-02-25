import { sql } from '../db/index.js';

async function migrate() {
  console.log('Running migrations...');

  await sql`
    CREATE TABLE IF NOT EXISTS taxonomy_nodes (
      id          SERIAL PRIMARY KEY,
      path        TEXT    NOT NULL UNIQUE,
      name        TEXT    NOT NULL,
      parent_path TEXT    NULL,
      depth       INTEGER NOT NULL,
      size        INTEGER NOT NULL
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_parent_path ON taxonomy_nodes (parent_path)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_name ON taxonomy_nodes (name)
  `;

  console.log('Migrations complete.');
  await sql.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
