import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test from 'node:test'
import { CopticReadings } from '../dist/index.mjs'

test('ESM: Resurrection Sunday 2026', () => {
  const day = new CopticReadings(new Date(2026, 3, 12), { now: new Date(2026, 3, 12, 10) })
  assert.equal(day.feast.name, 'resurrection')
  assert.equal(day.feast.katamaros, 'holy_fifties')
  assert.ok(day.readingReference.ref?.title?.includes('Resurrection'))
  assert.equal(day.readingReference.ref?.liturgy?.gospel, 'John 20:1-18')
  assert.ok(day.readingReference.ref?.liturgy?.psalm)
  assert.ok(day.readingReference.ref?.liturgy?.psalm_coptic_ref)
  assert.notEqual(
    day.readingReference.ref?.liturgy?.psalm,
    day.readingReference.ref?.liturgy?.psalm_coptic_ref,
  )
})

test('ESM: Great Lent weekday', () => {
  const day = new CopticReadings(new Date(2026, 1, 23), { now: new Date(2026, 1, 23, 10) })
  assert.equal(day.feast.name, 'great_lent')
  assert.match(day.readingReference.ref?.title ?? '', /Monday of the second week/)
})

test('CJS require works', () => {
  const require = createRequire(import.meta.url)
  const { CopticReadings: CjsReadings } = require('../dist/index.cjs')
  const day = new CjsReadings(new Date(2026, 3, 12), { now: new Date(2026, 3, 12, 10) })
  assert.equal(day.feast.name, 'resurrection')
})
