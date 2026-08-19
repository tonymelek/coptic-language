/**
 * Apply / re-validate Sunday Katamaros psalm citations (MT / NKJV).
 *
 * Gold source: English Katamaros Sundays PDF (ukmidcopts), verse-checked
 * against bible-citation-text. Frozen in sunday-psalm-gold-mt.json.
 *
 * Usage: node scripts/fix-sunday-psalms.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getBibleText } from '../../bible-citation-text/dist/index.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const refsPath = path.join(__dirname, '../src/data/sunday_katamaros_refs.json')
const goldPath = path.join(__dirname, 'sunday-psalm-gold-mt.json')

const ours = JSON.parse(fs.readFileSync(refsPath, 'utf8'))
const gold = JSON.parse(fs.readFileSync(goldPath, 'utf8'))

async function assertResolves(citation) {
  const parts = citation.split(';').map((s) => s.trim())
  const texts = []
  for (const part of parts) {
    const t = await getBibleText(part, { cache: true })
    const en = (t.versesEn || []).join(' ').trim()
    if (!en) throw new Error(`empty text for ${part}`)
    texts.push(en.slice(0, 80))
  }
  return texts
}

const report = []
for (const [key, block] of Object.entries(ours)) {
  const g = gold[key]
  if (!g) {
    report.push({ key, status: 'NO_GOLD' })
    continue
  }
  for (const svc of ['vespers', 'matins', 'liturgy']) {
    const next = g[svc]
    const prev = block[svc].psalm
    try {
      const preview = await assertResolves(next)
      block[svc].psalm = next
      report.push({
        key,
        svc,
        status: prev === next ? 'SAME' : 'CHANGE',
        prev,
        next,
        preview: preview[0],
      })
    } catch (e) {
      report.push({ key, svc, status: 'FAIL', prev, next, err: e.message })
    }
  }
}

fs.writeFileSync(refsPath, JSON.stringify(ours, null, 4) + '\n')

const changes = report.filter((r) => r.status === 'CHANGE')
const fails = report.filter((r) => r.status === 'FAIL' || r.status === 'NO_GOLD')
console.log(
  `psalms: ${report.length}  changed: ${changes.length}  fail: ${fails.length}`,
)
for (const r of changes) {
  console.log(`${r.key}.${r.svc}: ${r.prev} → ${r.next}`)
}
if (fails.length) {
  console.log('FAILURES:')
  for (const r of fails) console.log(r)
}
console.log(`Wrote ${refsPath}`)
