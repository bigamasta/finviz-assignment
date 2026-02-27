import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { XMLParser } from 'fast-xml-parser'
import { sql } from '../db/index.js'
import assert from 'assert'

const __dirname = dirname(fileURLToPath(import.meta.url))

const XML_URL =
  'https://raw.githubusercontent.com/tzutalin/ImageNet_Utils/master/detection_eval_tools/structure_released.xml'

type FlatRecord = {
  path: string
  name: string
  parent_path: string | null
  depth: number
  size: number // total number of descendant synsets
}

// ── XML path resolution ─────────────────────────────────────
function resolveXmlPath(): string {
  if (process.env.XML_PATH) return process.env.XML_PATH
  const candidates = [
    join(process.cwd(), 'data', 'structure_released.xml'),
    join(__dirname, '..', '..', '..', 'data', 'structure_released.xml'),
  ]
  return candidates.find(existsSync) ?? candidates[0]
}

async function ensureXmlExists(xmlPath: string): Promise<void> {
  if (existsSync(xmlPath)) {
    console.log(`XML found at: ${xmlPath}`)
    return
  }
  console.log(`XML not found at ${xmlPath}. Downloading from GitHub...`)
  const dir = dirname(xmlPath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  const res = await fetch(XML_URL)
  if (!res.ok)
    throw new Error(`Download failed: ${res.status} ${res.statusText}`)
  writeFileSync(xmlPath, await res.text(), 'utf-8')
  console.log('Download complete.')
}

// ── XML Parsing ─────────────────────────────────────────────
//
// The XML structure is:
//   <ImageNetStructure>
//     <releaseData>fall2011</releaseData>
//     <synset wnid="fall11" words="ImageNet 2011 Fall Release" gloss="...">
//       <synset wnid="n00017222" words="plant, flora, plant life" gloss="...">
//         ...nested synsets...
//       </synset>
//     </synset>
//   </ImageNetStructure>
//
// The `size` field is NOT stored as an XML attribute — it is computed as the
// count of all descendant synsets during the DFS traversal.

function parseXML(xmlContent: string): FlatRecord[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (name) => name === 'synset',
  })

  const doc = parser.parse(xmlContent) as Record<string, unknown>
  const records: FlatRecord[] = []

  const structure = doc['ImageNetStructure'] as
    | Record<string, unknown>
    | undefined
  const topSynsets = structure?.['synset'] as unknown[] | undefined

  if (!topSynsets || topSynsets.length === 0) {
    throw new Error('Could not find root synset — unexpected XML structure')
  }

  const rootSynset = topSynsets[0] as Record<string, unknown>
  const rootName = rootSynset['@_words'] as string

  assert(
    rootName !== undefined,
    'XML is missing data: root synset has no words attribute.',
  )

  // Traverse children first to get the descendant count for the root
  const rootChildrenCount = traverseSynsets(
    (rootSynset['synset'] as unknown[] | undefined) ?? [],
    rootName,
    1,
    records,
  )

  // Insert root at front (depth 0, no parent)
  records.unshift({
    path: rootName,
    name: rootName,
    parent_path: null,
    depth: 0,
    size: rootChildrenCount,
  })

  return records
}

/**
 * DFS traversal. Returns the total number of nodes at this level and below —
 * i.e. sum of (1 + descendantCount) for each synset in `synsets`.
 * This return value becomes the `size` of the calling node's record.
 *
 * Records are pushed bottom-up (deepest nodes first) because we recurse before
 * pushing the current node. The ORDER BY depth ASC in DB queries restores
 * top-down order for the buildTree algorithm.
 */
function traverseSynsets(
  synsets: unknown[],
  parentPath: string,
  depth: number,
  records: FlatRecord[],
): number {
  let totalForParent = 0

  for (const item of synsets) {
    const synset = item as Record<string, unknown>
    const words = synset['@_words'] as string | undefined
    assert(words !== undefined, 'XML is missing data.')

    const currentPath = `${parentPath} > ${words}`
    const children = synset['synset'] as unknown[] | undefined

    const childDescendants = children
      ? traverseSynsets(children, currentPath, depth + 1, records)
      : 0

    records.push({
      path: currentPath,
      name: words,
      parent_path: parentPath,
      depth,
      size: childDescendants, // = number of descendants of this node
    })

    totalForParent += 1 + childDescendants
  }

  return totalForParent
}

// ── DB Insert ───────────────────────────────────────────────
async function batchInsert(
  records: FlatRecord[],
  batchSize = 1000,
): Promise<void> {
  console.log(
    `Inserting ${records.length} records in batches of ${batchSize}...`,
  )
  let inserted = 0

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    await sql`
      INSERT INTO taxonomy_nodes ${sql(batch, 'path', 'name', 'parent_path', 'depth', 'size')}
      ON CONFLICT (path) DO NOTHING
    `
    inserted += batch.length
    process.stdout.write(`\r  ${inserted}/${records.length}`)
  }

  console.log('\nInsert complete.')
}

// ── Main ────────────────────────────────────────────────────
async function main() {
  const xmlPath = resolveXmlPath()
  await ensureXmlExists(xmlPath)

  console.log('Parsing XML...')
  const xmlContent = readFileSync(xmlPath, 'utf-8')
  const records = parseXML(xmlContent)
  console.log(`Parsed ${records.length} nodes.`)
  console.log(
    `Root: "${records[0]?.name}" — size: ${records[0]?.size.toLocaleString()} descendants`,
  )

  if (records.length === 0) {
    console.error('No records parsed — check the XML structure.')
    process.exit(1)
  }

  // Truncate before re-inserting so re-runs are idempotent
  await sql`TRUNCATE taxonomy_nodes RESTART IDENTITY`
  await batchInsert(records)

  const [{ count }] = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM taxonomy_nodes
  `
  console.log(`DB now has ${count} rows.`)
  await sql.end()
}

main().catch((err) => {
  console.error('Ingest failed:', err)
  process.exit(1)
})
