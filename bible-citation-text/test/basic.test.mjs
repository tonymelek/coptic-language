import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test from 'node:test'
import {
  clearBibleCache,
  getBibleText,
  parseCitation,
} from '../dist/index.mjs'

test('parseCitation: compact range', () => {
  assert.deepEqual(parseCitation('psalm122:5-6'), {
    book: 'Psalms',
    ranges: [{ chapter: 122, from: 5, to: 6 }],
  })
})

test('parseCitation: discrete verses with commas', () => {
  assert.deepEqual(parseCitation('Psalms 145:3,6'), {
    book: 'Psalms',
    ranges: [
      { chapter: 145, from: 3, to: 3 },
      { chapter: 145, from: 6, to: 6 },
    ],
  })
})

test('parseCitation: spaced katamaros style', () => {
  assert.deepEqual(parseCitation('Psalms 127:1'), {
    book: 'Psalms',
    ranges: [{ chapter: 127, from: 1, to: 1 }],
  })
})

test('parseCitation: cross chapter', () => {
  assert.deepEqual(parseCitation('2 Timothy 1:12-2:10'), {
    book: '2 Timothy',
    ranges: [
      { chapter: 1, from: 12, to: null },
      { chapter: 2, from: 1, to: 10 },
    ],
  })
})

test('getBibleText defaults to English only', async () => {
  const text = await getBibleText('Psalms 122:5-6')
  assert.ok(text.en.length > 0)
  assert.equal(text.ar, '')
  assert.equal(text.versesEn.length, 2)
  assert.equal(text.versesAr.length, 0)
})

test('getBibleText langs en+ar', async () => {
  const text = await getBibleText('Psalms 145:3,6', {
    langs: ['en', 'ar'],
    cache: true,
  })
  assert.equal(text.versesEn.length, 2)
  assert.equal(text.versesAr.length, 2)
  assert.ok(text.ar.length > 0)
})

test('cache reuses chapter fetches across calls', async () => {
  clearBibleCache()
  const cache = new Map()
  const first = await getBibleText('Psalms 122:5', { langs: ['en'], cache })
  const second = await getBibleText('Psalms 122:6', { langs: ['en'], cache })
  assert.ok(first.en.length > 0)
  assert.ok(second.en.length > 0)
  assert.equal(cache.size, 1)
})

test('getBibleText string[] returns map keyed by input refs', async () => {
  const refs = ['Psalms 122:5-6', 'Matthew 1:1']
  const map = await getBibleText(refs, { langs: ['en'], cache: true })
  assert.deepEqual(Object.keys(map), refs)
  assert.ok(map['Psalms 122:5-6'].versesEn.length === 2)
  assert.ok(map['Matthew 1:1'].en.length > 0)
})

test('CJS require works', () => {
  const require = createRequire(import.meta.url)
  const { parseCitation: cjsParse } = require('../dist/index.cjs')
  assert.equal(cjsParse('John 3:16').book, 'John')
})
