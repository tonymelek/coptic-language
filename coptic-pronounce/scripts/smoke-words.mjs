#!/usr/bin/env node
/**
 * Must-pass Bohairic word smoke tests (not full hymn lines).
 * Run after build: node scripts/smoke-words.mjs
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distPath = path.join(root, 'dist', 'index.cjs');
if (!fs.existsSync(distPath)) {
  console.error('Missing dist/. Run npm run build first.');
  process.exit(1);
}
const { pronounce } = createRequire(import.meta.url)(distPath);

/** [coptic, expected English] — normalized compare (lower, no hyphens) */
const CASES = [
  ['Ⲡ̀ϭⲟⲓⲥ', 'Epshois'],
  ['ⲉ̀Ⲡ̀ϭⲟⲓⲥ', 'e-Epshois'],
  ['ⲉ̀ⲡ̀ϣⲱⲓ', 'e-epshoi'],
  ['ⲛ̀ⲧⲉ', 'ente'],
  ['ⲛ̀ϫⲉ', 'enje'],
  ['ϧⲉⲛ', 'khen'],
  ['ⲟⲩⲟϩ', 'owoh'],
  ['Ⲇⲟⲝⲁ', 'Zoxa'],
  ['ⲇⲉ', 'ze'],
  ['ϣⲏⲣⲓ', 'shiri'],
  ['ⲯⲩⲭⲏ', 'epsishi'],
  ['ⲛⲓϫⲟⲙ', 'nigom'],
  ['Ⲫ̀ⲛⲟⲩϯ', 'Efnouti'],
  ['ⲟⲩⲓ', 'owi'],
  ['ⲟⲩⲱ̀ⲟⲩ', 'ou-ow-ou'],
  // efiom and efyom are interchangeable (same pronunciation)
  ['ⲫ̀ⲓⲟⲙ', 'efiom'],
  ['ⲅⲁⲣ', 'ghar'],
  ['ⲭ̅ⲉ̅', 'Shere ne Maria'],
  ['ⲭⲉⲣⲉ', 'Shere'],
  ['Ⲡⲭ̅ⲥ̅', 'Pikhrestos'],
  ['Ⲓⲏ̅ⲥ̅', 'Isous'],
  ['ⲁ̅ⲗ̅', 'Allelouia'],
  ['ⲡⲉⲛⲟ̅ⲥ̅', 'Penchois'],
  ['ⲟ̅ⲥ̅', 'chois'],
];

/** Arabic must-pass cases — orthography-normalized compare */
const AR_CASES = [
  ['Ⲡ̀ϭⲟⲓⲥ', 'إبشويس'],
  ['ⲉ̀Ⲡ̀ϭⲟⲓⲥ', 'إى إبشويس'],
  ['ⲉ̀ⲡ̀ϣⲱⲓ', 'إى إبشوي'],
  ['ⲛ̀ⲧⲉ', 'إنتي'],
  ['ⲛ̀ϫⲉ', 'إنجي'],
  ['ϧⲉⲛ', 'خين'],
  ['ⲟⲩⲟϩ', 'أووه'],
  ['Ⲇⲟⲝⲁ', 'ذوكسا'],
  ['ⲯⲩⲭⲏ', 'بسيكي'],
  ['ⲫ̀ⲓⲟⲙ', 'إفيوم'],
  ['ⲙ̀ⲡⲉⲕⲥ̀ⲧⲁⲩⲣⲟⲥ', 'إمبيك إستافروس'],
  ['ⲕ̀ⲥ̀ⲙⲁⲣⲱⲟⲩⲧ', 'إك إسماروؤت'],
  ['Ⲡⲓⲭ̀ⲣⲓⲥⲧⲟⲥ', 'بي اخرستوس'],
  ['ⲙ̀Ⲡⲓⲭ̀ⲣⲓⲥⲧⲟⲥ', 'إمبي اخرستوس'],
  ['ⲙ̀ⲡⲉⲕⲙ̀ⲑⲟ', 'إمبيك إمثو'],
  ['ⲉϥⲥ̀ⲧⲁⲩⲣⲟⲥ', 'إف إستافروس'],
  ['ⲭ̅ⲉ̅', 'شيرى نى ماريا'],
  ['ⲭⲉⲣⲉ', 'شيرى'],
  ['Ⲡⲭ̅ⲥ̅', 'بي اخرستوس'],
  ['Ⲓⲏ̅ⲥ̅', 'إيسوس'],
  ['ⲁ̅ⲗ̅', 'الليلويا'],
  ['ⲡⲉⲛⲟ̅ⲥ̅', 'بين شويس'],
  ['ⲟ̅ⲥ̅', 'شويس'],
];

function normEn(s) {
  return s
    .toLowerCase()
    .replace(/-/g, '')
    .replace(/y/g, 'i')
    .replace(/\s+/g, '');
}

function normAr(s) {
  return String(s)
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ڤ/g, 'ف')
    .replace(/\s+/g, '');
}

let failed = 0;
console.log('--- English ---');
for (const [coptic, expected] of CASES) {
  const got = pronounce(coptic, 'en');
  const ok = normEn(got) === normEn(expected);
  if (!ok) {
    failed++;
    console.log(`FAIL ${coptic}\n  got: ${got}\n  exp: ${expected}`);
  } else {
    console.log(`ok   ${coptic} → ${got}`);
  }
}

console.log('\n--- Arabic ---');
for (const [coptic, expected] of AR_CASES) {
  const got = pronounce(coptic, 'ar');
  const ok = normAr(got) === normAr(expected);
  if (!ok) {
    failed++;
    console.log(`FAIL ${coptic}\n  got: ${got}\n  exp: ${expected}`);
  } else {
    console.log(`ok   ${coptic} → ${got}`);
  }
}

const total = CASES.length + AR_CASES.length;
console.log(failed ? `\n${failed}/${total} failed` : `\n${total}/${total} passed`);
process.exit(failed ? 1 : 0);
