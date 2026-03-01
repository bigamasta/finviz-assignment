#!/bin/sh
set -e

echo "Running migrations..."
node dist/scripts/migrate.js

echo "Checking if database is already seeded..."
COUNT=$(node --input-type=module <<'EOF'
import { sql } from './dist/db/index.js'
const [{ count }] = await sql`SELECT COUNT(*)::text AS count FROM taxonomy_nodes`
await sql.end()
process.stdout.write(count)
EOF
)

if [ "$COUNT" = "0" ]; then
  echo "DB is empty — seeding..."
  node dist/scripts/ingest.js
else
  echo "DB already has $COUNT rows — skipping ingest."
fi

echo "Starting server..."
exec node dist/index.js
