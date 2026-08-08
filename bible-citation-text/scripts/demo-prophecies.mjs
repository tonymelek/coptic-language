#!/usr/bin/env node
/**
 * Demo: CopticReadings prophecies → getBibleText
 *
 *   node scripts/demo-prophecies.mjs
 *   node scripts/demo-prophecies.mjs 2026-04-01
 */
import { CopticReadings } from 'coptic-readings'
import { getBibleText } from '../dist/index.mjs'

const arg = process.argv[2] ?? '2026-04-01'
const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(arg)
if (!match) {
  console.error('Use YYYY-MM-DD, e.g. 2026-04-01')
  process.exit(1)
}
const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
const day = new CopticReadings(date, {
  now: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10),
})

const prophecies = day.readingReference.ref?.liturgy?.prophecies ?? []
console.log(JSON.stringify({
  date: arg,
  title: day.readingReference.ref?.title ?? null,
  feast: day.feast,
  prophecies,
}, null, 2))

if (prophecies.length === 0) {
  console.log('No liturgy.prophecies for this day.')
  process.exit(0)
}

const map = await getBibleText(prophecies, { langs: ['en', 'ar'], cache: true })
for (const ref of prophecies) {
  const text = map[ref]
  console.log(`\n=== ${ref} (${text.versesEn.length} verses) ===`)
  console.log(text.en.slice(0, 200) + (text.en.length > 200 ? '…' : ''))
}
