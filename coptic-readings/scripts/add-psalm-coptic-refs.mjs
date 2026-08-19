/**
 * Add / refresh `psalm_coptic_ref` beside every `psalm` in katamaros JSON data.
 * Coptic ref = MT→LXX chapter mapping; verses unchanged.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '../src/data')

const FILES = [
  'sunday_katamaros_refs.json',
  'holy_fifty_katamaros.json',
  'great_lent_katamaros.json',
  'unique_daily_readings.json',
]

function mtToLxxChapter(ch) {
  if (ch >= 1 && ch <= 8) return ch
  if (ch === 9 || ch === 10) return 9
  if (ch >= 11 && ch <= 113) return ch - 1
  if (ch === 114 || ch === 115) return 113
  if (ch === 116) return 114
  if (ch >= 117 && ch <= 146) return ch - 1
  if (ch === 147) return 146
  return ch
}

function mtPsalmToCopticRef(citation) {
  return citation
    .split(';')
    .map((part) => {
      const trimmed = part.trim()
      const m = trimmed.match(/^(Psalms?)\s+(\d+)\s*:\s*(.+)$/i)
      if (!m) return trimmed
      const lxx = mtToLxxChapter(Number(m[2]))
      return `Psalms ${lxx}:${m[3].trim()}`
    })
    .join(';')
}

/** Insert psalm_coptic_ref immediately after psalm; drop any prior copy. */
function withCopticRef(obj) {
  const next = mtPsalmToCopticRef(obj.psalm)
  const ordered = {}
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'psalm_coptic_ref') continue
    ordered[key] = value
    if (key === 'psalm') ordered.psalm_coptic_ref = next
  }
  if (!('psalm_coptic_ref' in ordered)) ordered.psalm_coptic_ref = next
  return ordered
}

function walk(node, stats, parent, key) {
  if (Array.isArray(node)) {
    node.forEach((item, i) => walk(item, stats, node, i))
    return
  }
  if (!node || typeof node !== 'object') return

  if (typeof node.psalm === 'string' && node.psalm.trim()) {
    const updated = withCopticRef(node)
    const changed = updated.psalm_coptic_ref !== node.psalm_coptic_ref
    if (parent != null && key != null) parent[key] = updated
    else Object.keys(node).forEach((k) => delete node[k])
    Object.assign(node, updated)
    if (changed) stats.updated++
    else stats.same++
  }

  for (const [k, value] of Object.entries(node)) {
    if (k === 'psalm' || k === 'psalm_coptic_ref') continue
    if (value && typeof value === 'object') walk(value, stats, node, k)
  }
}

const totals = { updated: 0, same: 0 }
for (const file of FILES) {
  const full = path.join(dataDir, file)
  const data = JSON.parse(fs.readFileSync(full, 'utf8'))
  const stats = { updated: 0, same: 0 }
  walk(data, stats, null, null)
  fs.writeFileSync(full, JSON.stringify(data, null, 4) + '\n')
  console.log(`${file}: wrote ${stats.updated + stats.same} psalm_coptic_ref fields (${stats.updated} new/changed)`)
  totals.updated += stats.updated
  totals.same += stats.same
}
console.log(`done: ${totals.updated + totals.same} total`)
