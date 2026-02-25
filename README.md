# ImageNet Taxonomy Explorer

A fullstack application for ingesting, storing, and exploring the ImageNet 2011 taxonomy hierarchy — ~82k nodes, lazily loaded in a tree UI with search.

---

## Quick Start

```bash
# 1. Start the database
docker-compose up -d db

# 2. Start the backend
cd backend && npm install
npm run migrate    # creates table + indexes
npm run ingest     # downloads XML (if needed) and seeds DB
npm run dev        # starts Fastify on :3001

# 3. Start the frontend (new terminal)
cd frontend && npm install
npm run dev        # starts Vite on :5173
```

Or run everything with Docker:

```bash
docker-compose up
# In a separate terminal, once backend is healthy:
docker-compose exec backend npm run migrate
docker-compose exec backend npm run ingest
```

Then open **http://localhost:5173**.

---

## Architecture

```
finviz-assignment/
├── docker-compose.yml
├── data/                    # XML downloaded here by ingest script
├── backend/                 # Node.js + TypeScript (Fastify)
│   └── src/
│       ├── db/              # postgres client + types
│       ├── scripts/         # migrate.ts, ingest.ts
│       ├── routes/          # nodes.ts, search.ts
│       └── lib/buildTree.ts # O(n) tree reconstruction
└── frontend/                # React + TypeScript (Vite)
    └── src/
        ├── api/client.ts    # typed fetch wrapper
        ├── hooks/           # TanStack Query hooks
        └── components/      # TreeExplorer, TreeNode, NodeDetail, SearchResults
```

---

## Design Decisions

### 1. Denormalized `parent_path` and `depth` columns

The spec says store `(string, number)` tuples. I store `(path, size)` as required, but also add `parent_path` (the full parent path string) and `depth` (integer level from root).

**Why**: Enables `WHERE parent_path = $1` for O(1) children queries without string manipulation in SQL. Without this, fetching children would require `WHERE path LIKE '<parent> > %' AND path NOT LIKE '<parent> > % > %'` — brittle and slow.

**Trade-off**: Slight storage increase (~20%), but query simplicity and performance is worth it. The assignment asks for a flat form with `(name, size)` as the logical model — the extra columns are an implementation detail, not a violation of the spec.

### 2. Tree Reconstruction — O(n)

```typescript
function buildTree(nodes: FlatNode[]): TreeNode {
  const map = new Map<string, TreeNode>();
  for (const item of nodes) {             // single pass
    const node = { name, size, children: [] };
    map.set(item.path, node);             // O(1) insert
    if (item.parentPath) {
      map.get(item.parentPath)!.children.push(node);  // O(1) lookup
    }
  }
  return root;
}
```

**Complexity**: **O(n)** — one pass, O(1) HashMap operations per node. Nodes must be ordered by depth ASC (parents before children) — guaranteed by `ORDER BY depth` in the DB query.

> **Note**: If `parent_path` were not stored, we'd need `path.lastIndexOf(' > ')` at O(d) per node, giving O(n·d) formally. With max depth ~15, that's still fast in practice but not strictly O(n).

### 3. Lazy Loading

The frontend never fetches the full 60k-node dataset. Instead:
- **Initial load**: root node + first-level children (~9 items)
- **On expand**: `GET /api/nodes/children?path=...` fetches only that node's direct children
- **TanStack Query** caches every expanded node — collapse and re-expand is instant, no refetch

This keeps the initial page load under 1KB of JSON and ensures the UI stays fast regardless of dataset size.

### 4. Search

Search runs as `ILIKE '%query%'` on the `name` column (last segment only, not full path). This finds "plant" in "plant, flora, plant life" but not in "ImageNet 2011 Fall Release > plant, flora, plant life". Results are sorted by `size DESC` — larger subtrees first, since those are usually more interesting.

**Trade-off considered**: Searching full paths would catch more results but produces noise (e.g., every node under "plant" would match "plant"). Searching the name only is more precise. The full path is shown in results so users can verify context.

At 60k rows, a sequential ILIKE scan takes ~20-50ms — acceptable without a trigram index.

### 5. Fastify over Express

Fastify provides schema-based request validation (catches missing/wrong params before route handlers run), better TypeScript integration via typed generics on routes, and roughly 2× the throughput of Express. The request schema catches bad query params and returns structured 400 errors automatically.

### 6. TanStack Query

All data fetching uses TanStack Query instead of `useState/useEffect`. Benefits:
- Automatic deduplication (expanding the same node twice doesn't fetch twice)
- Caching with configurable stale time (5 min — taxonomy doesn't change)
- Loading/error states without boilerplate
- `placeholderData` for search keeps previous results visible while new ones load

---

## API Reference

| Endpoint | Description |
|----------|-------------|
| `GET /api/nodes/root` | Root node + first-level children |
| `GET /api/nodes/children?path=<path>&limit=100&offset=0` | Children of a node |
| `GET /api/nodes/subtree?path=<path>` | Full subtree (uses buildTree) |
| `GET /api/search?q=<query>&limit=20&offset=0` | Paginated name search |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| State/Fetching | TanStack Query v5 |
| Backend | Node.js, TypeScript, Fastify v4 |
| Database | PostgreSQL 16 |
| DB Client | `postgres` (porsager) |
| XML Parsing | `fast-xml-parser` |
| Dev Stack | Docker Compose |

---

## What I'm Most Proud Of

**The O(n) tree algorithm with stored `parent_path`**: it's a deliberate design choice that connects the schema to the algorithm cleanly. The DB schema exists to serve the query patterns, not just to satisfy the spec's minimum.

**The lazy loading implementation**: it correctly handles the tree UI's inherent complexity (recursive components, expand/collapse state, deduplication) without any client-side state management library — just React component state + TanStack Query.

---

## Key Trade-offs

| Decision | Alternative | Why I chose this |
|----------|------------|-----------------|
| Store `parent_path` (denormalized) | Only store `path` + split in app | O(1) DB children query vs. O(d) string split |
| Search `name` only | Search full `path` | Precision over recall; full path shown in results |
| Lazy load per-node | Virtualized flat list | More natural UX for hierarchical data |
| `ILIKE` sequential scan | `pg_trgm` trigram index | 60k rows is small; avoid extension complexity |
| Full TypeScript stack | C# backend | Personal strength — asked in the brief to use what I'm best at |
