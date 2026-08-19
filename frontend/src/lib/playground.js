import { toUnicode } from 'coptic-antonios-unicode'
import { guessCoptic, pronounce, toCoptic } from 'coptic-pronounce'

export const DEMOS = [
  {
    id: 'antonios',
    label: 'coptic-antonios-unicode',
    blurb: 'Antonios Latin keyboard text → Coptic Unicode.',
  },
  {
    id: 'pronounce',
    label: 'coptic-pronounce',
    blurb: 'Coptic Unicode → English / Arabic phonetics (also reverse guess).',
  },
  {
    id: 'together',
    label: 'Together',
    blurb: 'Antonios → Unicode → pronounce EN/AR.',
  },
]

export const FORMATS = [
  { id: 'mjs', label: '.mjs', ext: 'mjs' },
  { id: 'cjs', label: '.cjs', ext: 'cjs' },
]

const SNIPPETS = {
  antonios: {
    mjs: `import { toUnicode } from 'coptic-antonios-unicode';

const unicode = toUnicode('amyn');
console.log(unicode);`,
    cjs: `const { toUnicode } = require('coptic-antonios-unicode');

const unicode = toUnicode('amyn');
console.log(unicode);`,
  },
  pronounce: {
    mjs: `import { pronounce, guessCoptic } from 'coptic-pronounce';

console.log(pronounce('ⲁⲙⲏⲛ', 'en'));
console.log(pronounce('ⲁⲙⲏⲛ', 'ar'));

const guess = guessCoptic('Epshois', 'en');
console.log(guess.best);
console.log(guess.candidates.slice(0, 3));`,
    cjs: `const { pronounce, guessCoptic } = require('coptic-pronounce');

console.log(pronounce('ⲁⲙⲏⲛ', 'en'));
console.log(pronounce('ⲁⲙⲏⲛ', 'ar'));

const guess = guessCoptic('Epshois', 'en');
console.log(guess.best);
console.log(guess.candidates.slice(0, 3));`,
  },
  together: {
    mjs: `import { toUnicode } from 'coptic-antonios-unicode';
import { pronounce } from 'coptic-pronounce';

const unicode = toUnicode('amyn');
console.log('Unicode:', unicode);
console.log('EN:', pronounce(unicode, 'en'));
console.log('AR:', pronounce(unicode, 'ar'));`,
    cjs: `const { toUnicode } = require('coptic-antonios-unicode');
const { pronounce } = require('coptic-pronounce');

const unicode = toUnicode('amyn');
console.log('Unicode:', unicode);
console.log('EN:', pronounce(unicode, 'en'));
console.log('AR:', pronounce(unicode, 'ar'));`,
  },
}

export function getSnippet(demoId, formatId) {
  return SNIPPETS[demoId]?.[formatId] ?? SNIPPETS.antonios.mjs
}

function formatValue(value) {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

/** Strip import/require so the body can run with injected APIs. */
export function prepareSource(source) {
  let body = source
    .replace(/^\s*import\s+.+?\s+from\s+['"][^'"]+['"]\s*;?\s*$/gm, '')
    .replace(/^\s*const\s+\{[^}]+\}\s*=\s*require\(['"][^'"]+['"]\)\s*;?\s*$/gm, '')
    .trim()

  const mainWrapped = body.match(
    /^async\s+function\s+main\s*\(\s*\)\s*\{([\s\S]*)\}\s*(?:main\s*\(\s*\)\s*;?\s*)?$/,
  )
  if (mainWrapped) body = mainWrapped[1].trim()

  return body
}

export async function runPlayground(source) {
  const lines = []
  const fakeConsole = {
    log(...args) {
      lines.push(args.map(formatValue).join(' '))
    },
    info(...args) {
      lines.push(args.map(formatValue).join(' '))
    },
    warn(...args) {
      lines.push(`[warn] ${args.map(formatValue).join(' ')}`)
    },
    error(...args) {
      lines.push(`[error] ${args.map(formatValue).join(' ')}`)
    },
  }

  const body = prepareSource(source)
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

  try {
    const fn = new AsyncFunction(
      'toUnicode',
      'pronounce',
      'guessCoptic',
      'toCoptic',
      'console',
      `"use strict";\n${body}`,
    )
    await fn(toUnicode, pronounce, guessCoptic, toCoptic, fakeConsole)
    return {
      ok: true,
      output: lines.length ? lines.join('\n\n') : '(no console output)',
    }
  } catch (err) {
    return {
      ok: false,
      output: err?.stack || err?.message || String(err),
    }
  }
}
