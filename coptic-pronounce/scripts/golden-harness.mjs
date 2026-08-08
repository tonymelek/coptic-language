#!/usr/bin/env node
/**
 * Golden-file harness for coptic-pronounce.
 *
 * Compares package output to trusted liturgical `copticEnglish` / `arabicCoptic`
 * fields in fixture JSON hymn files.
 *
 * Usage:
 *   node scripts/golden-harness.mjs
 *   node scripts/golden-harness.mjs --lang en
 *   node scripts/golden-harness.mjs --verbose
 *   node scripts/golden-harness.mjs --min-score 0.75
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

// Prefer built dist; fall back note if missing
const distPath = path.join(root, 'dist', 'index.cjs');
if (!fs.existsSync(distPath)) {
  console.error('Missing dist/. Run `npm run build` first.');
  process.exit(1);
}
const { pronounce } = require(distPath);

const FIXTURES_DIR = path.join(root, 'fixtures');

const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');
const langArg = args.find((a) => a.startsWith('--lang='))?.split('=')[1]
  ?? (args.includes('--lang') ? args[args.indexOf('--lang') + 1] : 'en');
const minScore = Number(
  args.find((a) => a.startsWith('--min-score='))?.split('=')[1]
  ?? (args.includes('--min-score') ? args[args.indexOf('--min-score') + 1] : '0'),
);

/**
 * English compare form: ignore case, punct, hyphens, and phonetic spellings
 * that sound the same in liturgical use (efiom ≈ efyom → collapse y→i).
 */
function normalizeEn(s) {
  return String(s)
    .replace(/^\+\s*/, '')
    .toLowerCase()
    .replace(/[.,:;!?()'"""'']/g, '')
    .replace(/-/g, '')
    .replace(/y/g, 'i') // efiom / efyom, oyni / oini, etc.
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Arabic compare form: collapse orthographic variants that sound the same,
 * and ignore spaces (goldens insert reading spaces; engine often does not).
 * أ/إ/آ/ا, ى/ي, ؤ/و, ئ/ي, ة/ه, ڤ/ف
 */
function normalizeAr(s) {
  return String(s)
    .replace(/^\+\s*/, '')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '') // tashkeel + tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ڤ/g, 'ف')
    .replace(/[.,:;!?()]/g, '')
    .replace(/\s+/g, '') // space-insensitive
    .trim();
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return dp[n];
}

function similarity(a, b) {
  if (a === b) return 1;
  if (!a.length && !b.length) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / Math.max(a.length, b.length);
}

function loadFixtures() {
  return fs
    .readdirSync(FIXTURES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({
      file: f,
      data: JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, f), 'utf8')),
    }));
}

function expectedField(lang) {
  return lang === 'ar' || lang === 'arabic' ? 'arabicCoptic' : 'copticEnglish';
}

function normalize(s, lang) {
  return lang === 'ar' || lang === 'arabic' ? normalizeAr(s) : normalizeEn(s);
}

function run() {
  const lang = langArg === 'arabic' ? 'ar' : langArg === 'english' ? 'en' : langArg;
  const field = expectedField(lang);
  const fixtures = loadFixtures();

  let total = 0;
  let exact = 0;
  let softExact = 0; // normalized equal
  let sumSim = 0;
  const failures = [];

  for (const { file, data } of fixtures) {
    const source = data.coptic ?? [];
    const expectedArr = data[field] ?? [];
    console.log(`\n=== ${data.name ?? file} (${file}) ===`);

    for (let i = 0; i < source.length; i++) {
      const coptic = source[i];
      const expected = expectedArr[i];
      if (expected == null || expected === '') continue;

      total++;
      let got;
      try {
        got = pronounce(String(coptic).replace(/^\+\s*/, ''), lang);
      } catch (err) {
        failures.push({ file, i, err: err.message, coptic, expected });
        if (verbose) console.log(`#${i} ERROR ${err.message}`);
        continue;
      }

      const nGot = normalize(got, lang);
      const nExp = normalize(expected, lang);
      const sim = similarity(nGot, nExp);
      sumSim += sim;

      if (got.trim() === String(expected).replace(/^\+\s*/, '').trim()) exact++;
      if (nGot === nExp) {
        softExact++;
        if (verbose) console.log(`#${i} OK sim=1.00`);
      } else {
        failures.push({ file, i, got, expected, sim, nGot, nExp });
        if (verbose || sim < 0.85) {
          console.log(
            `#${i} sim=${sim.toFixed(3)}\n  got: ${got}\n  exp: ${expected}`,
          );
        }
      }
    }
  }

  const avgSim = total ? sumSim / total : 0;
  console.log('\n--- summary ---');
  console.log(`lang:          ${lang}`);
  console.log(`lines:         ${total}`);
  console.log(`exact:         ${exact}/${total}`);
  console.log(`normalized:    ${softExact}/${total}`);
  console.log(`avg similarity:${avgSim.toFixed(4)}`);
  console.log(`mismatches:    ${failures.filter((f) => f.sim != null).length}`);

  if (avgSim < minScore) {
    console.error(`\nFAIL: avg similarity ${avgSim.toFixed(4)} < --min-score ${minScore}`);
    process.exit(1);
  }
  console.log('\nPASS');
}

run();
