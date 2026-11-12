import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test from 'node:test'
import {
  CopticReadings,
  findAnnualWeekdayForSlot,
  readingSourceFor,
  usesDayReadings,
} from '../dist/index.mjs'

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

test('feastChecker: annual weekday uses day_readings', () => {
  const dec8 = new CopticReadings(new Date(2026, 11, 8), {
    now: new Date(2026, 11, 8, 10),
  })
  assert.equal(readingSourceFor(dec8), 'annual')
  assert.equal(usesDayReadings(dec8), true)

  const easter = new CopticReadings(new Date(2026, 3, 12), {
    now: new Date(2026, 3, 12, 10),
  })
  assert.equal(readingSourceFor(easter), 'holy_fifties')
  assert.equal(usesDayReadings(easter), false)

  const sun = new CopticReadings(new Date(2026, 6, 19), {
    now: new Date(2026, 6, 19, 10),
  })
  if (sun.isSunday) {
    assert.equal(readingSourceFor(sun), 'sunday')
    assert.equal(usesDayReadings(sun), false)
  }

  assert.ok(findAnnualWeekdayForSlot('Hator', 29))
})

test('29 Hator: memory feast tune vs 29_Hator citations', () => {
  const hator29 = new CopticReadings(new Date(2026, 11, 8), {
    now: new Date(2026, 11, 8, 10),
  })
  assert.equal(hator29.copticDay, 29)
  assert.equal(hator29.copticMonth, 'Hator')
  assert.equal(hator29.feast.name, 'memory_of_3_feasts_hator')
  assert.equal(hator29.feast.tune, 'joy')
  assert.equal(hator29.readingReference.ref?.liturgy?.gospel, 'Matthew 16:13-19')

  const baramhat29 = new CopticReadings(new Date(2026, 3, 7), {
    now: new Date(2026, 3, 7, 10),
  })
  assert.equal(baramhat29.feast.name, 'annunciation')
  assert.equal(baramhat29.readingReference.ref?.liturgy?.gospel, 'Luke 1:26-38')
})

test('Nasie Sunday: one Sunday per year uses day_readings (Katameros)', () => {
  const nasie1Sun = new CopticReadings(new Date(2026, 8, 6), {
    now: new Date(2026, 8, 6, 10),
  })
  assert.equal(nasie1Sun.copticMonth, 'Nasie')
  assert.equal(nasie1Sun.copticDay, 1)
  assert.equal(nasie1Sun.isSunday, true)
  assert.equal(readingSourceFor(nasie1Sun), 'sunday')
  assert.equal(nasie1Sun.readingReference.ref?.liturgy?.gospel, 'John 21:15-25')

  const nasie5Sun = new CopticReadings(new Date(2017, 8, 10), {
    now: new Date(2017, 8, 10, 10),
  })
  assert.equal(nasie5Sun.copticDay, 5)
  assert.equal(nasie5Sun.isSunday, true)
  assert.equal(nasie5Sun.readingReference.ref?.liturgy?.gospel, 'John 16:20-33')
})

test('transferred 29th: keeps memory_of_3_feasts', () => {
  let tout29 = null
  for (let m = 0; m < 12; m++) {
    for (let d = 1; d <= 31; d++) {
      const day = new CopticReadings(new Date(2026, m, d), {
        now: new Date(2026, m, d, 10),
      })
      if (day.copticMonth === 'Tout' && day.copticDay === 29) {
        tout29 = day
        break
      }
    }
    if (tout29) break
  }
  assert.ok(tout29)
  assert.equal(tout29.feast.name, 'memory_of_3_feasts_tout')
})

test('CJS require works', () => {
  const require = createRequire(import.meta.url)
  const { CopticReadings: CjsReadings } = require('../dist/index.cjs')
  const day = new CjsReadings(new Date(2026, 3, 12), { now: new Date(2026, 3, 12, 10) })
  assert.equal(day.feast.name, 'resurrection')
})
