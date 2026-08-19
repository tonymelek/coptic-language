#!/usr/bin/env node
/**
 * Smoke tests for reverse guess engine (Latin/Arabic → Coptic).
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
const { guessCoptic, toCoptic, pronounce } = createRequire(import.meta.url)(distPath);

function normCoptic(s) {
  return String(s).normalize('NFC').replace(/\s+/g, '');
}

const CASES = [
  ['Epshois', 'en', 'Ⲡ̀ϭⲟⲓⲥ'],
  ['epshois', 'en', 'Ⲡ̀ϭⲟⲓⲥ'],
  ['إبشويس', 'ar', 'Ⲡ̀ϭⲟⲓⲥ'],
  ['Efnouti', 'en', 'Ⲫ̀ⲛⲟⲩϯ'],
  ['افنوتي', 'ar', 'Ⲫ̀ⲛⲟⲩϯ'],
  ['Shere ne Maria', 'en', 'ⲭ̅ⲉ̅'],
  ['شيرى نى ماريا', 'ar', 'ⲭ̅ⲉ̅'],
  ['Pikhrestos', 'en', 'Ⲡⲭ̅ⲥ̅'],
  ['Isous', 'en', 'Ⲓⲏ̅ⲥ̅'],
  ['بيخرستوس', 'ar', 'Ⲡⲭ̅ⲥ̅'],
  ['إيسوس', 'ar', 'Ⲓⲏ̅ⲥ̅'],
  ['Zoxa', 'en', 'Ⲇⲟⲝⲁ'],
  ['ذوكسا', 'ar', 'Ⲇⲟⲝⲁ'],
  ['Shere', 'en', 'ⲭⲉⲣⲉ'],
  ['khen', 'en', 'ϧⲉⲛ'],
  ['owoh', 'en', 'ⲟⲩⲟϩ'],
  ['ente', 'en', 'ⲛ̀ⲧⲉ'],
];

let failed = 0;
console.log('--- guessCoptic ---');
for (const [input, lang, expected] of CASES) {
  const { best, candidates } = guessCoptic(input, lang);
  const ok =
    normCoptic(best) === normCoptic(expected) ||
    candidates.some((c) => normCoptic(c.coptic) === normCoptic(expected));
  if (!ok) {
    failed++;
    console.log(`FAIL ${lang} "${input}"\n  best: ${best}\n  exp:  ${expected}\n  alts: ${candidates.map((c) => c.coptic).join(' | ')}`);
  } else {
    console.log(`ok   ${lang} "${input}" → ${best}`);
  }
}

// Round-trip soft check on a few Coptic words
console.log('\n--- round-trip (EN) ---');
const RT = ['Ⲡ̀ϭⲟⲓⲥ', 'ϧⲉⲛ', 'ⲟⲩⲟϩ', 'Ⲇⲟⲝⲁ', 'ⲭⲉⲣⲉ'];
for (const c of RT) {
  const en = pronounce(c, 'en');
  const back = toCoptic(en, 'en');
  const ok = normCoptic(back) === normCoptic(c) || guessCoptic(en, 'en').candidates.some((x) => normCoptic(x.coptic) === normCoptic(c));
  if (!ok) {
    failed++;
    console.log(`FAIL RT ${c} → ${en} → ${back}`);
  } else {
    console.log(`ok   ${c} → ${en} → ${back}`);
  }
}

console.log(failed ? `\n${failed} failed` : `\n${CASES.length + RT.length} checks passed`);
process.exit(failed ? 1 : 0);
