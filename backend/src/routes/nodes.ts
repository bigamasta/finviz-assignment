import type { FastifyInstance } from 'fastify'
import { sql } from '../db/index.js'
import { buildTree } from '../lib/buildTree.js'

export async function nodesRoutes(app: FastifyInstance) {
  // GET /api/nodes/root — root node + first-level children
  app.get('/root', async (_req, reply) => {
    const rows = await sql<
      {
        path: string
        name: string
        parent_path: string | null
        depth: number
        size: number
      }[]
    >`
      SELECT path, name, parent_path, depth, size
      FROM taxonomy_nodes
      WHERE depth <= 1
      ORDER BY depth ASC, name ASC
    `

    if (rows.length === 0) {
      return reply
        .status(404)
        .send({ error: 'No data found. Run the ingest script first.' })
    }

    const root = rows.find((r) => r.depth === 0)
    const children = rows
      .filter((row) => row.depth === 1)
      .map((row) => ({
        path: row.path,
        name: row.name,
        size: row.size,
        hasChildren: true,
      }))

    return { node: root, children }
  })

  // GET /api/nodes/children?path=...&limit=50&offset=0 — children of a node
  app.get<{
    Querystring: { path: string; limit?: string; offset?: string }
  }>(
    '/children',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['path'],
          properties: {
            path: { type: 'string' },
            limit: { type: 'string' },
            offset: { type: 'string' },
          },
        },
      },
    },
    async (req, reply) => {
      const { path, limit = '100', offset = '0' } = req.query
      const lim = Math.min(parseInt(limit, 10) || 100, 500)
      const off = parseInt(offset, 10) || 0

      const [children, countResult] = await Promise.all([
        sql<{ path: string; name: string; size: number }[]>`
          SELECT path, name, size
          FROM taxonomy_nodes
          WHERE parent_path = ${path}
          ORDER BY name ASC
          LIMIT ${lim} OFFSET ${off}
        `,
        sql<{ count: string }[]>`
          SELECT COUNT(*)::text AS count
          FROM taxonomy_nodes
          WHERE parent_path = ${path}
        `,
      ])

      // Check which children themselves have children
      const childPaths = children.map((childNode) => childNode.path)
      let childrenWithChildren: Set<string> = new Set()

      if (childPaths.length > 0) {
        const grandChildren = await sql<{ parent_path: string }[]>`
          SELECT DISTINCT parent_path
          FROM taxonomy_nodes
          WHERE parent_path = ANY(${childPaths})
        `
        childrenWithChildren = new Set(
          grandChildren.map((gc) => gc.parent_path),
        )
      }

      return {
        children: children.map((childNode) => ({
          ...childNode,
          hasChildren: childrenWithChildren.has(childNode.path),
        })),
        total: parseInt(countResult[0]?.count ?? '0', 10),
      }
    },
  )

  // GET /api/nodes/subtree?path=... — full subtree rooted at path
  app.get<{
    Querystring: { path: string }
  }>(
    '/subtree',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['path'],
          properties: {
            path: { type: 'string' },
          },
        },
      },
    },
    async (req, reply) => {
      const { path } = req.query

      // Fetch all descendants: nodes whose path starts with the given path
      const rows = await sql<
        {
          id: number
          path: string
          name: string
          parent_path: string | null
          depth: number
          size: number
        }[]
      >`
        SELECT id, path, name, parent_path, depth, size
        FROM taxonomy_nodes
        WHERE path = ${path} OR path LIKE ${path + ' > %'}
        ORDER BY depth ASC
      `

      if (rows.length === 0) {
        return reply.status(404).send({ error: 'Node not found' })
      }

      const tree = buildTree(rows)
      return { tree }
    },
  )
}
