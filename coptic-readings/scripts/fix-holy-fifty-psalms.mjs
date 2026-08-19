/**
 * Holy Fifty psalm refs were aligned to MT citations that resolve via
 * bible-citation-text, using:
 *   - UK Mid-Copts "Katameros of the Holy Pentecost" (MT wording)
 *   - bombaxo Joyous Fifty table (LXX chapter nums → MT)
 *
 * This file is intentionally a validator, not a rewriter, to avoid
 * overwriting curated fixes. Run:
 *   node scripts/fix-holy-fifty-psalms.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getBibleText } from '../../bible-citation-text/dist/index.mjs'

const refsPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/data/holy_fifty_katamaros.json',
)
const data = JSON.parse(fs.readFileSync(refsPath, 'utf8'))
let ok = 0
const bad = []
for (const [day, block] of Object.entries(data)) {
  for (const svc of ['vespers', 'matins', 'liturgy']) {
    if (!block[svc]?.psalm) continue
    const ref = block[svc].psalm
    for (const part of ref.split(';')) {
      try {
        const t = await getBibleText(part.trim(), { cache: true })
        if (!(t.en || '').trim()) bad.push({ day, svc, part: part.trim(), ref })
        else ok++
      } catch (e) {
        bad.push({ day, svc, part: part.trim(), ref, err: e.message })
      }
    }
  }
}
console.log(`ok parts: ${ok}; bad: ${bad.length}`)
if (bad.length) {
  for (const b of bad) console.log(b)
  process.exitCode = 1
}
