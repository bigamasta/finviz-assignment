import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL ?? 'postgresql://user:password@localhost:5432/taxonomy';

export const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export type FlatNode = {
  id: number;
  path: string;
  name: string;
  parent_path: string | null;
  depth: number;
  size: number;
};
