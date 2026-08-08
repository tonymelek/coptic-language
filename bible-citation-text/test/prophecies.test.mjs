import assert from 'node:assert/strict'
import test from 'node:test'
import { CopticReadings } from 'coptic-readings'
import { getBibleText } from '../dist/index.mjs'

test('April 1 2026 Great Lent prophecies → getBibleText map', async () => {
  const date = new Date(2026, 3, 1) // April 1, 2026
  const day = new CopticReadings(date, {
    now: new Date(2026, 3, 1, 10),
  })

  assert.equal(day.feast.katamaros, 'great_lent')

  const prophecies = day.readingReference.ref?.liturgy?.prophecies
  assert.ok(Array.isArray(prophecies) && prophecies.length > 0)
  assert.deepEqual(prophecies, [
    'Proverbs 10:32-11:13',
    'Isaiah 58:1-11',
    'Job 40:1-41:99',
  ])

  const map = await getBibleText(prophecies, {
    langs: ['en', 'ar'],
    cache: true,
  })

  assert.deepEqual(Object.keys(map), prophecies)

  for (const ref of prophecies) {
    const text = map[ref]
    assert.ok(text.versesEn.length > 0, `expected EN verses for ${ref}`)
    assert.ok(text.versesAr.length > 0, `expected AR verses for ${ref}`)
    assert.ok(text.en.length > 0)
    assert.ok(text.ar.length > 0)
  }
})
